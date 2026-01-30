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
    const searchResultsContainer = document.getElementById('search-results');

    bookSelect.addEventListener('change', handleBookChange);
    chapterSelect.addEventListener('change', ui.displayChapter);
    logoDiv.addEventListener('click', ui.showIndexView);
    searchForm.addEventListener('submit', handleSearch);
    searchResultsContainer.addEventListener('click', handleSearchResultClick);
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

async function handleSearchResultClick(event) {
    event.preventDefault();
    const link = event.target.closest('.search-result-item-link');
    if (!link) {
        return;
    }

    const bookCode = link.dataset.bookCode;
    const chapter = parseInt(link.dataset.chapter, 10);
    const verse = parseInt(link.dataset.verse, 10);

    if (bookCode && chapter) {
        await ui.showBookView(bookCode, chapter);

        // Scroll to verse after a short delay to allow for rendering
        setTimeout(() => {
            const verseElement = document.querySelector(`#chapter-text p[data-verse="${verse}"]`);
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: add a highlight class
                verseElement.classList.add('highlight');
                setTimeout(() => verseElement.classList.remove('highlight'), 2000);
            }
        }, 100);
    }
}
