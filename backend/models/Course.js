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

// Final Course Exam Schema
const finalExamSchema = new mongoose.Schema({
  title: { type: String, default: 'Final Course Assessment' },
  description: { type: String, default: 'Comprehensive assessment covering all course topics' },
  mcqs: {
    type: [mcqSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length >= 10,
      message: 'Final exam must have at least 10 MCQs'
    }
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length >= 3,
      message: 'Final exam must have at least 3 coding challenges'
    }
  },
  totalMarks: { type: Number, default: 1000 },
  duration: { type: Number, default: 120 }, // minutes
  passingScore: { type: Number, default: 70 }, // percentage
  isSecure: { type: Boolean, default: true },
  securitySettings: {
    preventCopyPaste: { type: Boolean, default: true },
    preventTabSwitch: { type: Boolean, default: true },
    preventRightClick: { type: Boolean, default: true },
    fullScreenRequired: { type: Boolean, default: true },
    webcamMonitoring: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 120 } // minutes
  },
  isActive: { type: Boolean, default: true }
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
  finalExam: {
    type: finalExamSchema,
    default: null
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
