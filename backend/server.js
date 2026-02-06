const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bookRoutes = require("./routes/bookRoutes");
const commentRoutes = require("./routes/commentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ CORS (THIS IS THE FIX)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bookproject-lemon.vercel.app/", // 👈 your Vercel frontend
    ],
    credentials: true,
  })
);


// middleware
app.use(express.json());

// routes
app.use("/api/books", bookRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
