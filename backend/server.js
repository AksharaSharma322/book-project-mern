const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bookRoutes = require("./routes/bookRoutes");
const commentRoutes = require("./routes/commentRoutes");

const progressRoutes = require("./routes/progressRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const Book = require("./models/Book");

// middleware
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      server: "running",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Seed demo book if none exist
    try {
      const count = await Book.countDocuments();
      if (count === 0) {
        await Book.create({
          title: "Demo Book",
          author: "Admin",
          description: "This is a demo book seeded on server start.",
        });
        console.log("Seeded demo book");
      }
    } catch (err) {
      console.error("Seeding error:", err);
    }
  })
  .catch((err) => {
    console.log(err);
  });

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
