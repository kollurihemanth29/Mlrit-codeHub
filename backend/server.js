const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                // Allow cross-origin requests
app.use(express.json());        // Parse incoming JSON requests

// Test Route
app.get("/", (req, res) => {
  res.send("✅ MLRIT Code Hub Backend is Running!");
});
const path = require("path");
// Main Routes
app.use("/api/auth", require("./routes/authRoutes"));          // Auth Routes
app.use("/api/profile", require("./routes/profileRoutes"));    // Profile Routes
app.use("/api/problems", require("./routes/problemRoutes"));   // Problems
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/contests", require("./routes/contestRoutes"));
app.use("/api/contest-submissions", require("./routes/ContestsubmissionRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Mount profile routesn
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
