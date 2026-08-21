from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    jsonify,
    send_file
)

import os
import psycopg2
import psycopg2.extras
import json


from datetime import datetime
from functools import wraps

from werkzeug.security import generate_password_hash, check_password_hash

from playwright.sync_api import sync_playwright
from io import BytesIO




app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY", "CHANGE_THIS_SECRET_KEY")


@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response


DATABASE_URL = "postgresql://postgres.vubgomgwhgvjjuhpcxdc:atena.aryafard@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# =========================================================
# DATABASE
# =========================================================

class DBConnection:

    def __init__(self):
        self.conn = psycopg2.connect(DATABASE_URL)

    def execute(self, query, params=()):
        query = query.replace("?", "%s")
        cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        return cur

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


def get_db():
    return DBConnection()


def init_db():

    conn = get_db()
    cursor = conn.conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coaches (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            monthly_limit INTEGER DEFAULT 30,
            monthly_used INTEGER DEFAULT 0,
            usage_month TEXT,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS programs (
            id SERIAL PRIMARY KEY,
            coach_id INTEGER NOT NULL,
            athlete_name TEXT,
            athlete_age TEXT,
            athlete_height TEXT,
            athlete_weight TEXT,
            athlete_goal TEXT,
            athlete_gender TEXT,
            program_name TEXT,
            program_data TEXT,
            notes TEXT,
            created_at TEXT,
            FOREIGN KEY(coach_id) REFERENCES coaches(id)
        )
    """)

    cursor.execute("""
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS athlete_gender TEXT
    """)

    conn.commit()
    conn.close()


# =========================================================
# LOGIN REQUIRED
# =========================================================

def login_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):
        if "coach_id" not in session:
            return redirect(url_for("login"))
        return function(*args, **kwargs)

    return wrapper


# =========================================================
# MONTHLY USAGE
# =========================================================

def reset_monthly_usage(coach):

    current_month = datetime.now().strftime("%Y-%m")

    if coach["usage_month"] != current_month:

        conn = get_db()

        conn.execute("""
            UPDATE coaches
            SET monthly_used = 0, usage_month = ?
            WHERE id = ?
        """, (current_month, coach["id"]))

        conn.commit()

        coach = conn.execute("""
            SELECT * FROM coaches WHERE id = ?
        """, (coach["id"],)).fetchone()

        conn.close()

    return coach


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    if "coach_id" in session:
        return redirect(url_for("planner"))
    return redirect(url_for("login"))


# =========================================================
# REGISTER
# =========================================================

@app.route("/register", methods=["GET", "POST"])
def register():

    error = None

    if request.method == "POST":

        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not name or not email or not password:
            error = "همه فیلدها را تکمیل کنید."
            return render_template("register.html", error=error)

        if len(password) < 8:
            error = "رمز عبور باید حداقل ۸ کاراکتر باشد."
            return render_template("register.html", error=error)

        conn = get_db()

        try:

            conn.execute("""
                INSERT INTO coaches
                (name, email, password, monthly_limit, monthly_used, usage_month, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                name,
                email,
                generate_password_hash(password),
                30,
                0,
                datetime.now().strftime("%Y-%m"),
                datetime.now().isoformat()
            ))

            conn.commit()

        except Exception:

            conn.rollback()
            conn.close()
            error = "این ایمیل قبلاً ثبت شده است."
            return render_template("register.html", error=error)

        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html", error=error)


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    error = None

    if "coach_id" in session:
        return redirect(url_for("planner"))

    if request.method == "POST":

        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        conn = get_db()

        coach = conn.execute("""
            SELECT * FROM coaches WHERE email = ?
        """, (email,)).fetchone()

        conn.close()

        if not coach or not check_password_hash(coach["password"], password):
            error = "ایمیل یا رمز عبور اشتباه است."
            return render_template("login.html", error=error)

        session["coach_id"] = coach["id"]
        session["coach_name"] = coach["name"]

        return redirect(url_for("planner"))

    return render_template("login.html", error=error)


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# =========================================================
# PLANNER
# =========================================================

@app.route("/planner")
@login_required
def planner():

    conn = get_db()

    coach = conn.execute("""
        SELECT * FROM coaches WHERE id = ?
    """, (session["coach_id"],)).fetchone()

    conn.close()

    coach = reset_monthly_usage(coach)

    remaining = max(0, coach["monthly_limit"] - coach["monthly_used"])

    return render_template("planner.html", coach=coach, remaining=remaining)


# =========================================================
# GET PROGRAM HISTORY
# =========================================================

@app.route("/api/programs")
@login_required
def get_programs():

    conn = get_db()

    programs = conn.execute("""
        SELECT id, athlete_name, program_name, created_at
        FROM programs
        WHERE coach_id = ?
        ORDER BY id DESC
    """, (session["coach_id"],)).fetchall()

    conn.close()

    return jsonify([dict(program) for program in programs])


# =========================================================
# GET ONE PROGRAM
# =========================================================

@app.route("/api/program/<int:program_id>", methods=["GET"])
@login_required
def get_program(program_id):

    conn = get_db()

    program = conn.execute("""
        SELECT * FROM programs
        WHERE id = ? AND coach_id = ?
    """, (program_id, session["coach_id"])).fetchone()

    conn.close()

    if not program:
        return jsonify({"success": False, "message": "برنامه پیدا نشد."}), 404

    data = dict(program)

    try:
        data["program_data"] = json.loads(data["program_data"])
    except:
        data["program_data"] = []

    return jsonify({"success": True, "program": data})


# =========================================================
# SAVE PROGRAM
# =========================================================

@app.route("/api/program", methods=["POST"])
@login_required
def save_program():

    conn = get_db()

    coach = conn.execute("""
        SELECT * FROM coaches WHERE id = ?
    """, (session["coach_id"],)).fetchone()

    conn.close()

    coach = reset_monthly_usage(coach)

    remaining = coach["monthly_limit"] - coach["monthly_used"]

    if remaining <= 0:
        return jsonify({
            "success": False,
            "message": "سهمیه ساخت برنامه این ماه شما تمام شده است."
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "اطلاعات برنامه دریافت نشد."}), 400

    if not data.get("athlete_name"):
        return jsonify({"success": False, "message": "نام ورزشکار را وارد کنید."}), 400

    if not data.get("program_name"):
        return jsonify({"success": False, "message": "نام برنامه را وارد کنید."}), 400

    days = data.get("days", [])

    if not days:
        return jsonify({"success": False, "message": "حداقل یک روز تمرین انتخاب کنید."}), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO programs
        (coach_id, athlete_name, athlete_age, athlete_height, athlete_weight,
         athlete_goal,athlete_gender, program_name, program_data, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        coach["id"],
        data.get("athlete_name", ""),
        data.get("athlete_age", ""),
        data.get("athlete_height", ""),
        data.get("athlete_weight", ""),
        data.get("athlete_goal", ""),
        data.get("athlete_gender", ""),
        data.get("program_name", ""),
        json.dumps(days, ensure_ascii=False),
        data.get("notes", ""),
        datetime.now().isoformat()
    ))

    conn.execute("""
        UPDATE coaches
        SET monthly_used = monthly_used + 1
        WHERE id = ?
    """, (coach["id"],))

    conn.commit()
    conn.close()

    return jsonify({"success": True, "remaining": remaining - 1})


# =========================================================
# DELETE PROGRAM
# =========================================================

@app.route("/api/program/<int:program_id>", methods=["DELETE"])
@login_required
def delete_program(program_id):

    conn = get_db()

    result = conn.execute("""
        DELETE FROM programs
        WHERE id = ? AND coach_id = ?
    """, (program_id, session["coach_id"]))

    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({"success": False, "message": "برنامه پیدا نشد."}), 404

    return jsonify({"success": True, "message": "برنامه حذف شد."})


# =========================================================
# PDF EXPORT
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
        html_content = data["html"]

        # ==========================================
        # مسیر فونت
        # ==========================================

        font_path = os.path.join(
            os.path.dirname(__file__),
            "static",
            "font",
            "font",
            "Vazirmatn-Regular.ttf"
        )

        if not os.path.exists(font_path):
            return jsonify({
                "success": False,
                "message": f"فونت پیدا نشد: {font_path}"
            }), 500

        # ==========================================
        # مسیر CSS مخصوص PDF
        # ==========================================

        pdf_css_path = os.path.join(
            os.path.dirname(__file__),
            "static",
            "pdf_style.css"
        )

        if not os.path.exists(pdf_css_path):
            return jsonify({
                "success": False,
                "message": f"فایل PDF CSS پیدا نشد: {pdf_css_path}"
            }), 500

        with open(pdf_css_path, "r", encoding="utf-8") as f:
            css_content = f.read()

        # ==========================================
        # HTML نهایی
        # ==========================================

       
        full_html = f"""
<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>

    <meta charset="UTF-8">

    <style>

        @font-face {{
            font-family: "Vazirmatn";
            src: url("{font_uri}") format("truetype");
            font-weight: 400;
            font-style: normal;
        }}

        html {{
            direction: rtl;
        }}

        body {{
            direction: rtl;
            font-family: "Vazirmatn", sans-serif;
        }}

        {css_content}

    </style>

</head>

<body>

    {html_content}

</body>

</html>
"""

        # ==========================================
        # ساخت PDF با Playwright
        # ==========================================

        pdf_buffer = BytesIO()
                
        with sync_playwright() as p:

          
            browser = p.chromium.launch(
                headless=True,
                channel="chromium",
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage"
                ]
            )

            page = browser.new_page()

            page.set_content(
                full_html,
                wait_until="networkidle"
            )

            # صبر برای بارگذاری کامل فونت
            page.evaluate("""
                async () => {
                    await document.fonts.ready;
                }
            """)

            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
                margin={
                    "top": "12mm",
                    "right": "12mm",
                    "bottom": "12mm",
                    "left": "12mm"
                }
            )

            browser.close()

        # ==========================================
        # آماده‌سازی فایل
        # ==========================================

        pdf_buffer.write(pdf_bytes)
        pdf_buffer.seek(0)

        # ==========================================
        # ارسال PDF
        # ==========================================

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="program.pdf"
        )

    except Exception as e:

        print("PDF ERROR:", repr(e))

        return jsonify({
            "success": False,
            "message": f"خطا در ساخت PDF: {str(e)}"
        }), 500


# =========================================================
# START
# =========================================================

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
