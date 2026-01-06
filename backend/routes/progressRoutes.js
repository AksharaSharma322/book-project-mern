const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ReadingProgress = require("../models/ReadingProgress");
const auth = require("../middleware/authMiddleware");

/**
 * POST /api/progress
 * Save or update reading progress (USER + BOOK)
 */
router.post("/", auth, async (req, res) => {
    try {
        const { bookId, currentChapterIndex } = req.body;
        const userId = req.user.id;

        if (!bookId || currentChapterIndex === undefined) {
            return res.status(400).json({
                success: false,
                error: "bookId and currentChapterIndex are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid bookId",
            });
        }

        const progress = await ReadingProgress.findOneAndUpdate(
            { userId, bookId },               // ✅ FIX
            { userId, bookId, currentChapterIndex },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: progress });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/progress?bookId=...
 * Get reading progress for logged-in user
 */
router.get("/", auth, async (req, res) => {
    try {
        const { bookId } = req.query;
        const userId = req.user.id;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                error: "bookId is required",
            });
        }

        const progress = await ReadingProgress.findOne({ userId, bookId }); // ✅ FIX

        res.json({ success: true, data: progress });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
