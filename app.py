@app.route("/register", methods=["GET", "POST"])
def register():

    error = None

    if request.method == "POST":

        name = request.form.get("name", "").strip()
        phone = request.form.get("phone", "").strip()
        password = request.form.get("password", "")

        # بررسی خالی نبودن فیلدها
        if not name or not phone or not password:
            error = "همه فیلدها را تکمیل کنید."
            return render_template("register.html", error=error)

        # بررسی شماره تماس
        if not phone.startswith("09") or len(phone) != 11 or not phone.isdigit():
            error = "شماره تماس معتبر نیست."
            return render_template("register.html", error=error)

        # بررسی رمز عبور
        if len(password) < 8:
            error = "رمز عبور باید حداقل ۸ کاراکتر باشد."
            return render_template("register.html", error=error)

        conn = get_db()

        try:

            conn.execute("""
                INSERT INTO coaches
                (
                    name,
                    phone,
                    password,
                    monthly_limit,
                    monthly_used,
                    usage_month,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                name,
                phone,
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

            error = "این شماره تماس قبلاً ثبت شده است."

            return render_template(
                "register.html",
                error=error
            )

        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html", error=error)
