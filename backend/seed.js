const mongoose = require("mongoose");
const Book = require("./models/Book");
require("dotenv").config();

const books = [
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
        chapters: [
            {
                title: "Chapter 1",
                content: [
                    "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury.",
                    "I maintain that the Ewells started it all, but Jem, who was four years my senior, said it started long before that. He said it began the summer Dill came to us, when Dill first gave us the idea of making Boo Radley come out."
                ]
            },
            {
                title: "Chapter 2",
                content: [
                    "Dill left us early in September, to return to Meridian. We saw him off on the five o'clock bus and I was miserable without him until it occurred to me that I would be starting to school in a week.",
                    "Jem condescended to take me to school the first day, a job usually done by one's parents, but Atticus had said Jem would be delighted to show me where my room was."
                ]
            }
        ]
    },
    {
        title: "1984",
        author: "George Orwell",
        description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
        chapters: [
            {
                title: "Part 1, Chapter 1",
                content: [
                    "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
                    "The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features."
                ]
            }
        ]
    },
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career.",
        chapters: [
            {
                title: "Chapter 1",
                content: [
                    "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.",
                    "'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'",
                    "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that."
                ]
            }
        ]
    },
    // Simple structure for others to save space but ensure schema validity
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.",
        chapters: [{ title: "Chapter 1", content: ["It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters."] }]
    },
    {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        description: "The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield.",
        chapters: [{ title: "Chapter 1", content: ["If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it, if you want to know the truth."] }]
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "A timeless classic comprising of bilbo baggins adventure to the lonely mountain.",
        chapters: [{ title: "Chapter 1: An Unexpected Party", content: ["In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort."] }]
    },
    {
        title: "Fahrenheit 451",
        author: "Ray Bradbury",
        description: "Ray Bradbury's deeply resonant tale of strict censorship and the destruction of knowledge.",
        chapters: [{ title: "The Hearth and the Salamander", content: ["It was a pleasure to burn.", "It was a special pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world, the blood pounded in his head, and his hands were the hands of some amazing conductor playing all the symphonies of blazing and burning to bring down the tatters and charcoal ruins of history."] }]
    },
    {
        title: "Jane Eyre",
        author: "Charlotte Bronte",
        description: "A novel of intense power and intrigue, Jane Eyre has dazzled generations of readers with its depiction of a woman's quest for freedom.",
        chapters: [{ title: "Chapter 1", content: ["There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner (Mrs. Reed when there was no company, dined early) the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the question."] }]
    },
    {
        title: "Animal Farm",
        author: "George Orwell",
        description: "A fairy story about a revolution on a farm that goes wrong.",
        chapters: [{ title: "Chapter 1", content: ["Mr. Jones, of the Manor Farm, had locked the hen-houses for the night, but was too drunk to remember to shut the pop-holes. With the ring of light from his lantern dancing from side to side, he lurched across the yard, kicked off his boots at the back door, drew himself a last glass of beer from the scullery barrel, and made his way up to bed, where Mrs. Jones was already snoring."] }]
    },
    {
        title: "Brave New World",
        author: "Aldous Huxley",
        description: "A searching vision of an unequal, technologically-advanced future where humans are genetically bred.",
        chapters: [{ title: "Chapter 1", content: ["A squat grey building of only thirty-four stories. Over the main entrance the words, CENTRAL LONDON HATCHERY AND CONDITIONING CENTRE, and, in a shield, the World State's motto, COMMUNITY, IDENTITY, STABILITY."] }]
    }
];

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected for seeding");
        try {
            // Clear existing books to ensure we update structure
            await Book.deleteMany({});
            console.log("Cleared existing books");

            const insertedBooks = await Book.insertMany(books);
            console.log(`Successfully seeded ${insertedBooks.length} books with chapters!`);
            process.exit(0);
        } catch (err) {
            console.error("Error seeding data:", err);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
