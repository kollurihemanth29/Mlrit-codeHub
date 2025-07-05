const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedModules: [{ type: Number }], // array of module indexes
  testAttempt: {
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Progress", ProgressSchema);
