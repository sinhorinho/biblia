// biblia/js/api.js

const bibleDataCache = {};

export async function getBooks() {
    try {
        const response = await fetch('data/books.json');
        if (!response.ok) {
            throw new Error('Failed to load books index.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
}

export async function getBookData(bookCode) {
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
        return null;
    }
}

export async function searchBible(searchText) {
    const searchResults = [];
    const books = await getBooks();

    for (const book of books) {
        const bookData = await getBookData(book.code);
        if (bookData && bookData.chapters) {
            bookData.chapters.forEach((chapter, chapterIndex) => {
                chapter.forEach((verse, verseIndex) => {
                    if (verse.toLowerCase().includes(searchText.toLowerCase())) {
                        searchResults.push({
                            bookName: book.name,
                            chapter: chapterIndex + 1,
                            verse: verseIndex + 1,
                            text: verse
                        });
                    }
                });
            });
        }
    }

    return searchResults;
}
