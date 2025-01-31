const baseURL = "https://bibleapi-tgc1.onrender.com/";
const translations = document.getElementById('translation');
const books = document.getElementById('book');
const chapter = document.getElementById('chapter');
const content = document.getElementById('content');
let selectedTranslation;

// Fetch data from API
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
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

// Fetch and populate translations
const loadTranslations = async () => {
    const data = await fetchData(`${baseURL}api/bible/all`);
    if (data) populateDropdown(translations, data, 'id', 'name', 'Select Bible');
};

// Fetch and populate books
const loadBooks = async () => {
    if (translations.value >= 1) {
        selectedTranslation = translations.value;
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/books`);
        if (data) {
            populateDropdown(books, data, 'index', 'name', 'Select Book');
            if (data.length > 0) {
                books.value = data[0].index;
                books.dispatchEvent(new Event('change'));
            }
        }
    }
};

// Fetch and populate chapters
const loadChapters = async () => {
    if (books.value >= 1) {
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/${books.value}/allchapters`);
        if (data) {
            populateDropdown(chapter, data.map(ch => ({ value: ch, text: ch })), 'value', 'text', 'Select Chapter');
            if (data.length > 0) {
                chapter.value = data[0];
                chapter.dispatchEvent(new Event('change'));
            }
        }
    }
};

// Fetch and display verses
const loadVerses = async () => {
    if (chapter.value >= 1) {
        const data = await fetchData(`${baseURL}api/bible/${selectedTranslation}/${books.value}/${chapter.value}`);
        if (data && data.verses) {
            content.innerHTML = data.verses.map(verse => `
                <div class="verse">
                    <span class="verse-number">${chapter.value}:${verse.verse}</span>
                    ${verse.bv}
                </div>
            `).join('');
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

// Function to update font size
const updateFontSize = () => {
    bibleText.style.fontSize = `${fontSize}px`;
};

// Decrease font size
decreaseFontButton.addEventListener('click', () => {
    if (fontSize > 12) {
        fontSize -= 2; // Decrease font size by 2px
        updateFontSize();
    }
});

// Increase font size
increaseFontButton.addEventListener('click', () => {
    if (fontSize < 24) {
        fontSize += 2; // Increase font size by 2px
        updateFontSize();
    }
});