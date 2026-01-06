const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// GET all books (for testing)
router.get("/", async (req, res) => {
    try {
        const books = await Book.find();
        res.json({ success: true, data: books });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET a specific book by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require("mongoose");

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid Book ID" });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        res.json({ success: true, data: book });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST a new book (Admin only)
router.post("/", [auth, admin], async (req, res) => {
    try {
        const { title, author, description, chapters } = req.body;

        if (!title || !author) {
            return res.status(400).json({ success: false, error: "Title and author are required fields" });
        }

        const newBook = new Book({
            title,
            author,
            description,
            chapters: chapters || []
        });

        const savedBook = await newBook.save();
        res.status(201).json({ success: true, data: savedBook });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT update a book (Admin only)
router.put("/:id", [auth, admin], async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, chapters } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { title, author, description, chapters },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        res.json({ success: true, data: updatedBook });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE a book (Admin only)
router.delete("/:id", [auth, admin], async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);

        if (!deletedBook) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
