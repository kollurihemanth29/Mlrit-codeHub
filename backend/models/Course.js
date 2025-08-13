const mongoose = require('mongoose');

// MCQ Question Sub-Schema
const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: v => v.length >= 2
  },
  correct: {
    type: Number,
    required: true,
    validate: {
      validator: function(val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'Correct index must be within options range'
    }
  },
  explanation: String
}, { _id: false });

// Coding Challenge Sub-Schema
const codeChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sampleInput: String,
  sampleOutput: String,
  constraints: String,
  initialCode: String,
  language: { type: String, default: 'python' },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }]
}, { _id: false });

// Lesson Sub-Schema (Strictly Enforcing Your Rules)
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['lesson'], 
    default: 'lesson' 
  },
  content: { type: String, required: true }, // Theory section
  review: { type: String, required: true },  // Review section
  mcqs: {
    type: [mcqSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length === 2,
      message: 'Each lesson must have exactly 2 MCQs'
    },
    required: true
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length === 2,
      message: 'Each lesson must have exactly 2 coding challenges'
    },
    required: true
  },
  order: { type: Number, default: 0 },
  duration: { type: String, default: '5-10 min' }
});

// Topic Sub-Schema
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: [lessonSchema],
  moduleTest: {
    mcqs: [mcqSchema],
    codeChallenges: [codeChallengeSchema],
    totalMarks: Number
  }
});

// Unified Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topics: {
    type: [topicSchema],
    default: []
  },
  testUnlockThreshold: { type: Number, default: 80 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolledCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Auto-update enrolled count
courseSchema.pre('save', function (next) {
  this.enrolledCount = this.enrolledUsers.length;
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
