// biblia/js/ui.js

import { getBookData } from './api.js';

const bookIndex = document.getElementById('book-index');
const bookContent = document.getElementById('book-content');
const chapterText = document.getElementById('chapter-text');
const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');

let allBooks = [];

export function setBooks(books) {
    allBooks = books;
}

export function populateBookIndex(books, onBookClick) {
    const oldTestamentBooks = [];
    const newTestamentBooks = [];
    const oldTestamentCodes = ["gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm", "1rs", "2rs", "1cr", "2cr", "ed", "ne", "et", "jo", "sl", "pv", "ec", "ct", "is", "jr", "lm", "ez", "dn", "os", "jl", "am", "ob", "mq", "na", "hc", "sf", "ag", "zc", "ml"];

    books.forEach(book => {
        if (oldTestamentCodes.includes(book.code)) {
            oldTestamentBooks.push(book);
        } else {
            newTestamentBooks.push(book);
        }
    });

    const createBookList = (title, bookList) => {
        let html = `<h2>${title}</h2><div class="book-grid">`;
        bookList.forEach(book => {
            html += `<a href="#" class="book-link" data-book-code="${book.code}">${book.name}</a>`;
        });
        html += `</div>`;
        return html;
    };

    bookIndex.innerHTML = createBookList('Antigo Testamento', oldTestamentBooks);
    bookIndex.innerHTML += createBookList('Novo Testamento', newTestamentBooks);
    
    document.querySelectorAll('.book-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const bookCode = e.target.getAttribute('data-book-code');
            onBookClick(bookCode, 1);
        });
    });
}

export async function showBookView(bookCode, chapterNum = 1) {
    bookIndex.style.display = 'none';
    bookContent.style.display = 'block';

    bookSelect.value = bookCode;
    await populateChapterSelect(bookCode);
    chapterSelect.value = chapterNum;
    await displayChapter();
}

export function showIndexView() {
    bookContent.style.display = 'none';
    document.getElementById('search-results').style.display = 'none';
    bookIndex.style.display = 'block';
}

export function populateBookSelect(books) {
    bookSelect.innerHTML = '';
    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.code;
        option.textContent = book.name;
        bookSelect.appendChild(option);
    });
}

export async function populateChapterSelect(bookCode) {
    chapterSelect.innerHTML = '';
    const bookData = await getBookData(bookCode);

    if (bookData && bookData.chapters) {
        bookData.chapters.forEach((chapterData, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = `Capítulo ${index + 1}`;
            chapterSelect.appendChild(option);
        });
    }
}

export async function displayChapter() {
    const selectedBookCode = bookSelect.value;
    const selectedChapterNum = parseInt(chapterSelect.value, 10);

    if (!selectedBookCode || isNaN(selectedChapterNum)) {
        chapterText.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book-open"></i><p>Selecione um capítulo para ler.</p></div>';
        return;
    }

    const bookData = await getBookData(selectedBookCode);

    if (bookData) {
        const chapterVerses = bookData.chapters[selectedChapterNum - 1];
        const bookName = allBooks.find(b => b.code === selectedBookCode)?.name || selectedBookCode;

                    if (chapterVerses) {
                        let chapterHtml = `<h2>${bookName} - Capítulo ${selectedChapterNum}</h2>`;
                        chapterVerses.forEach((verseText, index) => {
                            chapterHtml += `<p data-verse="${index + 1}"><strong>${index + 1}</strong> ${verseText}</p>`;
                        });
                        chapterText.innerHTML = chapterHtml;
        
                        localStorage.setItem('lastReadBook', selectedBookCode);
                        localStorage.setItem('lastReadChapter', selectedChapterNum);
                    } else {            chapterText.innerHTML = '<p>Capítulo não encontrado.</p>';
            localStorage.removeItem('lastReadBook');
            localStorage.removeItem('lastReadChapter');
        }
    }
}

export function setupTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
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
}

function updateThemeIcon(theme) {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

export function setupFontControls() {
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    let currentFontSize = 18;

    chapterText.style.fontSize = `${currentFontSize}px`;

    if (btnIncrease && btnDecrease) {
        btnIncrease.addEventListener('click', () => {
            currentFontSize += 2;
            chapterText.style.fontSize = `${currentFontSize}px`;
        });

        btnDecrease.addEventListener('click', () => {
            if (currentFontSize > 10) {
                currentFontSize -= 2;
                chapterText.style.fontSize = `${currentFontSize}px`;
            }
        });
    }
}

export function setupScrollToTop() {
    const btnTop = document.getElementById('btn-top');
    if (btnTop) {
        window.onscroll = () => {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                btnTop.style.display = "block";
            } else {
                btnTop.style.display = "none";
            }
        };
        btnTop.addEventListener('click', () => {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
}

export function showSearchResultsView() {
    bookIndex.style.display = 'none';
    bookContent.style.display = 'none';
    document.getElementById('search-results').style.display = 'block';
}

export function displaySearchResults(results, searchText) {
    const resultsContainer = document.getElementById('search-results');
    let html = `<h2>${results.length} resultado(s) para "${searchText}"</h2>`;

    if (results.length === 0) {
        html += '<p>Nenhum resultado encontrado.</p>';
    } else {
        results.forEach(result => {
            const regex = new RegExp(`(${searchText})`, 'gi');
            const highlightedText = result.text.replace(regex, '<mark>$1</mark>');

            html += `
                <a href="#" class="search-result-item-link" data-book-code="${result.bookCode}" data-chapter="${result.chapter}" data-verse="${result.verse}">
                    <div class="search-result-item">
                        <div class="meta">${result.bookName} ${result.chapter}:${result.verse}</div>
                        <p>${highlightedText}</p>
                    </div>
                </a>
            `;
        });
    }

    resultsContainer.innerHTML = html;
}
