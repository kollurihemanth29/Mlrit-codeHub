const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  completedModules: [String],
  testCompleted: Boolean,
  testScore: Number,
});

module.exports = mongoose.model("UserProgress", UserProgressSchema);
