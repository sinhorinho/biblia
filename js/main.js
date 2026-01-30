// biblia/js/main.js

window.addEventListener('load', () => {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const contentDiv = document.getElementById('content');

    // Cache to store loaded book data
    const bibleDataCache = {};

    async function initialize() {
        setupEventListeners();
        setupTheme();
        setupFontControls();
        setupScrollToTop();

        try {
            const response = await fetch('data/books.json');
            if (!response.ok) {
                throw new Error('Failed to load books index.');
            }
            const books = await response.json();
            
            populateBookSelect(books);

            if (bookSelect.options.length > 0) {
                await handleBookChange();
            }

        } catch (error) {
            console.error("Initialization Error:", error);
            contentDiv.innerHTML = '<p>Erro: Não foi possível carregar os dados da Bíblia. Verifique sua conexão ou tente novamente mais tarde.</p>';
        }
    }
    
    function setupEventListeners() {
        bookSelect.addEventListener('change', handleBookChange);
        chapterSelect.addEventListener('change', displayChapter);
    }

    async function handleBookChange() {
        const bookCode = bookSelect.value;
        await populateChapterSelect(bookCode);
        await displayChapter();
    }

    async function getBookData(bookCode) {
        if (bibleDataCache[bookCode]) {
            return bibleDataCache[bookCode];
        }

        try {
            const response = await fetch(`data/${bookCode}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load book: ${bookCode}`);
            }
            const bookData = await response.json();
            bibleDataCache[bookCode] = bookData;
            return bookData;
        } catch (error) {
            console.error("Error fetching book data:", error);
            contentDiv.innerHTML = `<p>Erro ao carregar o livro ${bookCode}.</p>`;
            return null;
        }
    }

    function populateBookSelect(books) {
        bookSelect.innerHTML = '';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.code;
            option.textContent = book.name;
            bookSelect.appendChild(option);
        });
    }

    async function populateChapterSelect(bookCode) {
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

    async function displayChapter() {
        const selectedBookCode = bookSelect.value;
        const selectedChapterNum = parseInt(chapterSelect.value, 10);

        if (!selectedBookCode || isNaN(selectedChapterNum)) {
            contentDiv.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book-open"></i><p>Selecione um livro para iniciar a leitura.</p></div>';
            return;
        }

        const bookData = await getBookData(selectedBookCode);

        if (bookData) {
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
        }
    }

    // --- UI Helper Functions ---

    function setupTheme() {
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

    function setupFontControls() {
        const btnIncrease = document.getElementById('btn-increase');
        const btnDecrease = document.getElementById('btn-decrease');
        let currentFontSize = 18;

        contentDiv.style.fontSize = `${currentFontSize}px`;

        if (btnIncrease && btnDecrease) {
            btnIncrease.addEventListener('click', () => {
                currentFontSize += 2;
                contentDiv.style.fontSize = `${currentFontSize}px`;
            });

            btnDecrease.addEventListener('click', () => {
                if (currentFontSize > 10) {
                    currentFontSize -= 2;
                    contentDiv.style.fontSize = `${currentFontSize}px`;
                }
            });
        }
    }

    function setupScrollToTop() {
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

    initialize();
});
