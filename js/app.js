// biblia/js/app.js

import * as api from './api.js';
import * as ui from './ui.js';

const searchInput = document.getElementById('search-input');

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    setupEventListeners();
    registerServiceWorker(); // Movido para uma função dedicada
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

        const hashLocation = parseHash();
        if (hashLocation) {
            await ui.showBookView(hashLocation.bookCode, hashLocation.chapterNum);
        } else {
            const lastReadBookCode = localStorage.getItem('lastReadBook');
            const lastReadChapterNum = localStorage.getItem('lastReadChapter');

            if (lastReadBookCode && lastReadChapterNum) {
                await ui.showBookView(lastReadBookCode, parseInt(lastReadChapterNum, 10));
            } else {
                ui.showIndexView();
            }
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
    ui.setupSearch((text) => performSearch(text));

    window.addEventListener('hashchange', handleHashChange);
}

async function handleHashChange() {
    const hashLocation = parseHash();
    if (hashLocation) {
        await ui.showBookView(hashLocation.bookCode, hashLocation.chapterNum);
    } else {
        // Optionally, if hash is cleared, revert to initial state or default view
        ui.showIndexView();
    }
}

function parseHash() {
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash) {
        const parts = hash.split('/');
        if (parts.length === 2) {
            const bookCode = parts[0];
            const chapterNum = parseInt(parts[1], 10);
            if (bookCode && !isNaN(chapterNum) && chapterNum > 0) {
                return { bookCode, chapterNum };
            }
        }
    }
    return null;
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
    if (searchText) await performSearch(searchText);
}

async function performSearch(searchText) {
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

        requestAnimationFrame(() => {
            const verseElement = document.querySelector(`#chapter-text p[data-verse="${verse}"]`);
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseElement.classList.add('highlight');
                setTimeout(() => verseElement.classList.remove('highlight'), 2000);
            }
        });
    }
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrado com sucesso:', registration);

            // Listener para detectar quando um novo SW está pronto
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Novo SW está esperando para ativar. Mostra a notificação.
                        showUpdateNotification(registration);
                    }
                });
            });
        } catch (err) {
            console.error('Falha ao registrar o Service Worker:', err);
        }
    }
}

function showUpdateNotification(registration) {
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.innerHTML = `
        <span>Uma nova versão está disponível.</span>
        <button id="sw-update-button">Atualizar</button>
    `;
    document.body.appendChild(notification);

    document.getElementById('sw-update-button').addEventListener('click', () => {
        // Envia mensagem para o SW em espera para que ele ative
        if (registration.waiting) {
            registration.waiting.postMessage({ action: 'skipWaiting' });
        }
    });
}

// Listener para recarregar a página quando o novo SW assumir o controle
let refreshing;
navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
});

