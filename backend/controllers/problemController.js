const Problem = require("../models/Problem");
const Submission = require("../models/Submission");

// Add a new problem
const addProblem = async (req, res) => {
  try {
    const { title, description, difficulty, score, sampleTestCases, hiddenTestCases } = req.body;

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      score,
      sampleTestCases,
      hiddenTestCases,
    });

    await newProblem.save();
    res.status(201).json({ message: "Problem added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error adding problem", error: err.message });
  }
};

// Get all problems
const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ message: "Error fetching problems", error: err.message });
  }
};
// Get a single problem by ID
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ message: "Error fetching problem", error: err.message });
  }
};
// Get real-time problem stats
const getProblemStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: "$problem",
          usersTried: { $addToSet: "$user" },
          successCount: {
            $sum: { $cond: ["$isSuccess", 1, 0] },
          },
          totalSubmissions: { $sum: 1 },
        },
      },
      {
        $project: {
          problemId: "$_id",
          usersTried: { $size: "$usersTried" },
          successRate: {
            $cond: [
              { $eq: ["$totalSubmissions", 0] },
              0,
              { $multiply: [{ $divide: ["$successCount", "$totalSubmissions"] }, 100] },
            ],
          },
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// Delete a problem
const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting problem" });
  }
};

// Update a problem
const updateProblem = async (req, res) => {
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Problem updated successfully!", updatedProblem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating problem" });
  }
};

module.exports = {
  addProblem,
  getAllProblems,
  getProblemById, 
  deleteProblem,
  updateProblem,
  getProblemStats,
};
