// biblia/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const contentDiv = document.getElementById('content');

    // Ensure window.bibleData exists
    if (typeof window.bibleData === 'undefined' || Object.keys(window.bibleData).length === 0) {
        contentDiv.innerHTML = '<p>Erro: Dados da Bíblia não carregados. Verifique os scripts de conteúdo.</p>';
        return;
    }

    // Populate book select dropdown
    function populateBookSelect() {
        // Sort book codes alphabetically for consistent order
        const bookCodes = Object.keys(window.bibleData).sort();
        bookCodes.forEach(bookCode => {
            const option = document.createElement('option');
            option.value = bookCode;
            option.textContent = bookCode.toUpperCase(); // Display book code, could be improved with full names
            bookSelect.appendChild(option);
        });
    }

    // Populate chapter select dropdown based on selected book
    function populateChapterSelect(bookCode) {
        chapterSelect.innerHTML = ''; // Clear previous chapters
        if (bookCode && window.bibleData[bookCode]) {
            const chapters = Object.keys(window.bibleData[bookCode]).sort((a, b) => parseInt(a) - parseInt(b));
            chapters.forEach(chapterNum => {
                const option = document.createElement('option');
                option.value = chapterNum;
                option.textContent = `Capítulo ${chapterNum}`;
                chapterSelect.appendChild(option);
            });
        }
    }

    // Display selected chapter content
    function displayChapter() {
        const selectedBookCode = bookSelect.value;
        const selectedChapterNum = chapterSelect.value;

        if (selectedBookCode && selectedChapterNum && window.bibleData[selectedBookCode] && window.bibleData[selectedBookCode][selectedChapterNum]) {
            contentDiv.innerHTML = `<h2>${selectedBookCode.toUpperCase()} - Capítulo ${selectedChapterNum}</h2>` +
                                   window.bibleData[selectedBookCode][selectedChapterNum];
        } else {
            contentDiv.innerHTML = '<p>Selecione um livro e um capítulo para começar.</p>';
        }
    }

    function changeChapter(chapterNum) {
        const chapterSelect = document.getElementById('chapter-select');
        chapterSelect.value = chapterNum;
        chapterSelect.dispatchEvent(new Event('change'));
    }

    // Event Listeners
    bookSelect.addEventListener('change', () => {
        populateChapterSelect(bookSelect.value);
        displayChapter(); // Display content of the first chapter of the new book
    });

    chapterSelect.addEventListener('change', displayChapter);

    // Initial setup
    populateBookSelect();
    // Select the first book and populate its chapters, then display content
    if (bookSelect.options.length > 0) {
        bookSelect.value = bookSelect.options[0].value; // Select first book
        populateChapterSelect(bookSelect.value);
        if (chapterSelect.options.length > 0) {
            chapterSelect.value = chapterSelect.options[0].value; // Select first chapter
        }
        displayChapter();
    }
});
