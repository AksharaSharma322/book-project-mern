const mongoose = require("mongoose");
require("dotenv").config();

const Book = require("./models/Book");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        // Clear existing books (important)
        await Book.deleteMany({});
        console.log("🗑️ Old books removed");

        await Book.create([
            {
                title: "Pride and Prejudice",
                author: "Jane Austen",
                description: "A classic romantic novel of manners.",
                chapters: [
                    {
                        title: "Chapter 1",
                        content: [
                            "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
                            "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of someone or other of their daughters.",
                        ],
                    },
                    {
                        title: "Chapter 2",
                        content: [
                            "Mr. Bennet was among the earliest of those who waited on Mr. Bingley.",
                            "With a book he was regardless of time; and on the present occasion he had a good deal of curiosity as to the event of an evening which was to promote his daughter’s happiness.",
                        ],
                    },
                ],
            },

            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description:
                    "A novel about the American dream and the roaring twenties.",
                chapters: [
                    {
                        title: "Chapter 1",
                        content: [
                            "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.",
                            "'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'",
                        ],
                    },
                    {
                        title: "Chapter 2",
                        content: [
                            "About halfway between West Egg and New York the motor road hastily joins the railroad.",
                            "This is a valley of ashes — a fantastic farm where ashes grow like wheat into ridges and hills.",
                        ],
                    },
                ],
            },

            {
                title: "Jane Eyre",
                author: "Charlotte Brontë",
                description: "A novel that follows the emotions and experiences of Jane.",
                chapters: [
                    {
                        title: "Chapter 1",
                        content: [
                            "There was no possibility of taking a walk that day.",
                            "I was glad of it; I never liked long walks, especially on chilly afternoons.",
                        ],
                    },
                ],
            },
        ]);

        console.log("✅ Books seeded successfully");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();
