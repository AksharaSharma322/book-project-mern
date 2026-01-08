const express = require("express");
const router = express.Router();

const ReadingProgress = require("../models/ReadingProgress");
const Book = require("../models/Book");
const auth = require("../middleware/authMiddleware");

/* ======================================================
   GET progress for ONE book (Book Detail page)
   GET /api/progress?bookId=xxx
====================================================== */
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.query;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                error: "bookId is required",
            });
        }

        const progress = await ReadingProgress.findOne({
            userId,
            bookId,
        });

        res.json({
            success: true,
            data: progress,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

/* ======================================================
   GET ALL reading progress (Profile page)
   GET /api/progress/all
====================================================== */
router.get("/all", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const progressList = await ReadingProgress.find({ userId })
            .populate("bookId", "title author")
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: progressList,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

/* ======================================================
   CREATE / UPDATE reading progress
   POST /api/progress
====================================================== */
router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, currentChapterIndex } = req.body;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                error: "bookId is required",
            });
        }

        const progress = await ReadingProgress.findOneAndUpdate(
            { userId, bookId },
            { currentChapterIndex },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            data: progress,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

module.exports = router;
