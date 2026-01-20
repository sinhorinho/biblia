// biblia/js/main.js

const CANONICAL_BOOK_ORDER = [
    "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm", "1rs", "2rs", "1cr", "2cr",
    "ed", "ne", "et", "jo", "sl", "pv", "ec", "ct", "is", "jr", "lm", "ez", "dn", "os",
    "jl", "am", "ob", "mq", "na", "hc", "sf", "ag", "zc", "ml",
    "mt", "mc", "lc", "joao", "atos", "rm", "1co", "2co", "gl", "ef", "fp", "cl", "1ts", "2ts",
    "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe", "2pe", "1jo", "2jo", "3jo", "jd", "ap"
];

window.addEventListener('load', () => {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const contentDiv = document.getElementById('content');

    initialize();

    function initialize() {
        if (typeof window.bibleData === 'undefined' || Object.keys(window.bibleData).length === 0) {
            contentDiv.innerHTML = '<p>Erro: Dados da Bíblia não carregados. Verifique se os scripts da pasta `js/content` estão sendo carregados corretamente no `index.html`.</p>';
            return;
        }

        populateBookSelect();

        if (bookSelect.options.length > 0) {
            bookSelect.value = bookSelect.options[0].value;
            populateChapterSelect(bookSelect.value);
            if (chapterSelect.options.length > 0) {
                chapterSelect.value = chapterSelect.options[0].value;
            }
            displayChapter();
        }

        const btnIncrease = document.getElementById('btn-increase');
        const btnDecrease = document.getElementById('btn-decrease');
        let currentFontSize = 18; // Default size in pixels

        contentDiv.style.fontSize = `${currentFontSize}px`;

        const themeToggleBtn = document.getElementById('theme-toggle');

        // Initialize Theme
        const storedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', storedTheme);
        updateThemeIcon(storedTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            });
        }

        function updateThemeIcon(theme) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fa-solid fa-sun';
                } else {
                    icon.className = 'fa-solid fa-moon';
                }
            }
        }

        if (btnIncrease && btnDecrease) {
            btnIncrease.addEventListener('click', () => {
                currentFontSize += 2;
                contentDiv.style.fontSize = `${currentFontSize}px`;
            });

            btnDecrease.addEventListener('click', () => {
                if (currentFontSize > 10) { // Minimum readable size
                    currentFontSize -= 2;
                    contentDiv.style.fontSize = `${currentFontSize}px`;
                }
            });
        }

        const btnTop = document.getElementById('btn-top');

        if (btnTop) {
            window.onscroll = function () {
                if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                    btnTop.style.display = "block";
                } else {
                    btnTop.style.display = "none";
                }
            };

            btnTop.addEventListener('click', () => {
                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            });
        }

        bookSelect.addEventListener('change', () => {
            populateChapterSelect(bookSelect.value);
            displayChapter();
        });

        chapterSelect.addEventListener('change', displayChapter);
    }

    function populateBookSelect() {
        const availableBookCodes = Object.keys(window.bibleData);

        const sortedBookCodes = CANONICAL_BOOK_ORDER.filter(bookCode =>
            availableBookCodes.includes(bookCode)
        ).sort((a, b) => CANONICAL_BOOK_ORDER.indexOf(a) - CANONICAL_BOOK_ORDER.indexOf(b));

        sortedBookCodes.forEach(bookCode => {
            const bookData = window.bibleData[bookCode];
            if (bookData && bookData.name) {
                const option = document.createElement('option');
                option.value = bookCode;
                option.textContent = bookData.name;
                bookSelect.appendChild(option);
            }
        });
    }

    function populateChapterSelect(bookCode) {
        chapterSelect.innerHTML = ''; // Limpa capítulos anteriores
        if (bookCode && window.bibleData[bookCode]) {
            const bookData = window.bibleData[bookCode];
            bookData.chapters.forEach((chapterData, index) => {
                const option = document.createElement('option');
                if (Array.isArray(chapterData)) {
                    // New format: Index + 1 is the chapter number
                    option.value = index + 1;
                    option.textContent = `Capítulo ${index + 1}`;
                } else {
                    // Old format: Object with .chapter property
                    option.value = chapterData.chapter;
                    option.textContent = `Capítulo ${chapterData.chapter}`;
                }
                chapterSelect.appendChild(option);
            });
        }
    }

    function displayChapter() {
        const selectedBookCode = bookSelect.value;
        const selectedChapterNum = parseInt(chapterSelect.value, 10); // Parse to int for matching

        if (selectedBookCode && !isNaN(selectedChapterNum) && window.bibleData[selectedBookCode]) {
            const bookData = window.bibleData[selectedBookCode];
            // Find the correct chapter object in the chapters array
            if (Array.isArray(bookData.chapters[0])) {
                // New format: Array of arrays
                // Arrays are 0-indexed, so Chapter 1 is at index 0
                const chapterVerses = bookData.chapters[selectedChapterNum - 1];

                if (chapterVerses) {
                    let chapterHtml = `<h2>${bookData.name} - Capítulo ${selectedChapterNum}</h2>`;
                    chapterVerses.forEach((verseText, index) => {
                        chapterHtml += `<p><strong>${index + 1}</strong> ${verseText}</p>`;
                    });
                    contentDiv.innerHTML = chapterHtml;
                } else {
                    contentDiv.innerHTML = '<p>Capítulo não encontrado.</p>';
                }

            } else {
                // Old format: Array of objects
                // Find the correct chapter object in the chapters array
                const chapterData = bookData.chapters.find(c => c.chapter === selectedChapterNum);

                if (chapterData) {
                    let chapterHtml = `<h2>${bookData.name} - Capítulo ${chapterData.chapter}</h2>`;
                    chapterData.verses.forEach(verse => {
                        chapterHtml += `<p><strong>${verse.verse}</strong> ${verse.text}</p>`;
                    });
                    contentDiv.innerHTML = chapterHtml;
                } else {
                    contentDiv.innerHTML = '<p>Capítulo não encontrado.</p>';
                }
            }
        }
    }
});
