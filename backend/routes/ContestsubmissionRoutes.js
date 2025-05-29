const express = require("express");
const router = express.Router();
const ContestSubmission = require("../models/ContestSubmission");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/contest-submissions - Save a contest submission
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { contestId, problemId, code, language, isSuccess } = req.body;

    const newContestSubmission = new ContestSubmission({
      user: req.user.id,
      contest: contestId,
      problem: problemId,
      code,
      language,
      isSuccess,
    });

    await newContestSubmission.save();
    res.status(201).json({ message: "Contest submission saved!" });
  } catch (error) {
    console.error("Error saving contest submission:", error);
    res.status(500).json({ message: "Server error while saving contest submission" });
  }
});

module.exports = router;
