const express = require('express');
const fs = require('fs');
const path = require('path');
const languages = require('../languages.json');
const versions = require('../versions.json');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const loadBibleJson = (bibleId) => {
    try {
        const filePath = path.resolve(__dirname, `../bibles/${bibleId}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error('Bible file not found');
        }
        return require(filePath);
    } catch (error) {
        console.error(`Error loading Bible JSON for ID ${bibleId}:`, error.message);
        throw error;
    }
};

/**
 * @swagger
 * /api/bible/all:
 *   get:
 *     summary: Retrieve a list of available Bibles
 *     description: Returns an array of available Bibles with their metadata, including ID, name, language, and language ID.
 *     tags: [Bible]
 *     responses:
 *       200:
 *         description: A list of available Bibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Unique ID of the Bible.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the Bible.
 *                     example: King James Version
 *                   language:
 *                     type: string
 *                     description: Language of the Bible.
 *                     example: English
 *                   language_id:
 *                     type: integer
 *                     description: Unique ID of the language.
 *                     example: 2
 */

router.get('/bible/all', (req, res) => {
    res.json(versions);
});

/**
 * @swagger
 * /api/bible/{bibleId}/books:
 *   get:
 *     summary: Retrieve a list of books in the specified Bible
 *     description: Returns an array of books with their index and name for the given Bible ID.
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: bibleId
 *         required: true
 *         description: The ID of the Bible.
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: A list of books in the Bible.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   index:
 *                     type: integer
 *                     description: The index of the book.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the book.
 *                     example: Genesis
 */

router.get('/bible/:bibleId/books', (req, res) => {
    try {
        const bibleJson = loadBibleJson(req.params.bibleId);
        res.json(bibleJson.books);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load books', error: error.message });
    }
});

/**
 * @swagger
 * swagger: '2.0'
 * info:
 *   title: Bible API
 *   description: API for retrieving Bible books and chapters
 *   version: 1.0.0
 * 
 * basePath: /api
 * 
 * tags:
 *   - name: Bible
 *     description: Operations related to Bible books
 * 
 * paths:
 *   /api/bible/{bibleId}/book/{bookId}:
 *     get:
 *       tags:
 *         - Bible
 *       summary: Get a book from the Bible
 *       description: Returns a specific book by its ID and its chapters
 *       parameters:
 *         - name: bibleId
 *           in: path
 *           required: true
 *           type: string
 *           description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *         - name: bookId
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ID of the book in the Bible (starting from 1)
 *       responses:
 *         200:
 *           description: Successfully retrieved the book data
 *           schema:
 *             type: object
 *             properties:
 *               bookname:
 *                 type: string
 *                 description: Name of the book in the Bible
 *               chapters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     chapter:
 *                       type: string
 *                       description: Chapter number
 *                     verses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Verse ID
 *                           bv:
 *                             type: string
 *                             description: Verse content
 *                           book:
 *                             type: string
 *                             description: Book number
 *                           chapter:
 *                             type: string
 *                             description: Chapter number
 *                           verse:
 *                             type: string
 *                             description: Verse number
 *         404:
 *           description: Book not found
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         500:
 *           description: Failed to load the book
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               error:
 *                 type: string
 */
router.get('/bible/:bibleId/book/:bookId', (req, res) => {
    try {
        const { bibleId, bookId } = req.params;
        const bibleJson = loadBibleJson(bibleId);
        const book = bibleJson.bible[bookId - 1];

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load book', error: error.message });
    }
});

/**
 * @swagger
 * swagger: '2.0'
 * info:
 *   title: Bible API
 *   description: API for retrieving Bible books, chapters, and verses
 *   version: 1.0.0
 * 
 * basePath: /api
 * 
 * tags:
 *   - name: Bible
 *     description: Operations related to Bible books, chapters, and verses
 * 
 * paths:
 *   /api/bible/{bibleId}/{bookId}/allchapters:
 *     get:
 *       tags:
 *         - Bible
 *       summary: Get all chapters of a specific book in the Bible
 *       description: Returns an array of all chapter numbers in a book
 *       parameters:
 *         - name: bibleId
 *           in: path
 *           required: true
 *           type: string
 *           description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *         - name: bookId
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ID of the book in the Bible (starting from 1)
 *       responses:
 *         200:
 *           description: Successfully retrieved all chapter numbers
 *           schema:
 *             type: array
 *             items:
 *               type: integer
 *               description: Chapter number
 *         500:
 *           description: Failed to load chapters
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               error:
 *                 type: string
 */

router.get('/bible/:bibleId/:bookId/allchapters', (req, res) => {
    try {
        const { bibleId, bookId, chapter } = req.params;
        const bibleJson = loadBibleJson(bibleId);
        const book = bibleJson.bible[bookId - 1];
        let chapters = []
        for(let i = 1; i < book.chapters.length+1; i++){
            chapters.push(i)
        }
        res.json(chapters)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load chapter', error: error.message });
    }
})

/**
 * @swagger
 * swagger: '2.0'
 * info:
 *   title: Bible API
 *   description: API for retrieving Bible books, chapters, and verses
 *   version: 1.0.0
 * 
 * basePath: /api
 * 
 * tags:
 *   - name: Bible
 *     description: Operations related to Bible books, chapters, and verses
 * 
 * paths:
 *   /api/bible/{bibleId}/{bookId}/{chapter}:
 *     get:
 *       tags:
 *         - Bible
 *       summary: Get a specific chapter from a book of the Bible
 *       description: Returns a specific chapter by its ID and its verses
 *       parameters:
 *         - name: bibleId
 *           in: path
 *           required: true
 *           type: string
 *           description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *         - name: bookId
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ID of the book in the Bible (starting from 1)
 *         - name: chapter
 *           in: path
 *           required: true
 *           type: integer
 *           description: The chapter number (starting from 1)
 *       responses:
 *         200:
 *           description: Successfully retrieved the chapter data
 *           schema:
 *             type: object
 *             properties:
 *               chapter:
 *                 type: string
 *                 description: The chapter number
 *               verses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Verse ID
 *                     bv:
 *                       type: string
 *                       description: Verse content
 *                     book:
 *                       type: string
 *                       description: Book number
 *                     chapter:
 *                       type: string
 *                       description: Chapter number
 *                     verse:
 *                       type: string
 *                       description: Verse number
 *         404:
 *           description: Chapter not found
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         500:
 *           description: Failed to load the chapter
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               error:
 *                 type: string
 */

router.get('/bible/:bibleId/:bookId/:chapter', (req, res) => {
    try {
        const { bibleId, bookId, chapter } = req.params;
        const bibleJson = loadBibleJson(bibleId);
        const book = bibleJson.bible[bookId - 1];

        if (!book || !book.chapters[chapter - 1]) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        res.json(book.chapters[chapter - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load chapter', error: error.message });
    }
});

/**
 * @swagger
 * swagger: '2.0'
 * info:
 *   title: Bible API
 *   description: API for retrieving Bible books, chapters, and verses
 *   version: 1.0.0
 * 
 * basePath: /api
 * 
 * tags:
 *   - name: Bible
 *     description: Operations related to Bible books, chapters, and verses
 * 
 * paths:
 *   /api/bible/{bibleId}/{bookId}/{chapter}/{verse}:
 *     get:
 *       tags:
 *         - Bible
 *       summary: Get a verse from a chapter in a book of the Bible
 *       description: Returns a specific verse by its ID and its content
 *       parameters:
 *         - name: bibleId
 *           in: path
 *           required: true
 *           type: string
 *           description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *         - name: bookId
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ID of the book in the Bible (starting from 1)
 *         - name: chapter
 *           in: path
 *           required: true
 *           type: integer
 *           description: The chapter number (starting from 1)
 *         - name: verse
 *           in: path
 *           required: true
 *           type: integer
 *           description: The verse number (starting from 1)
 *       responses:
 *         200:
 *           description: Successfully retrieved the verse data
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Verse ID
 *               bv:
 *                 type: string
 *                 description: Verse content in the Bible
 *               book:
 *                 type: string
 *                 description: Book number
 *               chapter:
 *                 type: string
 *                 description: Chapter number
 *               verse:
 *                 type: string
 *                 description: Verse number
 *         404:
 *           description: Verse or chapter not found
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         500:
 *           description: Failed to load the verse
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               error:
 *                 type: string
 */

router.get('/bible/:bibleId/:bookId/:chapter/:verse', (req, res) => {
    try {
        const { bibleId, bookId, chapter, verse } = req.params;
        const bibleJson = loadBibleJson(bibleId);
        const book = bibleJson.bible[bookId - 1];

        if (!book || !book.chapters[chapter - 1]) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        const verseData = book.chapters[chapter - 1].verses[verse - 1];

        if (!verseData) {
            return res.status(404).json({ message: 'Verse not found' });
        }

        res.json(verseData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load verse', error: error.message });
    }
});

/**
 * @swagger
 * swagger: '2.0'
 * info:
 *   title: Bible API
 *   description: API for retrieving Bible books, chapters, and verses
 *   version: 1.0.0
 * 
 * basePath: /api
 * 
 * tags:
 *   - name: Bible
 *     description: Operations related to Bible books, chapters, and verses
 * 
 * paths:
 *   /api/bible/{bibleId}/{bookId}/{chapter}/{first}/{last}:
 *     get:
 *       tags:
 *         - Bible
 *       summary: Get a range of verses from a chapter in a book of the Bible
 *       description: Returns a specific range of verses by their start and end verse IDs
 *       parameters:
 *         - name: bibleId
 *           in: path
 *           required: true
 *           type: string
 *           description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *         - name: bookId
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ID of the book in the Bible (starting from 1)
 *         - name: chapter
 *           in: path
 *           required: true
 *           type: integer
 *           description: The chapter number (starting from 1)
 *         - name: first
 *           in: path
 *           required: true
 *           type: integer
 *           description: The starting verse number (starting from 1)
 *         - name: last
 *           in: path
 *           required: true
 *           type: integer
 *           description: The ending verse number (starting from 1)
 *       responses:
 *         200:
 *           description: Successfully retrieved the range of verses
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Verse ID
 *                 bv:
 *                   type: string
 *                   description: Verse content in the Bible
 *                 book:
 *                   type: string
 *                   description: Book number
 *                 chapter:
 *                   type: string
 *                   description: Chapter number
 *                 verse:
 *                   type: string
 *                   description: Verse number
 *         400:
 *           description: Invalid verse range
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         404:
 *           description: Chapter not found
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         500:
 *           description: Failed to load verses
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               error:
 *                 type: string
 */
router.get('/bible/:bibleId/:bookId/:chapter/:first/:last', (req, res) => {
    try {
        const { bibleId, bookId, chapter, first, last } = req.params;
        const bibleJson = loadBibleJson(bibleId);
        const book = bibleJson.bible[bookId - 1];

        if (!book || !book.chapters[chapter - 1]) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        const chapterData = book.chapters[chapter - 1];
        const verses = chapterData.verses.slice(first - 1, last);

        if (verses.length === 0) {
            return res.status(400).json({ message: 'Invalid verse range' });
        }

        res.json(verses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load verses', error: error.message });
    }
});

/**
 * @swagger
 * /api/bible/complete/{bibleId}:
 *   get:
 *     tags:
 *       - Bible
 *     summary: Get complete Bible JSON by Bible ID
 *     description: Returns the complete Bible data in JSON format for the specified Bible ID.<strong>Fetch this endpoint from Postman or code!!</strong>
 *     parameters:
 *       - name: bibleId
 *         in: path
 *         required: true
 *         type: string
 *         description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved the complete Bible data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bibleId:
 *                   type: string
 *                   description: The ID of the Bible
 *                 bible:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookname:
 *                         type: string
 *                         description: Name of the book
 *                       chapters:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             chapter:
 *                               type: string
 *                               description: Chapter number
 *                             verses:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     description: Verse ID
 *                                   bv:
 *                                     type: string
 *                                     description: Verse content
 *                                   book:
 *                                     type: string
 *                                     description: Book number
 *                                   chapter:
 *                                     type: string
 *                                     description: Chapter number
 *                                   verse:
 *                                     type: string
 *                                     description: Verse number
 *       500:
 *         description: Failed to load Bible data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get('/bible/complete/:bibleId', (req, res) => {
    try {
        const bibleJson = loadBibleJson(req.params.bibleId);
        res.json(bibleJson);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load Bible data', error: error.message });
    }
});

/**
 * @swagger
 * /api/bible/search/{bibleId}/{query}:
 *   post:
 *     tags:
 *       - Bible
 *     summary: Search for verses by query
 *     description: Searches the Bible for verses containing the specified query string.
 *     parameters:
 *       - name: bibleId
 *         in: path
 *         required: true
 *         type: string
 *         description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *       - name: query
 *         in: path
 *         required: true
 *         type: string
 *         description: The search query to find in the verses
 *     responses:
 *       200:
 *         description: Successfully retrieved verses matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Verse ID
 *                   bv:
 *                     type: string
 *                     description: Verse content
 *                   book:
 *                     type: string
 *                     description: Book number
 *                   chapter:
 *                     type: string
 *                     description: Chapter number
 *                   verse:
 *                     type: string
 *                     description: Verse number
 *       500:
 *         description: Search failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.post('/bible/search/:bibleId/:query', (req, res) => {
    try {
        const bibleJson = loadBibleJson(req.params.bibleId);
        const verses = bibleJson.bible.flatMap(book =>
            book.chapters.flatMap(chapter => chapter.verses)
        );

        const query = req.params.query.toLowerCase();
        const result = verses.filter(verse => verse.bv.includes(query));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
});

/**
 * @swagger
 * /api/bible/random/{bibleId}:
 *   get:
 *     tags:
 *       - Bible
 *     summary: Get a random verse from the Bible
 *     description: Fetches a random verse from the specified Bible data.
 *     parameters:
 *       - name: bibleId
 *         in: path
 *         required: true
 *         type: string
 *         description: The ID of the Bible (e.g., "genesis", "matthew", etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved a random verse
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Verse ID
 *                 bv:
 *                   type: string
 *                   description: Verse content
 *                 book:
 *                   type: string
 *                   description: Book number
 *                 chapter:
 *                   type: string
 *                   description: Chapter number
 *                 verse:
 *                   type: string
 *                   description: Verse number
 *       500:
 *         description: Failed to fetch random verse
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get('/bible/random/:bibleId', (req, res) => {
    try {
        const bibleJson = loadBibleJson(req.params.bibleId);
        const verses = bibleJson.bible.flatMap(book =>
            book.chapters.flatMap(chapter => chapter.verses)
        );

        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        res.json(randomVerse);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch random verse', error: error.message });
    }
});

/**
 * @swagger
 * /languages:
 *   get:
 *     tags:
 *       - Languages
 *     summary: Get a list of available languages
 *     description: Retrieves a list of all languages available in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier for the language
 *                   language:
 *                     type: string
 *                     description: The name of the language
 *             example:
 *               [
 *                 { "id": 1, "language": "Georgian" },
 *                 { "id": 2, "language": "English" },
 *                 { "id": 3, "language": "Spanish" },
 *                 { "id": 4, "language": "Greek" },
 *                 { "id": 5, "language": "Arabic" },
 *                 { "id": 6, "language": "Mandarin Chinese" },
 *                 { "id": 7, "language": "Hindi" },
 *                 { "id": 8, "language": "French" },
 *                 { "id": 9, "language": "Portuguese" },
 *                 { "id": 10, "language": "Russian" },
 *                 { "id": 11, "language": "Italian" },
 *                 { "id": 12, "language": "German" },
 *                 { "id": 13, "language": "Korean" },
 *                 { "id": 14, "language": "Japanese" },
 *                 { "id": 15, "language": "Dutch" },
 *                 { "id": 16, "language": "Finnish" },
 *                 { "id": 17, "language": "Danish" },
 *                 { "id": 18, "language": "Thai" }
 *               ]
 *       500:
 *         description: Failed to retrieve the languages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get('/languages', (req, res) => {
    res.json(languages);
});

module.exports = router;
