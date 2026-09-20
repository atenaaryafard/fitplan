# =========================================================
# این‌ها را داخل app.py merge کن (جایگزین کل فایل نکن).
#
# پیش‌نیاز تغییرات فرانت‌اند:
#   1) فایل static/program-render.js را اضافه کن (از پیام قبلی).
#   2) از script.js توابع escapeHTML, calculateBMI,
#      buildBrandHeaderHTML, buildBrandFooterHTML,
#      buildProgramPreviewHTML و ثابت BMI_GUIDE_BASE64 را
#      حذف کن (چون به program-render.js منتقل شدند) تا
#      دوبار تعریف نشوند.
#   3) در planner.html، قبل از تگ script.js همین‌ها را اضافه کن:
#        <script src="{{ url_for('static', filename='logo-data.js') }}"></script>
#        <script src="{{ url_for('static', filename='exercises.js') }}"></script>
#        <script src="{{ url_for('static', filename='program-render.js') }}"></script>
#        <script src="{{ url_for('static', filename='script.js') }}"></script>
#      (logo-data.js و exercises.js از قبل هم بودند، فقط ترتیب مهم است:
#       program-render.js باید قبل از script.js لود شود)
# =========================================================


# =========================================================
# 1) رفکتور PDF: منطق ساخت PDF از app.py فعلی به یک تابع
# مشترک منتقل شد تا هم روت مربی (لاگین‌شده) و هم روت عمومی
# شاگرد (بدون لاگین) از همان منطق استفاده کنند.
#
# این تابع را جای منطق داخل try بلوک export_program_pdf فعلی
# قرار بده (همان کدی که با sync_playwright شروع می‌شود)
# =========================================================

def generate_program_pdf_response(coach, html_content):
    """
    coach: دیکشنری ردیف coaches (از دیتابیس)
    html_content: رشتهٔ HTML پیش‌نمایش (همان چیزی که فرانت‌اند می‌فرستد)
    خروجی: (flask Response یا None, error_dict یا None)
    """

    plan = get_active_plan(coach)
    is_basic = (not plan) or (plan["plan_key"] == "basic")

    if is_basic:
        soup = BeautifulSoup(html_content, "html.parser")
        for class_name in ["preview-size-boxes", "bmi-box", "sizes-box"]:
            for tag in soup.find_all(class_=class_name):
                tag.decompose()
        html_content = str(soup)

    pdf_style_filename = get_pdf_style_filename(coach)

    base_dir = os.path.dirname(os.path.abspath(__file__))

    font_path = os.path.join(base_dir, "static", "font", "Vazirmatn-Regular.ttf")

    if not os.path.isfile(font_path):
        return None, {"success": False, "message": f"فونت پیدا نشد: {font_path}"}

    with open(font_path, "rb") as font_file:
        font_base64 = base64.b64encode(font_file.read()).decode("utf-8")

    pdf_css_path = os.path.join(base_dir, "static", pdf_style_filename)

    if not os.path.isfile(pdf_css_path):
        return None, {"success": False, "message": f"فایل PDF CSS پیدا نشد: {pdf_css_path}"}

    with open(pdf_css_path, "r", encoding="utf-8") as css_file:
        css_content = css_file.read()

    full_html = f"""
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {{
            font-family: "Vazirmatn";
            src: url("data:font/ttf;base64,{font_base64}") format("truetype");
            font-weight: 400;
            font-style: normal;
            font-display: block;
        }}
        html {{ direction: rtl; }}
        body {{ direction: rtl; font-family: "Vazirmatn", sans-serif; }}
        {css_content}
    </style>
</head>
<body>
    {html_content}
</body>
</html>
"""

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )

        page = browser.new_page()
        page.set_content(full_html, wait_until="load")
        page.evaluate("async () => { await document.fonts.ready; }")

        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "12mm", "right": "12mm", "bottom": "12mm", "left": "12mm"}
        )

        browser.close()

    pdf_buffer = BytesIO()
    pdf_buffer.write(pdf_bytes)
    pdf_buffer.seek(0)

    response = send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="program.pdf"
    )

    return response, None


# =========================================================
# 2) export_program_pdf فعلی (مربی، لاگین‌شده) را با این
# جایگزین کن — فقط try بلوکش کوچک‌تر شده چون منطق مشترک
# رفت توی تابع بالا
# =========================================================

@app.route("/api/program/pdf", methods=["POST"])
@login_required
def export_program_pdf():

    data = request.get_json()

    if not data or not data.get("html"):
        return jsonify({
            "success": False,
            "message": "محتوایی برای تبدیل به PDF ارسال نشده است."
        }), 400

    try:

        conn = get_db()
        coach = conn.execute("""
            SELECT * FROM coaches WHERE id = ?
        """, (session["coach_id"],)).fetchone()
        conn.close()

        response, error = generate_program_pdf_response(coach, data["html"])

        if error:
            return jsonify(error), 500

        return response

    except Exception as e:
        print("PDF ERROR:", repr(e))
        return jsonify({
            "success": False,
            "message": f"خطا در ساخت PDF: {str(e)}"
        }), 500


# =========================================================
# 3) روت جدید PDF عمومی — برای صفحهٔ شاگرد، بدون لاگین،
# فقط با share_token
# =========================================================

@app.route("/api/program/pdf/shared/<share_token>", methods=["POST"])
def export_shared_program_pdf(share_token):

    data = request.get_json()

    if not data or not data.get("html"):
        return jsonify({
            "success": False,
            "message": "محتوایی برای تبدیل به PDF ارسال نشده است."
        }), 400

    try:

        conn = get_db()

        program = conn.execute("""
            SELECT * FROM programs WHERE share_token = ? AND status = 'sent'
        """, (share_token,)).fetchone()

        if not program:
            conn.close()
            return jsonify({"success": False, "message": "برنامه پیدا نشد."}), 404

        coach = conn.execute("""
            SELECT * FROM coaches WHERE id = ?
        """, (program["coach_id"],)).fetchone()

        conn.close()

        response, error = generate_program_pdf_response(coach, data["html"])

        if error:
            return jsonify(error), 500

        return response

    except Exception as e:
        print("SHARED PDF ERROR:", repr(e))
        return jsonify({
            "success": False,
            "message": f"خطا در ساخت PDF: {str(e)}"
        }), 500


# =========================================================
# 4) get_shared_program_data را با این جایگزین کن — این
# نسخه اطلاعات برند مربی (برای COACH_BRAND در فرانت‌اند) را
# هم برمی‌گرداند
# =========================================================

@app.route("/api/program/shared/<share_token>")
def get_shared_program_data(share_token):

    conn = get_db()

    row = conn.execute("""
        SELECT
            p.*,
            c.name AS coach_name,
            c.job_title,
            c.social_address,
            c.phone_number,
            c.footer_text,
            c.plan_id AS coach_plan_id,
            c.plan_expires_at AS coach_plan_expires_at
        FROM programs p
        JOIN coaches c ON c.id = p.coach_id
        WHERE p.share_token = ? AND p.status = 'sent'
    """, (share_token,)).fetchone()

    conn.close()

    if not row:
        return jsonify({"success": False, "message": "پیدا نشد."}), 404

    data = dict(row)

    try:
        data["program_data"] = json.loads(data["program_data"])
    except Exception:
        data["program_data"] = []

    try:
        data["sizes"] = json.loads(data["sizes"]) if data.get("sizes") else {}
    except Exception:
        data["sizes"] = {}

    # ساخت coach-like dict برای get_active_plan / has_custom_logo
    fake_coach = {
        "plan_id": data.get("coach_plan_id"),
        "plan_expires_at": data.get("coach_plan_expires_at")
    }
    plan = get_active_plan(fake_coach)

    data["has_custom_logo"] = bool(plan and plan["has_custom_logo"])
    data["plan_key"] = plan["plan_key"] if plan else "basic"

    return jsonify({"success": True, "program": data})
