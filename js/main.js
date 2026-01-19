// biblia/js/main.js

const CANONICAL_BOOK_ORDER = [
    "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm", "1rs", "2rs", "1cr", "2cr",
    "ed", "ne", "et", "jó", "sl", "pv", "ec", "ct", "is", "jr", "lm", "ez", "dn", "os",
    "jl", "am", "ob", "mq", "na", "hc", "sf", "ag", "zc", "ml",
    "mt", "mc", "lc", "jn", "atos", "rm", "1co", "2co", "gl", "ef", "fp", "cl", "1ts", "2ts",
    "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe", "2pe", "1jo", "2jo", "3jo", "jd", "ap"
];

// Use o evento 'load' para garantir que todos os scripts de dados foram carregados
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

        // Font Size Logic
        const btnIncrease = document.getElementById('btn-increase');
        const btnDecrease = document.getElementById('btn-decrease');
        let currentFontSize = 18; // Default size in pixels

        // Set initial font size
        contentDiv.style.fontSize = `${currentFontSize}px`;

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

        // Adiciona os event listeners após a inicialização
        bookSelect.addEventListener('change', () => {
            populateChapterSelect(bookSelect.value);
            displayChapter();
        });

        chapterSelect.addEventListener('change', displayChapter);
    }

    // Preenche o seletor de livros
    function populateBookSelect() {
        // Obter todas as chaves de livro disponíveis
        const availableBookCodes = Object.keys(window.bibleData);

        // Filtrar e ordenar os livros disponíveis de acordo com a ordem canônica
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

    // Preenche o seletor de capítulos com base no livro selecionado
    function populateChapterSelect(bookCode) {
        chapterSelect.innerHTML = ''; // Limpa capítulos anteriores
        if (bookCode && window.bibleData[bookCode]) {
            const bookData = window.bibleData[bookCode];
            bookData.chapters.forEach(chapterObj => {
                const option = document.createElement('option');
                option.value = chapterObj.chapter;
                option.textContent = `Capítulo ${chapterObj.chapter}`;
                chapterSelect.appendChild(option);
            });
        }
    }

    // Exibe o conteúdo do capítulo selecionado, renderizando o HTML a partir dos dados puros
    function displayChapter() {
        const selectedBookCode = bookSelect.value;
        const selectedChapterNum = parseInt(chapterSelect.value, 10); // Parse to int for matching

        if (selectedBookCode && !isNaN(selectedChapterNum) && window.bibleData[selectedBookCode]) {
            const bookData = window.bibleData[selectedBookCode];
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
});
