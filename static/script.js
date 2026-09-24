
function sanitizeNameInput(input) {
    input.value = input.value
        .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, "")
        .replace(/[^\u0600-\u06FF\s]/g, "");
}

function sanitizePhoneInput(input) {
    input.value = input.value.replace(/[^\d+]/g, "");
}

function sanitizeSocialInput(input) {
    let value = input.value.replace(/\s/g, "");
    if (value && !value.startsWith("@")) {
        value = "@" + value;
    }
    input.value = value;
}


async function saveBrandProfile() {

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const socialAddress = document.getElementById("socialAddress").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const footerText = document.getElementById("footerText").value.trim();

    try {

        const response = await fetch("/api/brand-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                job_title: jobTitle,
                social_address: socialAddress,
                phone_number: phoneNumber,
                footer_text: footerText
            })
        });

        const result = await response.json();

        const msg = document.getElementById("brandSaveMsg");

        if (!response.ok) {
            msg.textContent = result.message;
            msg.className = "brand-save-msg error";
            return;
        }

        COACH_BRAND.jobTitle = jobTitle;
        COACH_BRAND.socialAddress = socialAddress;
        COACH_BRAND.phoneNumber = phoneNumber;
        COACH_BRAND.footerText = footerText;

        msg.textContent = "✔ اطلاعات برند ذخیره شد.";
        msg.className = "brand-save-msg success";

        setTimeout(() => { msg.textContent = ""; }, 3000);

    } catch (error) {
        alert("خطا در ذخیره اطلاعات برند.");
    }

}

/* =====================================================
   GLOBAL
===================================================== */

let selectedDays = {};

let currentDay = null;


/* =====================================================
   DAY DEFINITIONS
===================================================== */

const DAY_DEFS = [

    { key: "روز شنبه", label: "روز شنبه" },
    { key: "روز یکشنبه", label: "روز یکشنبه" },
    { key: "روز دوشنبه", label: "روز دوشنبه" },
    { key: "روز سه شنبه", label: "روز سه شنبه" },
    { key: "روز چهارشنبه", label: "روز چهارشنبه" },
    { key: "روز پنجشنبه", label: "روز پنجشنبه" },
    { key: "روز جمعه", label: "روز جمعه" },
    { key: "روزهای زوج", label: "روزهای زوج" },
    { key: "روزهای فرد", label: "روزهای فرد" }

];



/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderDayAccordion();

        loadHistory();

    }
);


/* =====================================================
   DAY ACCORDION HEADER CLICK
===================================================== */

function handleDayHeaderClick(day) {

    if (!selectedDays[day]) {

        saveCurrentDay();

        selectedDays[day] = {
            name: day,
            exercises: [ createEmptyExercise() ]
        };

        currentDay = day;

    } else if (currentDay === day) {

        saveCurrentDay();
        currentDay = null;

    } else {

        saveCurrentDay();
        currentDay = day;

    }

    renderDayAccordion();

}


/* =====================================================
   REMOVE DAY
===================================================== */

function removeDay(day, event) {

    if (event) {
        event.stopPropagation();
    }

    const confirmed = confirm("این روز از برنامه حذف شود؟");

    if (!confirmed) return;

    delete selectedDays[day];

    if (currentDay === day) {
        currentDay = null;
    }

    renderDayAccordion();

}


/* =====================================================
   EMPTY EXERCISE
===================================================== */

function createEmptyExercise() {

    return {
        exercise: "",
        muscle: "",
        sets: "3",
        reps: "12",
        rest: "60 ثانیه",
        weight: "",
    };

}


/* =====================================================
   RENDER DAY ACCORDION
===================================================== */

function renderDayAccordion() {

    const container = document.getElementById("daySelector");

    let html = "";

    DAY_DEFS.forEach(def => {

        const day = def.key;
        const isSelected = Boolean(selectedDays[day]);
        const isOpen = isSelected && currentDay === day;

        html += `

            <div class="day-accordion-item ${isSelected ? "selected" : ""} ${isOpen ? "open" : ""}">

                <div
                    class="day-accordion-header"
                    onclick="handleDayHeaderClick('${day}')">

                    <div class="day-accordion-title">

                        <span class="day-check">${isSelected ? "✓" : ""}</span>

                        <span>${def.label}</span>

                        ${
                            isSelected
                            ? `<span class="day-count">${selectedDays[day].exercises.length} حرکت</span>`
                            : ""
                        }

                    </div>

                    <div class="day-accordion-controls">

                        ${
                            isSelected
                            ? `<button
                                type="button"
                                class="day-remove"
                                onclick="removeDay('${day}', event)">
                                حذف
                            </button>`
                            : ""
                        }

                        <span class="day-chevron">⌄</span>

                    </div>

                </div>

                ${
                    isOpen
                    ? `
                    <div class="day-accordion-body">
                        <div class="workout-area">
                            ${
                                selectedDays[day].exercises
                                    .map((exercise, index) => createExerciseHTML(exercise, index))
                                    .join("")
                            }
                        </div>
                    </div>
                    `
                    : ""
                }

            </div>

        `;

    });

    container.innerHTML = html;

}


/* =====================================================
   EXERCISE HTML
===================================================== */

function filterExerciseList(input) {

    const query = input.value.trim().toLowerCase();
    const wrapper = input.closest(".exercise-field");
    const dropdown = wrapper.querySelector(".exercise-dropdown");

    const matches = exercises.filter(item =>
        item.name.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        dropdown.innerHTML = `<div class="exercise-dropdown-empty">موردی یافت نشد</div>`;
    } else {
        dropdown.innerHTML = matches.map(item => `
            <div
                class="exercise-dropdown-item"
                onmousedown="chooseExercise(this, '${item.name.replace(/'/g, "\\'")}', '${item.muscle}')">
                ${escapeHTML(item.name)}
                <span class="exercise-dropdown-muscle">${escapeHTML(item.muscle)}</span>
            </div>
        `).join("");
    }

    dropdown.classList.remove("hidden");
}

function closeExerciseList(input) {
    const wrapper = input.closest(".exercise-field");
    wrapper.querySelector(".exercise-dropdown").classList.add("hidden");
}

function chooseExercise(el, name, muscle) {

    const wrapper = el.closest(".exercise-field");
    const searchInput = wrapper.querySelector(".exercise-search");
    const hiddenInput = wrapper.querySelector(".exercise-select");
    const dropdown = wrapper.querySelector(".exercise-dropdown");

    searchInput.value = name;
    hiddenInput.value = name;
    dropdown.classList.add("hidden");

    const row = el.closest(".exercise-row");
    if (muscle) {
        row.querySelector(".muscle-select").value = muscle;
    }

    saveCurrentDay();
}


function createExerciseHTML(exercise, index) {

    return `

        <div class="exercise-row" data-index="${index}">

            <div class="exercise-field" style="position: relative;">

                <label>نام حرکت</label>

                <input
                    type="text"
                    class="exercise-search"
                    placeholder="جستجوی حرکت..."
                    value="${escapeHTML(exercise.exercise)}"
                    autocomplete="off"
                    oninput="filterExerciseList(this)"
                    onfocus="showFullExerciseList(this)"
                    onblur="setTimeout(() => closeExerciseList(this), 150)">

                <input type="hidden" class="exercise-select" value="${escapeHTML(exercise.exercise)}">

                <div class="exercise-dropdown hidden"></div>

            </div>

            <div class="exercise-field">

                <label>عضله هدف</label>

                <select class="muscle-select">

                    <option value="">انتخاب</option>

                    ${[
                        "سینه","کول","سرشانه","جلو بازو","پشت بازو","پشت میانی","زیر بغل","سرینی","ساعد","همسترینگ و سرینی","چهار سر و سرینی","شکم و پهلو",
                        "چهارسر ران","همسترینگ","ساق","شکم"
                    ].map(muscle => `
                        <option ${exercise.muscle === muscle ? "selected" : ""}>${muscle}</option>
                    `).join("")}

                </select>

            </div>

            <div class="exercise-field">

                <label>ست</label>

                <select class="sets">
                    ${["1","2","3","4","5","6"].map(value => `
                        <option ${exercise.sets === value ? "selected" : ""}>${value}</option>
                    `).join("")}
                </select>

            </div>

            <div class="exercise-field">

                <label>تکرار</label>

                <select class="reps">
                    ${["6","8","10","12","15","20","تا ناتوانی"].map(value => `
                        <option ${exercise.reps === value ? "selected" : ""}>${value}</option>
                    `).join("")}
                </select>

            </div>

            <div class="exercise-field">

                <label>استراحت</label>

                <select class="rest">
                    ${["30 ثانیه","45 ثانیه","60 ثانیه","2 دقیقه","3 دقیقه","5 دقیقه"].map(value => `
                        <option ${exercise.rest === value ? "selected" : ""}>${value}</option>
                    `).join("")}
                </select>

            </div>

            <div class="exercise-field">

                <label>وزنه (kg)</label>

                <input
                    type="number"
                    class="exercise-weight"
                    min="1"
                    max="400"
                    value="${escapeHTML(exercise.weight)}"
                    placeholder=" kg 1-400">

            </div>

            <button class="delete-exercise" onclick="deleteExercise(${index})">×</button>

            <button type="button" class="add-exercise-main" onclick="addExercise()">+ افزودن حرکت</button>

        </div>

    `;

}


/* =====================================================
   EXERCISE GUIDE MODAL
===================================================== */

function showFullExerciseList(input) {

    const wrapper = input.closest(".exercise-field");
    const dropdown = wrapper.querySelector(".exercise-dropdown");

    dropdown.innerHTML = exercises.map(item => `
        <div
            class="exercise-dropdown-item"
            onmousedown="chooseExercise(this, '${item.name.replace(/'/g, "\\'")}', '${item.muscle}')">
            ${escapeHTML(item.name)}
            <span class="exercise-dropdown-muscle">${escapeHTML(item.muscle)}</span>
        </div>
    `).join("");

    dropdown.classList.remove("hidden");
}


function showExerciseGuide(button) {

    const row = button.closest(".exercise-row");
    const select = row.querySelector(".exercise-select");
    const name = select.value;

    if (!name) {
        alert("ابتدا یک حرکت را انتخاب کنید.");
        return;
    }

    const exerciseData = exercises.find(item => item.name === name);
    const gifUrl = exerciseData && exerciseData.gif;

    const body = document.getElementById("gifModalBody");

    if (gifUrl) {

        body.innerHTML = `
            <h3>${escapeHTML(name)}</h3>
            <img src="${gifUrl}" alt="${escapeHTML(name)}" class="guide-gif">
        `;

    } else {

        const searchUrl =
            "https://www.google.com/search?tbm=isch&q="
            + encodeURIComponent(name + " تمرین بدنسازی");

        body.innerHTML = `
            <h3>${escapeHTML(name)}</h3>
            <p>گیف این حرکت هنوز ثبت نشده است.</p>
            <a href="${searchUrl}" target="_blank" class="guide-search-link">
                جست‌وجوی تصویر «${escapeHTML(name)}»
            </a>
        `;

    }

    document.getElementById("gifModal").classList.remove("hidden");

}


function closeGifModal() {
    document.getElementById("gifModal").classList.add("hidden");
}


function addExercise() {

    if (!currentDay) {
        alert("ابتدا یک روز تمرین را انتخاب کنید.");
        return;
    }

    saveCurrentDay();

    selectedDays[currentDay].exercises.push(createEmptyExercise());

    renderDayAccordion();

}


/* =====================================================
   DELETE EXERCISE
===================================================== */

function deleteExercise(index) {

    if (!currentDay) return;

    saveCurrentDay();

    const dayExercises = selectedDays[currentDay].exercises;

    if (dayExercises.length <= 1) {
        alert("حداقل یک حرکت باید وجود داشته باشد.");
        return;
    }

    dayExercises.splice(index, 1);

    renderDayAccordion();

}


/* =====================================================
   EXERCISE CHANGED
===================================================== */

function exerciseChanged(select) {

    const row = select.closest(".exercise-row");
    const option = select.options[select.selectedIndex];
    const muscle = option.dataset.muscle;

    if (muscle) {
        row.querySelector(".muscle-select").value = muscle;
    }

    saveCurrentDay();

}


/* =====================================================
   SAVE CURRENT DAY
===================================================== */

function saveCurrentDay() {

    if (!currentDay) return;

    const day = selectedDays[currentDay];

    if (!day) return;

    const rows = document.querySelectorAll(".exercise-row");

    const exerciseRows = [];

    rows.forEach(row => {

        exerciseRows.push({
            exercise: row.querySelector(".exercise-select").value,
            muscle: row.querySelector(".muscle-select").value,
            sets: row.querySelector(".sets").value,
            reps: row.querySelector(".reps").value,
            rest: row.querySelector(".rest").value,
            weight: row.querySelector(".exercise-weight").value,
        });

    });

    day.exercises = exerciseRows;

}


/* =====================================================
   GENERATE PROGRAM NAME
===================================================== */

function generateProgramName() {

    const athleteName = document.getElementById("athleteName").value.trim() || "ورزشکار";
    const dateText = new Date().toLocaleDateString("fa-IR");

    return `برنامه ${athleteName} - ${dateText}`;

}


/* =====================================================
   COLLECT PROGRAM
===================================================== */
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function collectProgram() {

    saveCurrentDay();

    return {

        athlete_name: document.getElementById("athleteName").value.trim(),
        athlete_age: document.getElementById("athleteAge").value,
        athlete_height: document.getElementById("athleteHeight").value,
        athlete_weight: document.getElementById("athleteWeight").value,
        athlete_goal: document.getElementById("athleteGoal").value,
        athlete_gender: document.getElementById("athleteGender").value,

        sizes: {

                sine: getVal("sizesine"),
                kamar: getVal("sizekamar"),
                shekam: getVal("sizeshekam"),
                basan: getVal("sizebasan"),
                ran: getVal("sizeran"),
                bazo: getVal("sizebazo"),
                sagh: getVal("sizesagh")
          },

        program_name: generateProgramName(),

        days: Object.values(selectedDays),

        notes: document.getElementById("programNotes").value

    };

}


/* =====================================================
   SAVE PROGRAM
===================================================== */

async function saveProgram() {

    const data = collectProgram();

    if (!data.athlete_name) {
        alert("اطلاعات ورزشکار را وارد کنید.");
        return;
    }

    const hasDigits = /[\u0660-\u0669\u06F0-\u06F9]/;

    if (hasDigits.test(data.athlete_name)) {
        alert(
            "نام شاگرد باید فقط شامل حروف فارسی باشد و نباید عدد یا کاراکتر دیگری داشته باشد."
        );
        return;
    }

    if (data.days.length === 0) {
        alert("حداقل یک روز تمرین انتخاب کنید.");
        return;
    }

    try {

        const response = await fetch("/api/program", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();


        /* ==========================================
           اشتراک تمام شده
           ========================================== */

        if (result.subscription_expired) {

            showSubscriptionExpiredModal(
                "امکان ذخیره برنامه وجود ندارد",
                "زمان اشتراک شما به پایان رسیده است. برای ذخیره برنامه، ابتدا اشتراک خود را تهیه یا تمدید کنید."
            );

            return;
        }


        /* ==========================================
           خطای عادی
           ========================================== */

        if (!response.ok) {

            alert(
                result.message ||
                "خطایی رخ داده است."
            );

            return;
        }


        /* ==========================================
           ذخیره موفق
           ========================================== */

        document.getElementById("quota").textContent =
            result.remaining;

        resetProgramForm();

        // باز کردن برنامه در صفحه HTML (همان نمای شاگرد)
        window.location.href = `/coach/program/${result.program_id}`;


    } catch (error) {

        console.error(error);

        alert(
            "خطا در ارتباط با سرور."
        );

    }

}


/* =====================================================
   LOAD HISTORY
===================================================== */

async function loadHistory() {

    const container = document.getElementById("historyList");

    try {

        const response = await fetch("/api/programs");

        const programs = await response.json();

        if (programs.length === 0) {

            container.innerHTML = `
                <div class="empty-history">
                    هنوز برنامه‌ای ذخیره نشده است.
                </div>
            `;

            return;

        }

        container.innerHTML = "";

        programs.forEach(program => {

            const item = document.createElement("div");

            item.className = "history-item";

            const date = new Date(program.created_at);
            const dateText = date.toLocaleDateString("fa-IR");

            item.innerHTML = `

                <div class="history-info">
                    <strong>${escapeHTML(program.athlete_name)}</strong>
                    <small>${dateText}</small>
                </div>

                <div class="history-actions">
                    <button onclick="viewProgram(${program.id})">مشاهده</button>
                    <button onclick="openSendProgramModal(${program.id})"class="history-send">ارسال به</button>
                    <button onclick="deleteProgram(${program.id})" class="history-delete">حذف</button>
                </div>

            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(error);
        container.innerHTML = "خطا در دریافت تاریخچه.";

    }

}


/* =====================================================
   VIEW PROGRAM
   باز کردن برنامه در صفحه HTML (همان نمای شاگرد)
===================================================== */

function viewProgram(id) {

    window.open(`/coach/program/${id}`, "_blank");

}

/* =====================================================
   DELETE PROGRAM
===================================================== */

async function deleteProgram(id) {

    const confirmed = confirm("آیا از حذف این برنامه مطمئن هستید؟");

    if (!confirmed) return;

    try {

        const response = await fetch(`/api/program/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        loadHistory();

    } catch (error) {
        alert("خطا در حذف برنامه.");
    }

}


/* =====================================================
   NEW PROGRAM
===================================================== */

function newProgram() {

    const confirmed = confirm("اطلاعات برنامه فعلی پاک شود؟");

    if (!confirmed) return;

    resetProgramForm();

}


/* =====================================================
   RESET PROGRAM FORM
===================================================== */

function resetProgramForm() {

    document.getElementById("athleteName").value = "";
    document.getElementById("athleteAge").value = "";
    document.getElementById("athleteHeight").value = "";
    document.getElementById("athleteWeight").value = "";
    document.getElementById("athleteGoal").value = "";
    document.getElementById("athleteGender").value = "";
    document.getElementById("programNotes").value = "";

    ["sizesine","sizekamar","sizeshekam","sizebasan","sizeran","sizebazo","sizesagh"]
    .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    selectedDays = {};
    currentDay = null;

    renderDayAccordion();

}


/* =====================================================
   SEND PROGRAM TO STUDENT
===================================================== */

let currentSendProgramId = null;


/* =====================================================
   OPEN SEND MODAL
===================================================== */

async function openSendProgramModal(programId) {

    currentSendProgramId = programId;

    let modal = document.getElementById("sendProgramModal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "sendProgramModal";

        modal.className = "modal-overlay";

        modal.innerHTML = `

            <div class="modal-box" style="max-width:500px;">

                <div class="modal-header">

                    <h2>
                        ارسال برنامه به شاگرد
                    </h2>

                    <button
                        type="button"
                        class="modal-close"
                        onclick="closeSendProgramModal()">

                        ×

                    </button>

                </div>


                <div
                    class="modal-body"
                    id="sendProgramModalBody">

                    <div style="
                        text-align:center;
                        padding:30px;
                        color:#777;
                    ">
                        در حال دریافت لیست شاگردان...
                    </div>

                </div>

            </div>

        `;

        modal.addEventListener("click", function(event) {

            if (event.target === modal) {
                closeSendProgramModal();
            }

        });

        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");

    const body = document.getElementById("sendProgramModalBody");

    body.innerHTML = `
        <div style="
            text-align:center;
            padding:30px;
            color:#777;
        ">
            در حال دریافت لیست شاگردان...
        </div>
    `;


    try {

        const response = await fetch("/api/my-students");

        const students = await response.json();


        if (!response.ok) {

            body.innerHTML = `
                <div style="
                    text-align:center;
                    color:#dc2626;
                    padding:20px;
                ">
                    خطا در دریافت لیست شاگردان.
                </div>
            `;

            return;
        }


        if (students.length === 0) {

            body.innerHTML = `

                <div style="
                    text-align:center;
                    padding:25px;
                ">

                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        👤
                    </div>

                    <strong>
                        هنوز شاگردی ثبت نشده است.
                    </strong>

                    <p style="
                        color:#777;
                        font-size:13px;
                        margin-top:10px;
                    ">
                        ابتدا شاگرد خود را از بخش «لیست شاگردان»
                        اضافه کنید.
                    </p>

                </div>

            `;

            return;
        }


        body.innerHTML = `

            <p style="
                margin-top:0;
                color:#666;
                font-size:13px;
            ">
                شاگرد مورد نظر را برای دریافت این برنامه انتخاب کنید:
            </p>

            <div id="sendStudentsList"></div>

        `;


        const list = document.getElementById("sendStudentsList");


        students.forEach(student => {

            const item = document.createElement("div");

            item.style.cssText = `
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                padding:12px;
                margin-bottom:8px;
                border:1px solid #e5e7eb;
                border-radius:10px;
                background:#fafafa;
            `;


            item.innerHTML = `

                <div style="
                    display:flex;
                    flex-direction:column;
                    gap:4px;
                ">

                    <strong>
                        ${escapeHTML(student.name)}
                    </strong>

                    <small style="
                        color:#888;
                    ">
                        ${escapeHTML(student.phone)}
                    </small>

                </div>


                <button
                    type="button"
                    onclick="sendProgramToStudent(${student.id})"
                    style="
                        border:none;
                        background:#111827;
                        color:white;
                        border-radius:8px;
                        padding:9px 14px;
                        cursor:pointer;
                        white-space:nowrap;
                    "
                >
                    ارسال
                </button>

            `;


            list.appendChild(item);

        });


    } catch (error) {

        console.error(error);

        body.innerHTML = `
            <div style="
                text-align:center;
                color:#dc2626;
                padding:20px;
            ">
                خطا در ارتباط با سرور.
            </div>
        `;

    }

}


/* =====================================================
   SEND PROGRAM
===================================================== */

async function sendProgramToStudent(studentId) {

    if (!currentSendProgramId) {
        return;
    }


    try {

        const response = await fetch(
            `/api/program/${currentSendProgramId}/send`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    student_id: studentId
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "ارسال برنامه انجام نشد."
            );

            return;
        }


        closeSendProgramModal();


        alert(
            `برنامه با موفقیت برای ${result.student_name} ارسال شد.`
        );


        loadHistory();


    } catch (error) {

        console.error(error);

        alert(
            "خطا در ارتباط با سرور."
        );

    }

}


/* =====================================================
   SUBSCRIPTION EXPIRED MODAL
===================================================== */

function showSubscriptionExpiredModal(
    title = "زمان اشتراک شما به پایان رسیده است",
    message = "برای ادامه استفاده از این قابلیت، اشتراک خود را تهیه یا تمدید کنید."
) {

    const oldOverlay =
        document.getElementById("subscriptionModalOverlay");

    if (oldOverlay) {
        oldOverlay.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "subscriptionModalOverlay";

    overlay.className =
        "subscription-modal-overlay";

    overlay.innerHTML = `

        <div
            class="subscription-modal"
            role="dialog"
            aria-modal="true">

            <button
                type="button"
                class="subscription-modal-close"
                onclick="closeSubscriptionModal()"
                aria-label="بستن">
                ×
            </button>

            <div class="subscription-modal-icon">
                🔒
            </div>

            <div class="subscription-modal-title">
                ${title}
            </div>

            <div class="subscription-modal-text">
                ${message}
            </div>

            <a
                href="/subscribe?expired=1"
                class="subscription-modal-button">
                تهیه / تمدید اشتراک
            </a>

        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add("show");
    });

    overlay.addEventListener("click", function(event) {

        if (event.target === overlay) {
            closeSubscriptionModal();
        }

    });

    document.body.style.overflow = "hidden";
}


/* =====================================================
   STUDENTS LOCKED
===================================================== */

function showStudentsLockedMessage() {

    showSubscriptionExpiredModal(
        "دسترسی به لیست شاگردان غیرفعال است",
        "زمان اشتراک شما به پایان رسیده است. برای دسترسی دوباره به لیست شاگردان، اشتراک خود را تمدید کنید."
    );

}


/* =====================================================
   CLOSE SUBSCRIPTION MODAL
===================================================== */

function closeSubscriptionModal() {

    const overlay =
        document.getElementById("subscriptionModalOverlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("show");

    setTimeout(() => {

        overlay.remove();

        document.body.style.overflow = "";

    }, 180);
}
