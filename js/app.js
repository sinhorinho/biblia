// biblia/js/app.js

import * as api from './api.js';
import * as ui from './ui.js';

const searchInput = document.getElementById('search-input');

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    setupEventListeners();
    ui.setupTheme();
    ui.setupFontControls();
    ui.setupScrollToTop();

    try {
        const books = await api.getBooks();
        if (books.length === 0) {
            throw new Error('No books loaded.');
        }
        
        ui.setBooks(books);
        ui.populateBookIndex(books, ui.showBookView);
        ui.populateBookSelect(books);

        const lastReadBookCode = localStorage.getItem('lastReadBook');
        const lastReadChapterNum = localStorage.getItem('lastReadChapter');

        if (lastReadBookCode && lastReadChapterNum) {
            await ui.showBookView(lastReadBookCode, parseInt(lastReadChapterNum, 10));
        } else {
            ui.showIndexView();
        }

    } catch (error) {
        console.error("Initialization Error:", error);
        document.getElementById('book-index').innerHTML = '<p>Erro: Não foi possível carregar os dados da Bíblia. Verifique sua conexão ou tente novamente mais tarde.</p>';
    }
}

function setupEventListeners() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const logoDiv = document.querySelector('.logo');
    const searchForm = document.getElementById('search-form');

    bookSelect.addEventListener('change', handleBookChange);
    chapterSelect.addEventListener('change', ui.displayChapter);
    logoDiv.addEventListener('click', ui.showIndexView);
    searchForm.addEventListener('submit', handleSearch);
}

async function handleBookChange() {
    const bookSelect = document.getElementById('book-select');
    const bookCode = bookSelect.value;
    await ui.populateChapterSelect(bookCode);
    await ui.displayChapter();
}

async function handleSearch(event) {
    event.preventDefault();
    const searchText = searchInput.value.trim();
    if (!searchText) {
        return;
    }

    ui.showSearchResultsView();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<h2>Buscando...</h2>';

    const results = await api.searchBible(searchText);
    ui.displaySearchResults(results, searchText);
}
