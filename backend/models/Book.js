const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        chapters: [
            {
                title: { type: String, required: true },
                content: [String] // Array of paragraphs
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
