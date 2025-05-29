const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Add a course (Admin only)
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
