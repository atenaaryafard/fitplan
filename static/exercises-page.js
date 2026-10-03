/* =====================================
   FIT PLAN
   EXERCISE LIBRARY PAGE
===================================== */


/* =====================================
   PAGE LOAD
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    initExerciseLibrary();

});


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
        !exerciseGrid ||
        !exerciseSearch ||
        !resultCount ||
        !emptyResult ||
        !clearSearch
    ) {
        console.error("Exercise library elements not found.");
        return;
    }


    if (
        typeof exercises === "undefined" ||
        !Array.isArray(exercises)
    ) {

        exerciseGrid.innerHTML =
            '<div class="exercise-loading">' +
            'لیست حرکات در دسترس نیست.' +
            '</div>';

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
        toPersianNumber(list.length) + " حرکت";


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


    if (gif) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "exercise-gif-wrapper";


        const image =
            document.createElement("img");

        image.src =
            escapeAttribute(gif);

        image.alt =
            escapeAttribute(name);

        image.className =
            "exercise-gif";

        image.loading =
            "lazy";

        image.addEventListener(
            "error",
            function () {
                handleGifError(this);
            }
        );


        wrapper.appendChild(image);

        card.appendChild(wrapper);

    } else {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "exercise-gif-wrapper";


        const noGif =
            document.createElement("div");

        noGif.className =
            "no-gif";


        const icon =
            document.createElement("div");

        icon.className =
            "no-gif-icon";

        icon.textContent =
            "🏋️";


        const text =
            document.createElement("span");

        text.textContent =
            "گیف این حرکت ثبت نشده";


        noGif.appendChild(icon);

        noGif.appendChild(text);

        wrapper.appendChild(noGif);

        card.appendChild(wrapper);

    }


    const info =
        document.createElement("div");

    info.className =
        "exercise-info";


    const title =
        document.createElement("h2");

    title.className =
        "exercise-name";

    title.textContent =
        name;


    const muscleElement =
        document.createElement("span");

    muscleElement.className =
        "exercise-muscle";

    muscleElement.textContent =
        muscle;


    info.appendChild(title);

    info.appendChild(muscleElement);

    card.appendChild(info);


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
            exercises.filter(
                function (exercise) {

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

                }
            );


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
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
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


    if (!wrapper) {
        return;
    }


    wrapper.innerHTML =
        '<div class="no-gif">' +
            '<div class="no-gif-icon">🏋️</div>' +
            '<span>گیف این حرکت در دسترس نیست</span>' +
        '</div>';

}
