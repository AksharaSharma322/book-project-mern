const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        chapterIndex: {
            type: Number,
            required: true,
        },
        paragraphIndex: {
            type: Number,
            required: true,
        },
        commentText: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
