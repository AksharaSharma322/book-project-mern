const mongoose = require("mongoose");

const ReadingProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        currentChapterIndex: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// One progress per user per book
ReadingProgressSchema.index(
    { userId: 1, bookId: 1 },
    { unique: true }
);

module.exports = mongoose.model("ReadingProgress", ReadingProgressSchema);
