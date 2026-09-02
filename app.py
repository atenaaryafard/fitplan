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
import base64
from bs4 import BeautifulSoup

from PIL import Image
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
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


def get_plan(plan_id):

    conn = get_db()

    plan = conn.execute("""
        SELECT * FROM plans WHERE id = ?
    """, (plan_id,)).fetchone()

    conn.close()

    return plan


def init_db():

    conn = get_db()
    cursor = conn.conn.cursor()

    # =========================================================
    # COACHES
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coaches (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,

            is_admin BOOLEAN DEFAULT FALSE,

            plan_id INTEGER,
            plan_started_at TEXT,
            plan_expires_at TEXT,

            monthly_limit INTEGER DEFAULT 0,
            monthly_used INTEGER DEFAULT 0,
            usage_month TEXT,

            logo_path TEXT,

            created_at TEXT
        )
    """)

    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS plan_id INTEGER")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS plan_started_at TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS plan_expires_at TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS logo_path TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS job_title TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS social_address TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS phone_number TEXT")
    cursor.execute("ALTER TABLE coaches ADD COLUMN IF NOT EXISTS footer_text TEXT")
    cursor.execute("ALTER TABLE programs ADD COLUMN IF NOT EXISTS sizes TEXT")

    # =========================================================
    # PROGRAMS
    # =========================================================

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

    cursor.execute("ALTER TABLE programs ADD COLUMN IF NOT EXISTS athlete_gender TEXT")

    # =========================================================
    # PLANS  (سه پلن ثابت)
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS plans (
            id SERIAL PRIMARY KEY,
            plan_key TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            price TEXT,

            monthly_quota INTEGER,
            duration_days INTEGER,

            has_custom_logo BOOLEAN DEFAULT FALSE,
            has_extra_features BOOLEAN DEFAULT FALSE,

            trial_days INTEGER DEFAULT 3,
            trial_quota INTEGER DEFAULT 3,

            is_active BOOLEAN DEFAULT TRUE
        )
    """)

    # =========================================================
    # TRIALS
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trials (
            id SERIAL PRIMARY KEY,
            coach_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            started_at TEXT,
            expires_at TEXT,
            status TEXT DEFAULT 'active',
            UNIQUE(coach_id, plan_id),
            FOREIGN KEY(coach_id) REFERENCES coaches(id),
            FOREIGN KEY(plan_id) REFERENCES plans(id)
        )
    """)

    # =========================================================
    # ORDERS
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            coach_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            amount TEXT,
            tracking_code TEXT,
            status TEXT DEFAULT 'pending',
            admin_note TEXT,
            created_at TEXT,
            reviewed_at TEXT,
            FOREIGN KEY(coach_id) REFERENCES coaches(id),
            FOREIGN KEY(plan_id) REFERENCES plans(id)
        )
    """)

    conn.commit()

    # =========================================================
    # SEED کردن ۳ پلن (فقط اگر خالی باشه)
    # =========================================================

    cursor.execute("SELECT COUNT(*) FROM plans")
    count = cursor.fetchone()[0]

    if count == 0:

        cursor.execute("""
            INSERT INTO plans
            (plan_key, title, description, price, monthly_quota, duration_days,
             has_custom_logo, has_extra_features, trial_days, trial_quota)
            VALUES
            ('basic', 'پلن ساده', 'ساخت برنامه تمرینی با سهمیه ماهانه', '۲۰۰,۰۰۰ تومان',
             30, 30, FALSE, FALSE, 3, 3),

            ('branded', 'پلن با لوگوی شخصی', 'همه امکانات پایه به‌علاوه درج لوگوی خودتان روی PDF', '۴۵۰,۰۰۰ تومان',
             60, 30, TRUE, FALSE, 3, 3),

            ('premium', 'پلن نامحدود', 'بدون محدودیت زمانی + امکانات ویژه بیشتر', '۹۰۰,۰۰۰ تومان',
             NULL, NULL, TRUE, TRUE, 5, 5)
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

# ==========

def admin_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):
        if "coach_id" not in session:
            return redirect(url_for("login"))

        conn = get_db()
        coach = conn.execute("""
            SELECT * FROM coaches WHERE id = ?
        """, (session["coach_id"],)).fetchone()
        conn.close()

        if not coach or not coach["is_admin"]:
            return "دسترسی غیرمجاز", 403

        return function(*args, **kwargs)

    return wrapper

# ==========

@app.route("/admin/orders")
@admin_required
def admin_orders():

    conn = get_db()

    orders = conn.execute("""
        SELECT o.id, o.coach_id, o.plan_id, o.amount, o.tracking_code,
               o.status, o.created_at, c.name as coach_name, p.title as plan_title
        FROM orders o
        JOIN coaches c ON o.coach_id = c.id
        JOIN plans p ON o.plan_id = p.id
        ORDER BY o.created_at DESC
    """).fetchall()

    conn.close()

    return render_template("admin_orders.html", orders=orders)

# ============

@app.route("/admin/orders/<int:order_id>/approve", methods=["POST"])
@admin_required
def approve_order(order_id):

    conn = get_db()

    order = conn.execute("""
        SELECT * FROM orders WHERE id = ?
    """, (order_id,)).fetchone()

    if not order:
        conn.close()
        return jsonify({"success": False, "message": "سفارش پیدا نشد."}), 404

    if order["status"] != "pending":
        conn.close()
        return jsonify({"success": False, "message": "این سفارش قبلاً بررسی شده است."}), 400

    plan = conn.execute("""
        SELECT * FROM plans WHERE id = ?
    """, (order["plan_id"],)).fetchone()

    now = datetime.now()
    duration = plan["duration_days"]
    expires_at = (now + timedelta(days=duration)).isoformat() if duration else None

    conn.execute("""
        UPDATE coaches
        SET plan_id = ?,
            plan_started_at = ?,
            plan_expires_at = ?,
            monthly_limit = ?,
            monthly_used = 0,
            usage_month = ?
        WHERE id = ?
    """, (
        order["plan_id"],
        now.isoformat(),
        expires_at,
        plan["monthly_quota"] or 999999,
        now.strftime("%Y-%m"),
        order["coach_id"]
    ))

    conn.execute("""
        UPDATE orders SET status = 'approved', reviewed_at = ? WHERE id = ?
    """, (now.isoformat(), order_id))

    conn.commit()
    conn.close()

    return jsonify({"success": True})

# ===================

@app.route("/admin/orders/<int:order_id>/reject", methods=["POST"])
@admin_required
def reject_order(order_id):

    conn = get_db()

    conn.execute("""
        UPDATE orders SET status = 'rejected', reviewed_at = ? WHERE id = ?
    """, (datetime.now().isoformat(), order_id))

    conn.commit()
    conn.close()

    return jsonify({"success": True})



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
                0,
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
# SUBSCRIBE PAGE
# =========================================================

@app.route("/subscribe")
@login_required
def subscribe():

    conn = get_db()

    plans = conn.execute("""
        SELECT * FROM plans WHERE is_active = TRUE ORDER BY id ASC
    """).fetchall()

    coach = conn.execute("""
        SELECT * FROM coaches WHERE id = ?
    """, (session["coach_id"],)).fetchone()

    trial_count = conn.execute("""
        SELECT COUNT(*) as cnt FROM trials WHERE coach_id = ?
    """, (session["coach_id"],)).fetchone()

    order_count = conn.execute("""
        SELECT COUNT(*) as cnt FROM orders WHERE coach_id = ?
    """, (session["coach_id"],)).fetchone()

    conn.close()

    has_used_trial = trial_count["cnt"] > 0
    has_ordered_before = order_count["cnt"] > 0

    trial_eligible = not has_used_trial and not has_ordered_before

    return render_template(
        "subscribe.html",
        plans=plans,
        coach=coach,
        trial_eligible=trial_eligible
    )


# =========================================================
# LOGO UPLOAD
# =========================================================

ALLOWED_LOGO_EXT = {"png", "jpg", "jpeg", "webp"}
MAX_LOGO_SIZE = 2 * 1024 * 1024  # 2MB


def get_active_plan(coach):

    if not coach["plan_id"]:
        return None

    plan = get_plan(coach["plan_id"])

    if not plan:
        return None

    if coach["plan_expires_at"]:

        expires = datetime.fromisoformat(str(coach["plan_expires_at"]))

        if expires.tzinfo is not None:
            expires = expires.replace(tzinfo=None)

        if expires < datetime.now():
            return None

    return plan


PDF_STYLE_FILES = {
    "basic": "pdf_style_basic.css",
    "branded": "pdf_style_branded.css",
    "premium": "pdf_style_premium.css"
}


def get_pdf_style_filename(coach):

    plan = get_active_plan(coach)

    if not plan:
        return PDF_STYLE_FILES["basic"]

    return PDF_STYLE_FILES.get(
        plan["plan_key"],
        PDF_STYLE_FILES["basic"]
    )
# ========



# =========================================================
# SAVE BRAND PROFILE
# =========================================================

@app.route("/api/brand-profile", methods=["POST"])
@login_required
def save_brand_profile():

    conn = get_db()

    coach = conn.execute("""
        SELECT * FROM coaches WHERE id = ?
    """, (session["coach_id"],)).fetchone()

    plan = get_active_plan(coach)

    if not plan or not plan["has_custom_logo"]:
        conn.close()
        return jsonify({
            "success": False,
            "message": "این امکان فقط برای پلن برند شخصی فعال است."
        }), 403

    data = request.get_json()

    if not data:
        conn.close()
        return jsonify({"success": False, "message": "اطلاعاتی دریافت نشد."}), 400

    job_title = (data.get("job_title") or "").strip()
    social_address = (data.get("social_address") or "").strip()
    phone_number = (data.get("phone_number") or "").strip()
    footer_text = (data.get("footer_text") or "").strip()

    if phone_number and not phone_number.replace("+", "").isdigit():
        conn.close()
        return jsonify({
            "success": False,
            "message": "شماره تماس فقط باید شامل عدد باشد."
        }), 400

    conn.execute("""
        UPDATE coaches
        SET job_title = ?, social_address = ?, phone_number = ?, footer_text = ?
        WHERE id = ?
    """, (job_title, social_address, phone_number,footer_text, coach["id"]))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


# =========================================================
# ACTIVATE FREE TRIAL
# =========================================================

@app.route("/api/trial/<int:plan_id>", methods=["POST"])
@login_required
def activate_trial(plan_id):

    plan = get_plan(plan_id)

    if not plan:
        return jsonify({"success": False, "message": "پلن پیدا نشد."}), 404

    conn = get_db()

    trial_count = conn.execute("""
        SELECT COUNT(*) as cnt FROM trials WHERE coach_id = ?
    """, (session["coach_id"],)).fetchone()

    order_count = conn.execute("""
        SELECT COUNT(*) as cnt FROM orders WHERE coach_id = ?
    """, (session["coach_id"],)).fetchone()

    if trial_count["cnt"] > 0 or order_count["cnt"] > 0:
        conn.close()
        return jsonify({
            "success": False,
            "message": "تست رایگان فقط برای کاربران تازه‌وارد قابل استفاده است."
        }), 403

    now = datetime.now()
    trial_days = plan["trial_days"] or 3
    expires_at = now + timedelta(days=trial_days)

    conn.execute("""
        INSERT INTO trials (coach_id, plan_id, started_at, expires_at, status)
        VALUES (?, ?, ?, ?, 'active')
    """, (
        session["coach_id"],
        plan_id,
        now.isoformat(),
        expires_at.isoformat()
    ))

    conn.execute("""
        UPDATE coaches
        SET plan_id = ?,
            plan_started_at = ?,
            plan_expires_at = ?,
            monthly_limit = ?,
            monthly_used = 0,
            usage_month = ?
        WHERE id = ?
    """, (
        plan_id,
        now.isoformat(),
        expires_at.isoformat(),
        plan["trial_quota"] or 3,
        now.strftime("%Y-%m"),
        session["coach_id"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"تست رایگان {trial_days} روزه فعال شد."
    })


# =========================================================
# CREATE ORDER (خرید واقعی)
# =========================================================

@app.route("/api/order", methods=["POST"])
@login_required
def create_order():

    data = request.get_json()

    if not data or not data.get("tracking_code"):
        return jsonify({"success": False, "message": "کد پیگیری را وارد کنید."}), 400

    plan_id = data.get("plan_id")

    plan = get_plan(plan_id)

    if not plan:
        return jsonify({"success": False, "message": "پلن نامعتبر است."}), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO orders
        (coach_id, plan_id, amount, tracking_code, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
    """, (
        session["coach_id"],
        plan_id,
        plan["price"],
        data.get("tracking_code", ""),
        datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


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

    plan = get_active_plan(coach)
    has_custom_logo = bool(plan and plan["has_custom_logo"])
    plan_key = plan["plan_key"] if plan else "basic" 

    if plan and plan["monthly_quota"] is None:
        remaining = "نامحدود"
    else:
        remaining = max(0, coach["monthly_limit"] - coach["monthly_used"])

    return render_template("planner.html", coach=coach, remaining=remaining,has_custom_logo=has_custom_logo,plan_key=plan_key)


# =========================================================
# GET PROGRAM HISTORY
# =========================================================

@app.route("/api/programs")
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

    # ... همه‌ی validationها و INSERT و UPDATE دقیقا مثل قبل، بدون هیچ تغییری ...

    conn.commit()
    conn.close()

    # فقط همین دو خط آخر عوض میشه - فقط برای نمایش:
    plan = get_active_plan(coach)
    remaining_display = "نامحدود" if (plan and plan["monthly_quota"] is None) else (remaining - 1)

    return jsonify({"success": True, "remaining": remaining_display})


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

    try:
        data["sizes"] = json.loads(data["sizes"]) if data.get("sizes") else {}
    except:
        data["sizes"] = {}

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
         athlete_goal,athlete_gender,sizes, program_name, program_data, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        coach["id"],
        data.get("athlete_name", ""),
        data.get("athlete_age", ""),
        data.get("athlete_height", ""),
        data.get("athlete_weight", ""),
        data.get("athlete_goal", ""),
        data.get("athlete_gender", ""),
        json.dumps(data.get("sizes", {}), ensure_ascii=False),
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

        conn = get_db()

        coach = conn.execute("""
            SELECT * FROM coaches WHERE id = ?
        """, (session["coach_id"],)).fetchone()

        conn.close()
        
        plan = get_active_plan(coach)
        is_basic = (not plan) or (plan["plan_key"] == "basic")    # <-- جدید

        html_content = data["html"]                               # <-- جدید

        if is_basic:                                               # <-- جدید
            soup = BeautifulSoup(html_content, "html.parser")
            for class_name in ["preview-size-boxes", "bmi-box", "sizes-box"]:
                for tag in soup.find_all(class_=class_name):
                    tag.decompose()
            html_content = str(soup)

        pdf_style_filename = get_pdf_style_filename(coach)

        base_dir = os.path.dirname(os.path.abspath(__file__))

        font_path = os.path.join(
            base_dir,
            "static",
            "font",
            "Vazirmatn-Regular.ttf"
        )

        

        if not os.path.isfile(font_path):
            return jsonify({
                "success": False,
                "message": f"فونت پیدا نشد: {font_path}"
            }), 500

        with open(font_path, "rb") as font_file:
            font_base64 = base64.b64encode(
                font_file.read()
            ).decode("utf-8")

        pdf_css_path = os.path.join(
            base_dir,
            "static",
            pdf_style_filename
        )

        if not os.path.isfile(pdf_css_path):
            return jsonify({
                "success": False,
                "message": f"فایل PDF CSS پیدا نشد: {pdf_css_path}"
            }), 500

        with open(pdf_css_path, "r", encoding="utf-8") as css_file:
            css_content = css_file.read()

        html_content = data["html"]

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

    {data["html"]}

</body>

</html>
"""

        with sync_playwright() as p:

            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage"
                ]
            )

            page = browser.new_page()

            page.set_content(
                full_html,
                wait_until="load"
            )

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

        pdf_buffer = BytesIO()
        pdf_buffer.write(pdf_bytes)
        pdf_buffer.seek(0)

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

init_db()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
