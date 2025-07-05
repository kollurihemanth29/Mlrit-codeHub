const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Create new course (Admin only)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("level").optional().isIn(["Beginner", "Intermediate", "Advanced"]),
    body("duration").optional().isString(),
    body("enrolledCount").optional().isNumeric(),
    body("modules").isArray(),
    body("testUnlockThreshold").isNumeric(),
    body("testQuestions").isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const course = new Course(req.body);
      await course.save();
      res.status(201).json(course);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// List all courses
router.get("/", authenticateToken, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Get course details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update course (Admin only)
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  [
    body("title").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("level").optional().isIn(["Beginner", "Intermediate", "Advanced"]),
    body("duration").optional().isString(),
    body("enrolledCount").optional().isNumeric(),
    body("modules").optional().isArray(),
    body("testUnlockThreshold").optional().isNumeric(),
    body("testQuestions").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete course (Admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's course progress
router.get("/:courseId/progress", authenticateToken, async (req, res) => {
  const userId = req.query.userId || req.user.id;
  try {
    const progress = await Progress.findOne({ userId, courseId: req.params.courseId });
    res.json(progress || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark module as complete
router.post(
  "/:courseId/module/:moduleIndex/complete",
  authenticateToken,
  async (req, res) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const moduleIndex = parseInt(req.params.moduleIndex);
    try {
      let progress = await Progress.findOne({ userId, courseId });
      if (!progress) progress = new Progress({ userId, courseId, completedModules: [] });
      if (!progress.completedModules.includes(moduleIndex)) {
        progress.completedModules.push(moduleIndex);
        await progress.save();
      }
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get test questions (hide correct answers)
router.get("/:courseId/tests", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const questions = course.testQuestions.map(q => ({
      question: q.question,
      options: q.options,
    }));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit test
router.post("/:courseId/tests/submit", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { answers } = req.body;
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    let score = 0;
    course.testQuestions.forEach((q, idx) => {
      if (q.correct === answers[idx]) score++;
    });
    let progress = await Progress.findOne({ userId, courseId: req.params.courseId });
    if (!progress) progress = new Progress({ userId, courseId: req.params.courseId, completedModules: [] });
    progress.testAttempt = {
      score,
      total: course.testQuestions.length,
      completed: true,
    };
    await progress.save();
    res.json({ score, total: course.testQuestions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll in a course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.enrolledUsers.includes(req.user.id)) {
      course.enrolledUsers.push(req.user.id);
      course.enrolledCount = course.enrolledUsers.length;
      await course.save();
    }
    res.json({ enrolled: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unenroll from a course
router.post('/:id/unenroll', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.enrolledUsers = course.enrolledUsers.filter(u => u.toString() !== req.user.id);
    course.enrolledCount = course.enrolledUsers.length;
    await course.save();
    res.json({ enrolled: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
