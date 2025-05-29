const express = require("express");
const {
  addProblem,
  getAllProblems,
  deleteProblem,
  getProblemById,
  updateProblem,
  getProblemStats,
} = require("../controllers/problemController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: Get all problems
router.get("/", authenticateToken, getAllProblems);

// Public: Get stats for all problems
router.get("/stats", authenticateToken, getProblemStats);

// Admin-only
router.post("/add", authenticateToken, isAdmin, addProblem);
router.put("/:id", authenticateToken, isAdmin, updateProblem);
router.delete("/:id", authenticateToken, isAdmin, deleteProblem);
router.get("/:id", getProblemById);
module.exports = router;
