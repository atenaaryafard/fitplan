
  function sanitizeNameInput(input) {
    input.value = input.value
        .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, "")
        .replace(/[^\u0600-\u06FF\s]/g, "");
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
   EXERCISE DATABASE
===================================================== */

const exercises = [

    {
        name: "پرس سرشانه باربل",
        muscle: "سرشانه",
        gif: ""
    },

    {
        name: "لانج دمبل",
        muscle: "چهارسر ران",
        gif: "https://fa.pelank.com/wp-content/uploads/2026/07/dumbbell-lunges.gif"
    },

    {
        name: "استپ آپ",
        muscle: "چهارسر ران",
        gif: "https://cdnfa.ir/mokamelshope/8ed3/uploads/step-up8.gif"
    },

    {
        name: "پرس سینه دمبل",
        muscle: "سینه",
        gif: "https://cdnfa.ir/mokamelshope/8ed3/uploads/incline-dumbbell-bench-press1.gif"
    },

    {
        name: "پرس بالا سینه دمبل",
        muscle: "سینه",
        gif: "https://fa.pelank.com/wp-content/uploads/2026/02/Dumbbell-Reverse-Grip-30-Degrees-Incline-Bench-Press.gif"
    },

    {
        name: "فلای سینه دستگاه",
        muscle: "سینه",
        gif: "https://morabihamrah.com/wp-content/uploads/2023/10/Pec-Deck-Fly12.gif"
    },

    {
        name: "پوش آپ",
        muscle: "سینه",
        gif: "https://routination.com/wp-content/uploads/2023/11/exercises-chest7.gif"
    },


    {
        name: "ددلیفت دمبل",
        muscle: "همسترینگ",
        gif: "https://fitnessia.ir/wp-content/uploads/2023/09/%D8%AF%D8%AF%D9%84%DB%8C%D9%81%D8%AA-%D8%B1%D9%88%D9%85%D8%A7%D9%86%DB%8C%D8%A7%DB%8C%DB%8C-%D8%A8%D8%A7-%D8%AF%D9%85%D8%A8%D9%84.gif"
    },

    {
        name: "قایقی دست باز",
        muscle: "پشت",
        gif: "https://fitnessia.ir/wp-content/uploads/2023/09/%D8%B2%DB%8C%D8%B1-%D8%A8%D8%BA%D9%84-%D9%BE%D8%A7%D8%B1%D9%88%DB%8C%DB%8C.gif"
    },

    {
        name: "پرس سرشانه دمبل",
        muscle: "سرشانه",
        gif: "https://cdnfa.ir/mokamelshope/8ed3/uploads/dumbbell-shoulder-press-gif.gif"
    },

    {
        name: "نشر جانب",
        muscle: "سرشانه",
        gif:"https://cdnfa.ir/mokamelshope/8ed3/uploads/leg/1-nashr-janb-dmbl-aistadh.gif"
    },

    {
        name: "نشر خم",
        muscle: "سرشانه",
        gif:"https://fa.pelank.com/wp-content/uploads/2025/01/Bent-Over-Lateral-Raise.gif"
    },

    {
        name: " جلو بازو دمبل لاری",
        muscle: "جلو بازو",
        gif:"https://routination.com/wp-content/uploads/2023/11/exercises-biceps23.gif"
    },

    {
        name: "پشت بازو دمبل",
        muscle: "پشت بازو"
    },

    {
        name: "پشت بازو بالای سر",
        muscle: "پشت بازو",
        gif: "https://morabihamrah.com/wp-content/uploads/2023/09/Dumbbell-Triceps-Extension12.gif"
    },

    {
        name: "پل باسن",
        muscle: "باسن",
        gif: "https://fa.pelank.com/wp-content/uploads/2026/07/Barbell-Hip-Thrust.gif"
    },

    {
        name: "ساق پا",
        muscle: "ساق",
        gif: "https://morabihamrah.com/wp-content/uploads/2023/07/Dumbbell-Calf-Raise123.gif"
    },

    {
        name: "کرانچ",
        muscle: "شکم",
        gif: "https://mojekooh.com/wp-content/uploads/2023/09/%DA%A9%D8%B1%D8%A7%D9%86%DA%86-%D8%B4%DA%A9%D9%85.gif"
    },

    {
        name: "پلانک",
        muscle: "شکم",
        Image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqoBxh0AilvQIxLFgT1rjRF42cBcA3419_ular6qOTaQ&s=10"
    },


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
   (انتخاب روز + باز/بسته کردن کشویی)
===================================================== */

function handleDayHeaderClick(day) {

    if (!selectedDays[day]) {

        /*
            روز جدید انتخاب می‌شود
            و بخش مربوطه باز می‌شود.
        */

        saveCurrentDay();

        selectedDays[day] = {

            name: day,

            exercises: [

                createEmptyExercise()

            ]

        };

        currentDay = day;

    } else if (currentDay === day) {

        /*
            روز از قبل باز است،
            فقط بسته می‌شود (انتخاب باقی می‌ماند).
        */

        saveCurrentDay();

        currentDay = null;

    } else {

        /*
            روز از قبل انتخاب شده اما بسته است،
            حالا باز می‌شود.
        */

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


    const confirmed =
        confirm(
            "این روز از برنامه حذف شود؟"
        );


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

    const container =
        document.getElementById(
            "daySelector"
        );


    let html = "
        <div class="preview-athlete">

        <div class="athlete-field"><span class="athlete-label">ورزشکار:</span><span class="athlete-value">${escapeHTML(program.athlete_name) || "-"}</span></div>
        <div class="athlete-field"><span class="athlete-label">سن:</span><span class="athlete-value">${escapeHTML(program.athlete_age) || "-"}</span></div>
        <div class="athlete-field"><span class="athlete-label">قد:</span><span class="athlete-value">${escapeHTML(program.athlete_height) || "-"}</span></div>
        <div class="athlete-field"><span class="athlete-label">وزن:</span><span class="athlete-value">${escapeHTML(program.athlete_weight) || "-"}</span></div>
        <div class="athlete-field"><span class="athlete-label">هدف:</span><span class="athlete-value">${escapeHTML(program.athlete_goal) || "-"}</span></div>
        <div class="athlete-field"><span class="athlete-label">جنسیت:</span><span class="athlete-value">${escapeHTML(program.athlete_gender) || "-"}</span></div>

    </div>
      ";


    DAY_DEFS.forEach(def => {

        const day = def.key;

        const isSelected =
            Boolean(
                selectedDays[day]
            );

        const isOpen =
            isSelected &&
            currentDay === day;


        html += `

            <div class="day-accordion-item ${
                isSelected ? "selected" : ""
            } ${
                isOpen ? "open" : ""
            }">

                <div
                    class="day-accordion-header"
                    onclick="handleDayHeaderClick('${day}')">

                    <div class="day-accordion-title">

                        <span class="day-check">
                            ${isSelected ? "✓" : ""}
                        </span>

                        <span>
                            ${def.label}
                        </span>

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

                        <span class="day-chevron">
                            ⌄
                        </span>

                    </div>

                </div>


                ${
                    isOpen
                    ? `
                    <div class="day-accordion-body">
                    
                        <div class="workout-area">

                            ${
                                selectedDays[day].exercises
                                    .map((exercise, index) =>
                                        createExerciseHTML(exercise, index)
                                    )
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



function createExerciseHTML(
    exercise,
    index
) {

    return `

        <div
            class="exercise-row"
            data-index="${index}">


                        <div class="exercise-field" style="position: relative;">

                <label>
                    نام حرکت
                </label>

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

                <label>
                    عضله هدف
                </label>

                <select
                    class="muscle-select">

                    <option value="">
                        انتخاب
                    </option>

                    ${[
                        "سینه",
                        "پشت",
                        "سرشانه",
                        "جلو بازو",
                        "پشت بازو",
                        "چهارسر ران",
                        "همسترینگ",
                        "باسن",
                        "ساق",
                        "شکم"
                    ].map(
                        muscle => `

                        <option
                            ${
                                exercise.muscle === muscle
                                ? "selected"
                                : ""
                            }>

                            ${muscle}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div class="exercise-field">

                <label>
                    ست
                </label>

                <select class="sets">

                    ${[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6"
                    ].map(
                        value => `

                        <option
                            ${
                                exercise.sets === value
                                ? "selected"
                                : ""
                            }>

                            ${value}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div class="exercise-field">

                <label>
                    تکرار
                </label>

                <select class="reps">

                    ${[
                        "6",
                        "8",
                        "10",
                        "12",
                        "15",
                        "20",
                        "تا ناتوانی"
                    ].map(
                        value => `

                        <option
                            ${
                                exercise.reps === value
                                ? "selected"
                                : ""
                            }>

                            ${value}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div class="exercise-field">

                <label>
                    استراحت
                </label>

                <select class="rest">

                    ${[
                        "30 ثانیه",
                        "45 ثانیه",
                        "60 ثانیه",
                        "2 دقیقه",
                        "3 دقیقه",
                        "5 دقیقه"
                    ].map(
                        value => `

                        <option
                            ${
                                exercise.rest === value
                                ? "selected"
                                : ""
                            }>

                            ${value}

                        </option>

                    `).join("")}

                </select>

            </div> 


            <div class="exercise-field">

                <label>
                    وزنه (kg)
                </label>

                <input
                    type="number"
                    class="exercise-weight"
                    min="1"
                    max="400"
                    value="${escapeHTML(exercise.weight)}"
                    placeholder=" kg 1-400">

            </div>


            <button
                class="delete-exercise"
                onclick="deleteExercise(${index})">

                ×

            </button>

            <button
                type="button"
                class="add-exercise-main"
                onclick="addExercise()">

                    + افزودن حرکت

            </button>

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


    const exerciseData =
        exercises.find(
            item => item.name === name
        );


    const gifUrl =
        exerciseData && exerciseData.gif;


    const body =
        document.getElementById(
            "gifModalBody"
        );


    if (gifUrl) {

        body.innerHTML = `

            <h3>${escapeHTML(name)}</h3>

            <img
                src="${gifUrl}"
                alt="${escapeHTML(name)}"
                class="guide-gif">

        `;

    } else {

        const searchUrl =
            "https://www.google.com/search?tbm=isch&q="
            +
            encodeURIComponent(name + " تمرین بدنسازی");


        /* FIX: تگ <a> ناقص بود (کلمه a جا افتاده بود) */
        body.innerHTML = `

            <h3>${escapeHTML(name)}</h3>

            <p>گیف این حرکت هنوز ثبت نشده است.</p>

            <a
                href="${searchUrl}"
                target="_blank"
                class="guide-search-link">

                جست‌وجوی تصویر «${escapeHTML(name)}»

            </a>

        `;

    }


    document.getElementById(
        "gifModal"
    ).classList.remove("hidden");

}


function closeGifModal() {

    document.getElementById(
        "gifModal"
    ).classList.add("hidden");

}


function addExercise() {

    if (!currentDay) {

        alert(
            "ابتدا یک روز تمرین را انتخاب کنید."
        );

        return;

    }


    saveCurrentDay();


    selectedDays[
        currentDay
    ].exercises.push(
        createEmptyExercise()
    );


    renderDayAccordion();

}


/* =====================================================
   DELETE EXERCISE
===================================================== */

function deleteExercise(index) {

    if (!currentDay) return;


    saveCurrentDay();


    /* FIX: قبلاً این متغیر محلی "exercises" نام‌گذاری شده بود
       و آرایه‌ی سراسری دیتابیس تمرین‌ها (exercises) را
       داخل این تابع مخفی (shadow) می‌کرد. */
    const dayExercises =
        selectedDays[
            currentDay
        ].exercises;


    if (dayExercises.length <= 1) {

        alert(
            "حداقل یک حرکت باید وجود داشته باشد."
        );

        return;

    }


    dayExercises.splice(
        index,
        1
    );


    renderDayAccordion();

}


/* =====================================================
   EXERCISE CHANGED
===================================================== */

function exerciseChanged(select) {

    const row =
        select.closest(
            ".exercise-row"
        );


    const option =
        select.options[
            select.selectedIndex
        ];


    const muscle =
        option.dataset.muscle;


    if (muscle) {

        row.querySelector(
            ".muscle-select"
        ).value =
            muscle;

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
   GENERATE PROGRAM NAME (خودکار، بدون فیلد ورودی)
===================================================== */

function generateProgramName() {

    const athleteName =
        document.getElementById(
            "athleteName"
        ).value.trim() || "ورزشکار";


    const dateText =
        new Date().toLocaleDateString(
            "fa-IR"
        );


    return `برنامه ${athleteName} - ${dateText}`;

}


/* =====================================================
   COLLECT PROGRAM
===================================================== */

function collectProgram() {

    saveCurrentDay();


    return {

        athlete_name:
            document.getElementById(
                "athleteName"
            ).value.trim(),

        athlete_age:
            document.getElementById(
                "athleteAge"
            ).value,

        athlete_height:
            document.getElementById(
                "athleteHeight"
            ).value,

        athlete_weight:
            document.getElementById(
                "athleteWeight"
            ).value,

        athlete_goal:
            document.getElementById(
                "athleteGoal"
            ).value,
       athlete_gender:
            document.getElementById(
               "athleteGender"
            ).value,

        program_name:
            generateProgramName(),

        days:
            Object.values(
                selectedDays
            ),

        notes:
            document.getElementById(
                "programNotes"
            ).value

    };

}


/* =====================================================
   SAVE PROGRAM
===================================================== */

async function saveProgram() {

    const data =
        collectProgram();


    if (!data.athlete_name) {

        alert(
            "اطلاعات ورزشکار را وارد کنید."
        );

        return;

    }

      const namePattern = /^[\u0600-\u06FF\s]+$/;
      const hasDigits = /[\u0660-\u0669\u06F0-\u06F9]/;

      if (hasDigits.test(data.athlete_name)) {

        alert(
           "نام شاگرد باید فقط شامل حروف فارسی باشد و نباید عدد یا کاراکتر دیگری داشته باشد."
        );

        return;

      }


    if (data.days.length === 0) {

        alert(
            "حداقل یک روز تمرین انتخاب کنید."
        );

        return;
      }


    try {

        const response =
            await fetch(
                "/api/program",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            data
                        )

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message
            );

            return;

        }


        document.getElementById(
            "quota"
        ).textContent =
            result.remaining;


        loadHistory();


        openPreview(data);

        resetProgramForm();


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

    const container =
        document.getElementById(
            "historyList"
        );


    try {

        const response =
            await fetch(
                "/api/programs"
            );


        const programs =
            await response.json();


        if (programs.length === 0) {

            container.innerHTML = `

                <div class="empty-history">

                    هنوز برنامه‌ای ذخیره نشده است.

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        programs.forEach(
            program => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "history-item";


                const date =
                    new Date(
                        program.created_at
                    );


                const dateText =
                    date.toLocaleDateString(
                        "fa-IR"
                    );


                item.innerHTML = `

                    <div
                        class="history-info">

                        <strong>
                            ${escapeHTML(
                                program.athlete_name
                            )}
                        </strong>

                        <small>
                            ${dateText}
                        </small>

                    </div>


                    <div
                        class="history-actions">

                        <button
                            onclick="viewProgram(
                                ${program.id}
                            )">

                            مشاهده

                        </button>


                        <button
                            onclick="deleteProgram(
                                ${program.id}
                            )"
                            class="history-delete">

                            حذف

                        </button>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "خطا در دریافت تاریخچه.";

    }

}


/* =====================================================
   VIEW PROGRAM
===================================================== */

async function viewProgram(id) {

    try {

        const response =
            await fetch(
                `/api/program/${id}`
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message
            );

            return;

        }


        const program =
            result.program;


        openPreview({

            athlete_name:
                program.athlete_name,

            athlete_age:
                program.athlete_age,

            athlete_height:
                program.athlete_height,

            athlete_weight:
                program.athlete_weight,

            athlete_goal:
                program.athlete_goal,

            notes:
                program.notes,

            days:
                program.program_data

        });


    } catch (error) {

        alert(
            "خطا در دریافت برنامه."
        );

    }

}


/* =====================================================
   DELETE PROGRAM
===================================================== */

async function deleteProgram(id) {

    const confirmed =
        confirm(
            "آیا از حذف این برنامه مطمئن هستید؟"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `/api/program/${id}`,
                {

                    method:
                        "DELETE"

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message
            );

            return;

        }


        loadHistory();


    } catch (error) {

        alert(
            "خطا در حذف برنامه."
        );

    }

}


/* =====================================================
   NEW PROGRAM
===================================================== */

function newProgram() {

    const confirmed =
        confirm(
            "اطلاعات برنامه فعلی پاک شود؟"
        );


    if (!confirmed) return;


    resetProgramForm();

}


/* =====================================================
   RESET PROGRAM FORM
===================================================== */

function resetProgramForm() {

    document.getElementById(
        "athleteName"
    ).value = "";


    document.getElementById(
        "athleteAge"
    ).value = "";


    document.getElementById(
        "athleteHeight"
    ).value = "";


    document.getElementById(
        "athleteWeight"
    ).value = "";


    document.getElementById(
        "athleteGoal"
    ).value = "";

   document.getElementById(
       "athleteGender"
    ).value = "";


    document.getElementById(
        "programNotes"
    ).value = "";


    selectedDays = {};

    currentDay = null;


    renderDayAccordion();

}


/* =====================================================
   PREVIEW MODAL
===================================================== */

function buildProgramPreviewHTML(program) {

    const days =
        program.days || [];


    let html = `

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
                            <th> اجرا حرکت</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            (day.exercises || [])
                                .map((exercise, index) => {

                              
                                    const exerciseInfo =
                                        exercises.find(
                                            item => item.name === exercise.exercise
                                        );

                                    const gifUrl =
                                        (exerciseInfo && exerciseInfo.gif) || "";


                                    return `
                                        <tr>
                                            
                                            <td>${escapeHTML(exercise.exercise) || "-"}</td>
                                            <td>${escapeHTML(exercise.muscle) || "-"}</td>
                                            <td>${escapeHTML(exercise.sets) || "-"}</td>
                                            <td>${escapeHTML(exercise.reps) || "-"}</td>
                                            <td>${escapeHTML(exercise.rest) || "-"}</td>
                                            <td>${escapeHTML(exercise.weight) || "-"}</td>
                                            
                                            <td>
                                                ${
                                                    gifUrl
                                                    ? `
                                                        <a
                                                            href="${gifUrl}"
                                                            target="_blank"
                                                            class="exercise-guide-link">
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
                                       
                                    `;

                                })
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    });


    if (program.notes) {

        html += `

            <div class="preview-notes">
                <strong>توضیحات برنامه:</strong>
                <p>${escapeHTML(program.notes)}</p>
            </div>

        `;

    }


    return html;

}


function openPreview(program, savedMessage) {

    const body =
        document.getElementById(
            "previewBody"
        );


    let html = "";


    if (savedMessage) {

        html += `

            <div class="preview-saved-banner">
                ✔ ${escapeHTML(savedMessage)}
            </div>

        `;

    }


    html += buildProgramPreviewHTML(
        program
    );


    body.innerHTML = html;


    document.getElementById(
        "previewModal"
    ).classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-active"
    );

}


function closePreview() {

    document.getElementById(
        "previewModal"
    ).classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-active"
    );

}


/* =====================================================
   PDF
===================================================== */

//  function exportPDF() 


 async function exportPDF() {

    closeGifModal();

    saveCurrentDay();


    const previewBody =
        document.getElementById(
            "previewBody"
        );


    if (!previewBody) {

        alert(
            "پیش‌نمایش برنامه پیدا نشد."
        );

        return;

    }


    const html =
        previewBody.innerHTML;


    try {

        const response =
            await fetch(
                "/api/program/pdf",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        html: html
                    })

                }
            );


        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(
                error.message ||
                "خطا در ساخت PDF"
            );

        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "FIT_PLAN.pdf";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );


    }

    catch (error) {

        console.error(
            "PDF ERROR:",
            error
        );

        alert(
            "خطا در ساخت PDF: " +
            error.message
        );

    }

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (!value) return "";


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
