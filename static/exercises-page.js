```javascript
/* =====================================
   FIT PLAN
   EXERCISE LIBRARY
===================================== */


/* =====================================
   PAGE LOAD
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initExerciseLibrary();

    }
);



/* =====================================
   ELEMENTS
===================================== */

const exerciseGrid =
    document.getElementById("exerciseGrid");

const exerciseSearch =
    document.getElementById("exerciseSearch");

const resultCount =
    document.getElementById("resultCount");

const emptyResult =
    document.getElementById("emptyResult");

const clearSearch =
    document.getElementById("clearSearch");



/* =====================================
   INITIALIZE
===================================== */

function initExerciseLibrary() {

    if (
        typeof exercises === "undefined" ||
        !Array.isArray(exercises)
    ) {

        exerciseGrid.innerHTML = `
            <div class="exercise-loading">
                لیست حرکات در دسترس نیست.
            </div>
        `;

        resultCount.textContent =
            "خطا در دریافت لیست حرکات.";

        return;

    }


    renderExercises(exercises);

}



/* =====================================
   RENDER EXERCISES
===================================== */

function renderExercises(list) {

    exerciseGrid.innerHTML = "";

    emptyResult.classList.add("hidden");


    if (!list || list.length === 0) {

        emptyResult.classList.remove("hidden");

        resultCount.textContent =
            "حرکتی پیدا نشد.";

        return;

    }


    resultCount.textContent =
        `${toPersianNumber(list.length)} حرکت`;


    list.forEach(function (exercise) {

        const card =
            createExerciseCard(exercise);

        exerciseGrid.appendChild(card);

    });

}



/* =====================================
   CREATE CARD
===================================== */

function createExerciseCard(exercise) {

    const card =
        document.createElement("article");

    card.className =
        "exercise-card";


    const name =
        exercise.name || "حرکت بدون نام";

    const muscle =
        exercise.muscle || "عضله مشخص نشده";

    const gif =
        exercise.gif || "";


    let gifHTML = "";


    if (gif) {

        gifHTML = `
            <img
                src="${escapeAttribute(gif)}"
                alt="${escapeAttribute(name)}"
                class="exercise-gif"
                loading="lazy"
                onerror="handleGifError(this)"
            >
        `;

    } else {

        gifHTML = `
            <div class="no-gif">

                <div class="no-gif-icon">
                    🏋️
                </div>

                <span>
                    گیف این حرکت ثبت نشده
                </span>

            </div>
        `;

    }


    card.innerHTML = `

        <div class="exercise-gif-wrapper">

            ${gifHTML}

        </div>


        <div class="exercise-info">

            <h2 class="exercise-name">
                ${escapeHTML(name)}
            </h2>

            <span class="exercise-muscle">
                ${escapeHTML(muscle)}
            </span>

        </div>

    `;


    return card;

}



/* =====================================
   SEARCH
===================================== */

exerciseSearch.addEventListener(
    "input",
    function () {

        const query =
            normalizeText(
                this.value.trim()
            );


        if (query) {

            clearSearch.classList.remove(
                "hidden"
            );

        } else {

            clearSearch.classList.add(
                "hidden"
            );

        }


        if (!query) {

            renderExercises(exercises);

            return;

        }


        const filtered =
            exercises.filter(function (exercise) {

                const name =
                    normalizeText(
                        exercise.name || ""
                    );


                const muscle =
                    normalizeText(
                        exercise.muscle || ""
                    );


                return (
                    name.includes(query) ||
                    muscle.includes(query)
                );

            });


        renderExercises(filtered);

    }
);



/* =====================================
   CLEAR SEARCH
===================================== */

clearSearch.addEventListener(
    "click",
    function () {

        exerciseSearch.value = "";

        clearSearch.classList.add(
            "hidden"
        );

        renderExercises(exercises);

        exerciseSearch.focus();

    }
);



/* =====================================
   NORMALIZE PERSIAN TEXT
===================================== */

function normalizeText(text) {

    return String(text)

        .trim()

        .toLowerCase()

        // ی عربی → ی فارسی
        .replace(/ي/g, "ی")

        // ک عربی → ک فارسی
        .replace(/ك/g, "ک")

        // حذف فاصله‌های اضافی
        .replace(/\s+/g, " ");

}



/* =====================================
   PERSIAN NUMBERS
===================================== */

function toPersianNumber(number) {

    return String(number).replace(
        /\d/g,
        function (digit) {

            return "۰۱۲۳۴۵۶۷۸۹"[digit];

        }
    );

}



/* =====================================
   ESCAPE HTML
===================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



/* =====================================
   ESCAPE ATTRIBUTE
===================================== */

function escapeAttribute(value) {

    return escapeHTML(value);

}



/* =====================================
   GIF ERROR
===================================== */

function handleGifError(image) {

    const wrapper =
        image.closest(
            ".exercise-gif-wrapper"
        );


    wrapper.innerHTML = `

        <div class="no-gif">

            <div class="no-gif-icon">
                🏋️
            </div>

            <span>
                گیف این حرکت در دسترس نیست
            </span>

        </div>

    `;

}
```
