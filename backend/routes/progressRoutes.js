const express = require("express");
const router = express.Router();
const ReadingProgress = require("../models/ReadingProgress");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * GET logged-in user's reading progress
 */
router.get("/my", authMiddleware, async (req, res) => {
    try {
        // Model uses 'userId', and we populate 'bookId'
        const progress = await ReadingProgress.find({ userId: req.user._id })
            .populate("bookId");

        res.json({ success: true, data: progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * UPDATE reading progress
 */
router.post("/", authMiddleware, async (req, res) => {
    const { bookId, currentChapter } = req.body;

    // Validate inputs
    if (!bookId || currentChapter === undefined) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        // Map frontend 'currentChapter' -> model 'currentChapterIndex'
        const progress = await ReadingProgress.findOneAndUpdate(
            { userId: req.user._id, bookId: bookId },
            { currentChapterIndex: currentChapter },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
