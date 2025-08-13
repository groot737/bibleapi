const baseURL = "https://bibleapi-tgc1.onrender.com/";
const translations = document.getElementById('translation');
const books = document.getElementById('book');
const chapter = document.getElementById('chapter');
const content = document.getElementById('content');
let selectedTranslation;

// Announce helper
const announce = (message) => {
    if (!content) return;
    content.setAttribute('aria-busy', 'true');
    content.textContent = message;
};

// Clear announce
const clearAnnounce = () => {
    if (!content) return;
    content.removeAttribute('aria-busy');
};

// Fetch data from API
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return { error: true, message: 'Failed to load data. Please try again.' };
    }
};

// Populate dropdown with options
const populateDropdown = (dropdown, data, key, value, placeholder) => {
    dropdown.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[key];
        option.textContent = item[value];
        dropdown.appendChild(option);
    });
};

// Manage control states
const setControlStates = ({ booksDisabled, chaptersDisabled }) => {
    books.disabled = booksDisabled;
    chapter.disabled = chaptersDisabled;
};

// Fetch and populate translations
const loadTranslations = async () => {
    announce('Loading translations…');
    const data = await fetchData(`${baseURL}api/bible/all`);
    if (data && !data.error) {
        populateDropdown(translations, data, 'id', 'name', 'Select Bible');
        clearAnnounce();
    } else {
        announce(data.message || 'Failed to load translations.');
    }
};

// Fetch and populate books
const loadBooks = async () => {
    if (translations.value >= 1) {
        selectedTranslation = translations.value;
        setControlStates({ booksDisabled: true, chaptersDisabled: true });
        announce('Loading books…');
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/books`);
        if (data && !data.error) {
            populateDropdown(books, data, 'index', 'name', 'Select Book');
            setControlStates({ booksDisabled: false, chaptersDisabled: true });
            clearAnnounce();
            if (data.length > 0) {
                books.value = data[0].index;
                books.dispatchEvent(new Event('change'));
            }
        } else {
            announce(data.message || 'Failed to load books.');
        }
    } else {
        books.innerHTML = '<option value="">Select Book</option>';
        chapter.innerHTML = '<option value="">Select Chapter</option>';
        setControlStates({ booksDisabled: true, chaptersDisabled: true });
    }
};

// Fetch and populate chapters
const loadChapters = async () => {
    if (books.value >= 1) {
        setControlStates({ booksDisabled: false, chaptersDisabled: true });
        announce('Loading chapters…');
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/${books.value}/allchapters`);
        if (data && !data.error) {
            populateDropdown(chapter, data.map(ch => ({ value: ch, text: ch })), 'value', 'text', 'Select Chapter');
            setControlStates({ booksDisabled: false, chaptersDisabled: false });
            clearAnnounce();
            if (data.length > 0) {
                chapter.value = data[0];
                chapter.dispatchEvent(new Event('change'));
            }
        } else {
            announce(data.message || 'Failed to load chapters.');
        }
    }
};

// Fetch and display verses
const loadVerses = async () => {
    if (chapter.value >= 1) {
        announce('Loading verses…');
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/${books.value}/${chapter.value}`);
        if (data && data.verses) {
            content.innerHTML = data.verses.map(verse => `
                <div class="verse">
                    <span class="verse-number">${chapter.value}:${verse.verse}</span>
                    ${verse.bv}
                </div>
            `).join('');
            // Move focus to content for screen readers/keyboard users
            content.focus({ preventScroll: false });
            clearAnnounce();
        } else {
            announce(data.message || 'Failed to load verses.');
        }
    }
};

// Event listeners
translations.addEventListener('change', loadBooks);
books.addEventListener('change', loadChapters);
chapter.addEventListener('change', loadVerses);

// Initialize
loadTranslations();

// Font size controls
const decreaseFontButton = document.getElementById('decrease-font');
const increaseFontButton = document.getElementById('increase-font');
const bibleText = document.getElementById('content');

let fontSize = 16; // Default font size in pixels

// Load saved font size
const savedSize = Number(localStorage.getItem('bibleFontSize'));
if (!Number.isNaN(savedSize) && savedSize >= 12 && savedSize <= 28) {
    fontSize = savedSize;
}

// Function to update font size
const updateFontSize = () => {
    bibleText.style.fontSize = `${fontSize}px`;
    localStorage.setItem('bibleFontSize', String(fontSize));
};

updateFontSize();

// Decrease font size
if (decreaseFontButton) {
    decreaseFontButton.addEventListener('click', () => {
        if (fontSize > 12) {
            fontSize -= 2; // Decrease font size by 2px
            updateFontSize();
        }
    });
}

// Increase font size
if (increaseFontButton) {
    increaseFontButton.addEventListener('click', () => {
        if (fontSize < 28) {
            fontSize += 2; // Increase font size by 2px
            updateFontSize();
        }
    });
}