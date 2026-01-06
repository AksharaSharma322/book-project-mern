const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");

// POST /api/comments - Add a comment to a specific paragraph
router.post("/", auth, async (req, res) => {
    try {
        const { bookId, chapterIndex, paragraphIndex, commentText } = req.body;

        if (!bookId || chapterIndex === undefined || paragraphIndex === undefined || !commentText) {
            return res.status(400).json({
                success: false,
                error: "All fields (bookId, chapterIndex, paragraphIndex, commentText) are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ success: false, error: "Invalid bookId format" });
        }

        const newComment = new Comment({
            bookId,
            chapterIndex,
            paragraphIndex,
            commentText,
        });

        const savedComment = await newComment.save();
        res.status(201).json({ success: true, data: savedComment });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ success: false, error: "Invalid data format" });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/comments - Fetch comments for a specific paragraph
// Query params: ?bookId=...&chapterIndex=...&paragraphIndex=...
router.get("/", async (req, res) => {
    try {
        const { bookId, chapterIndex, paragraphIndex } = req.query;

        // Build filter object based on query params
        const filter = {};
        if (bookId) filter.bookId = bookId;
        if (chapterIndex) filter.chapterIndex = chapterIndex;
        if (paragraphIndex) filter.paragraphIndex = paragraphIndex;

        const comments = await Comment.find(filter).sort({ createdAt: -1 }); // Newest first
        res.json({ success: true, data: comments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
