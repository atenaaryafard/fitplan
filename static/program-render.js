/* =========================================================
   program-render.js
   این فایل را در static/ کنار style.css قرار بده.

   محتوای این فایل عیناً از script.js فعلی منتقل شده:
     - BMI_GUIDE_BASE64   (رشتهٔ base64 عکس راهنمای BMI)
     - calculateBMI
     - buildBrandHeaderHTML
     - buildBrandFooterHTML
     - buildProgramPreviewHTML
     - escapeHTML

   ⚠️ کار دستی لازم:
   ثابت BMI_GUIDE_BASE64 را از بالای script.js فعلی (همان
   رشتهٔ طولانی data:image/jpeg;base64,...) کپی کن و اینجا
   جای خط زیر بگذار. من عمداً آن را دوباره کپی نکردم چون
   رشته‌ای بسیار طولانی و بدون تغییر است.
   ========================================================= */

const BMI_GUIDE_BASE64 = "/* <-- اینجا رشتهٔ base64 را از script.js کپی کن --> */";


function escapeHTML(value) {

    if (!value) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function calculateBMI(weight, height) {

    const w = parseFloat(weight);
    const hCm = parseFloat(height);

    if (!w || !hCm) return null;

    const hM = hCm / 100;
    const bmi = w / (hM * hM);

    return bmi.toFixed(1);

}


function buildBrandHeaderHTML() {

    if (!COACH_BRAND.hasCustomLogo) return "";

    return `
        <div class="pdf-brand-header">

            <div class="pdf-brand-info">
                <strong>${escapeHTML(COACH_BRAND.coachName)}</strong>
                ${COACH_BRAND.jobTitle ? `<span>${escapeHTML(COACH_BRAND.jobTitle)}</span>` : ""}
                ${COACH_BRAND.socialAddress ? `<span>${escapeHTML(COACH_BRAND.socialAddress)}</span>` : ""}
                ${COACH_BRAND.phoneNumber ? `<span>${escapeHTML(COACH_BRAND.phoneNumber)}</span>` : ""}
            </div>

            <img src="${DEFAULT_LOGO_BASE64}" class="pdf-brand-logo" alt="لوگو">

        </div>
    `;
}


function buildBrandFooterHTML() {

    if (!COACH_BRAND.hasCustomLogo || !COACH_BRAND.footerText) return "";

    return `
        <div class="pdf-brand-footer">
            ${escapeHTML(COACH_BRAND.footerText)}
        </div>
    `;
}


function buildProgramPreviewHTML(program) {

    const days = program.days || [];

    let html = "";

    html += `

        <div class="preview-athlete">
            <div><strong>ورزشکار:</strong> ${escapeHTML(program.athlete_name) || "-"}</div>
            <div><strong>سن:</strong> ${escapeHTML(program.athlete_age) || "-"}</div>
            <div><strong>قد:</strong> ${escapeHTML(program.athlete_height) || "-"}</div>
            <div><strong>وزن:</strong> ${escapeHTML(program.athlete_weight) || "-"}</div>
            <div><strong>هدف:</strong> ${escapeHTML(program.athlete_goal) || "-"}</div>
            <div><strong>جنسیت:</strong> ${escapeHTML(program.athlete_gender) || "-"}</div>
        </div>

    `;

    if (days.length === 0) {

        html += `
            <div class="empty-workout">
                هیچ روز تمرینی ثبت نشده است.
            </div>
        `;

    }

    days.forEach(day => {

        html += `

            <div class="preview-day">

                <h3>${escapeHTML(day.name)}</h3>

                <table class="preview-table">

                    <thead>
                        <tr>
                            <th>حرکت</th>
                            <th>عضله هدف</th>
                            <th>ست</th>
                            <th>تکرار</th>
                            <th>استراحت</th>
                            <th> وزنه</th>
                            ${COACH_BRAND.hasCustomLogo ? `<th class="guide-col"> اجرا حرکت</th>` : ""}
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            (day.exercises || [])
                                .map((exercise, index) => {

                                    const exerciseInfo = exercises.find(item => item.name === exercise.exercise);
                                    const gifUrl = (exerciseInfo && exerciseInfo.gif) || "";

                                    return `
                                        <tr>
                                            <td>${escapeHTML(exercise.exercise) || "-"}</td>
                                            <td>${escapeHTML(exercise.muscle) || "-"}</td>
                                            <td>${escapeHTML(exercise.sets) || "-"}</td>
                                            <td>${escapeHTML(exercise.reps) || "-"}</td>
                                            <td>${escapeHTML(exercise.rest) || "-"}</td>
                                            <td>${escapeHTML(exercise.weight) || "-"}</td>
                                            ${COACH_BRAND.hasCustomLogo ? `
                                            <td class="guide-col">
                                                ${
                                                    gifUrl
                                                    ? `
                                                        <a href="${gifUrl}" target="_blank" class="exercise-guide-link">
                                                             اجرا حرکت
                                                        </a>
                                                    `
                                                    : `
                                                        <span class="exercise-guide-disabled">
                                                             اجرا حرکت
                                                        </span>
                                                    `
                                                }
                                            </td>
                                            ` : ""}
                                    `;

                                })
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    });

    const sizeRows = program.sizes ? [
        { label: "دور سینه: ", value: program.sizes.sine },
        { label: "دور کمر: ", value: program.sizes.kamar },
        { label: "دور شکم: ", value: program.sizes.shekam },
        { label: "دور باسن: ", value: program.sizes.basan },
        { label: "دور ران: ", value: program.sizes.ran },
        { label: "دور بازو: ", value: program.sizes.bazo },
        { label: "دور ساق: ", value: program.sizes.sagh }
    ].filter(row => row.value) : [];

    const bmiValue = calculateBMI(program.athlete_weight, program.athlete_height);
    const isBasicPlan = COACH_BRAND.planKey === "basic";

    if (program.notes || sizeRows.length > 0 || bmiValue) {

        html += `<div class="preview-bottom-row">`;

        if (program.notes) {
            html += `
                <div class="preview-box notes-box">
                    <div class="preview-box-title">توضیحات:</div>
                    <p>${escapeHTML(program.notes)}</p>
                </div>
            `;
        }

        if (!isBasicPlan && (bmiValue || sizeRows.length > 0)) {
            html += `<div class="preview-size-boxes">`;

            if (bmiValue) {
                html += `
                    <div class="preview-box bmi-box">
                        <div class="preview-box-title">bmi:${bmiValue}</div>
                        <img src="${BMI_GUIDE_BASE64}" class="bmi-guide-img" alt="راهنمای BMI">
                    </div>
                `;
            }

            if (sizeRows.length > 0) {
                html += `
                    <div class="preview-box sizes-box">
                        <div class="preview-box-title">سایز ها:</div>
                        <div class="sizes-grid">
                            ${sizeRows.map(row => `
                                <div class="size-row">
                                    <span class="size-row-label">${escapeHTML(row.label)}</span>
                                    <span class="size-row-value">${escapeHTML(row.value)}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
        }

        html += `</div>`;
    }

    return html;
}
