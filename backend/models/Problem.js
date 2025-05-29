// models/Problem.js
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  score: { type: Number, required: true },
  sampleTestCases: [{ input: String, output: String }],
  hiddenTestCases: [{ input: String, output: String }],
  isContestProblem: { type: Boolean, default: true }, // Flag to indicate if the problem is part of a contest
});

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
