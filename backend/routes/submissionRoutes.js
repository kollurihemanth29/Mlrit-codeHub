const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/submissions - Save a practice problem submission
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { problemId, code, language, isSuccess } = req.body;

    const newSubmission = new Submission({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      isSuccess,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission saved successfully!" });
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ message: "Server error while saving submission" });
  }
});
// GET /api/submissions/user/:problemId - Get user's submissions for a problem
router.get("/user/:problemId", authenticateToken, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user.id,
      problem: req.params.problemId,
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

module.exports = router;
