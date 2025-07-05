const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hasCode: { type: Boolean, default: false },
  codeSnippet: { type: String },
});

const TestQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true }, // index of correct option
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '4 weeks' },
  enrolledCount: { type: Number, default: 0 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [ModuleSchema],
  testUnlockThreshold: { type: Number, default: 80 }, // percentage
  testQuestions: [TestQuestionSchema],
});

module.exports = mongoose.model('Course', CourseSchema);
