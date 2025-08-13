const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const { authenticateToken } = require("../middleware/authMiddleware");

// @route   GET /api/progress?userId=&courseId=
// @desc    Get user progress for a course
router.get("/", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      // Create initial progress if doesn't exist
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      progress = new UserProgress({
        userId,
        courseId,
        topicsProgress: [],
        overallProgress: 0
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/progress/lesson
// @desc    Update lesson progress
router.post("/lesson", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("lessonId").notEmpty().withMessage("lessonId is required"),
    body("completed").optional().isBoolean(),
    body("timeSpent").optional().isNumeric(),
    body("score").optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, lessonId, completed, timeSpent, score, topicTitle } = req.body;

    try {
      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      await progress.updateLessonProgress(topicId, lessonId, {
        completed: completed || false,
        timeSpent: timeSpent || 0,
        score: score || 0,
        topicTitle: topicTitle || 'Unknown Topic'
      });

      res.json({ 
        message: "Lesson progress updated successfully", 
        progress: progress 
      });
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress/module-test
// @desc    Submit module test results
router.post("/module-test", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("score").isNumeric().withMessage("score must be a number"),
    body("totalMarks").isNumeric().withMessage("totalMarks must be a number"),
    body("answers").optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, score, totalMarks, answers, topicTitle } = req.body;

    try {
      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      await progress.updateModuleTestProgress(topicId, {
        score,
        totalMarks,
        answers: answers || [],
        topicTitle: topicTitle || 'Unknown Topic'
      });

      res.json({ 
        message: "Module test submitted successfully", 
        progress: progress,
        testResult: {
          score,
          totalMarks,
          percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
        }
      });
    } catch (err) {
      console.error('Error submitting module test:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress (Legacy support)
// @desc    Update progress (backward compatibility)
router.post("/", authenticateToken, async (req, res) => {
  const { userId, courseId, moduleIndex, testAttempt } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        completedModules: [],
        topicsProgress: [],
        testAttempt: testAttempt || {},
      });
    }

    // Add completed module if it's not already completed (backward compatibility)
    if (typeof moduleIndex === "number" && !progress.completedModules.includes(moduleIndex)) {
      progress.completedModules.push(moduleIndex);
    }

    // Update testAttempt if provided (backward compatibility)
    if (testAttempt) {
      progress.testAttempt = {
        score: testAttempt.score || progress.testAttempt?.score || 0,
        totalMarks: testAttempt.total || testAttempt.totalMarks || progress.testAttempt?.totalMarks || 0,
        percentage: 0,
        attemptedAt: new Date(),
        answers: testAttempt.answers || []
      };
      
      // Calculate percentage
      if (progress.testAttempt.totalMarks > 0) {
        progress.testAttempt.percentage = Math.round((progress.testAttempt.score / progress.testAttempt.totalMarks) * 100);
      }
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/progress/topic/:topicId
// @desc    Get specific topic progress
router.get("/topic/:topicId", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;
  const { topicId } = req.params;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    const progress = await UserProgress.findOne({ userId, courseId });
    
    if (!progress) {
      return res.status(404).json({ message: "No progress found." });
    }

    const topicProgress = progress.topicsProgress.find(tp => tp.topicId === topicId);
    
    if (!topicProgress) {
      return res.status(404).json({ message: "Topic progress not found." });
    }

    res.json(topicProgress);
  } catch (err) {
    console.error('Error fetching topic progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/progress/reset
// @desc    Reset user progress for a course
router.delete("/reset", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId } = req.body;

    try {
      const result = await UserProgress.findOneAndDelete({ userId, courseId });
      
      if (!result) {
        return res.status(404).json({ message: "No progress found to reset." });
      }

      res.json({ message: "Progress reset successfully" });
    } catch (err) {
      console.error('Error resetting progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
