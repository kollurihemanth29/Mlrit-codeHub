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
  explanation: String,
  marks: { 
    type: Number, 
    required: true, 
    default: 1,
    min: [0.5, 'Marks must be at least 0.5'],
    max: [100, 'Marks cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
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
  marks: { 
    type: Number, 
    required: true, 
    default: 2,
    min: [1, 'Marks must be at least 1'],
    max: [100, 'Marks cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number,
    default: 30, // seconds
    min: [5, 'Time limit must be at least 5 seconds'],
    max: [300, 'Time limit cannot exceed 300 seconds']
  },
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
      validator: function(v) {
        // Allow empty MCQs array, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'MCQs must be an array with 0 or more questions'
    },
    default: []
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: function(v) {
        // Allow empty coding challenges array, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Coding challenges must be an array with 0 or more questions'
    },
    default: []
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
    mcqs: {
      type: [mcqSchema],
      default: []
    },
    codeChallenges: {
      type: [codeChallengeSchema], 
      default: []
    },
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
      validator: function(v) {
        // MCQs are optional, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Final exam MCQs must be an array with 0 or more questions'
    },
    default: []
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: function(v) {
        // Coding challenges are optional, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Final exam coding challenges must be an array with 0 or more questions'
    },
    default: []
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

// Scoring Configuration Schema
const scoringConfigSchema = new mongoose.Schema({
  mcqMarks: { type: Number, required: true, default: 10 }, // Marks per correct MCQ
  codingMarks: { type: Number, required: true, default: 50 }, // Marks per correct coding challenge
  lessonMcqMarks: { type: Number, required: true, default: 5 }, // Marks per lesson MCQ
  lessonCodingMarks: { type: Number, required: true, default: 25 }, // Marks per lesson coding challenge
  moduleTestMcqMarks: { type: Number, required: true, default: 15 }, // Marks per module test MCQ
  moduleTestCodingMarks: { type: Number, required: true, default: 75 }, // Marks per module test coding challenge
  finalExamMcqMarks: { type: Number, required: true, default: 20 }, // Marks per final exam MCQ
  finalExamCodingMarks: { type: Number, required: true, default: 100 } // Marks per final exam coding challenge
}, { _id: false });

// Unified Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topics: {
    type: [topicSchema],
    default: []
  },
  finalExam: {
    type: finalExamSchema,
    default: null
  },
  scoringConfig: {
    type: scoringConfigSchema,
    default: function() {
      return {
        lessons: { mcqMarks: 5, codingMarks: 10 },
        moduleTests: { mcqMarks: 10, codingMarks: 20 },
        finalExam: { mcqMarks: 15, codingMarks: 25 }
      };
    }
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
