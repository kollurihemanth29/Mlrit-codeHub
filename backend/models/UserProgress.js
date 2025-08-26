const mongoose = require("mongoose");

// Lesson progress within a topic
const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: String, required: true }, // Using string ID for lesson identification
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in minutes
  score: { type: Number, default: 0 }, // for MCQ/coding lessons
  attempts: { type: Number, default: 0 }
}, { _id: false });

// Module test progress within a topic
const moduleTestProgressSchema = new mongoose.Schema({
  attempted: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  attemptedAt: { type: Date },
  answers: [Object] // Store test answers
}, { _id: false });

// Topic progress
const topicProgressSchema = new mongoose.Schema({
  topicId: { type: String, required: true }, // Using string ID for topic identification
  topicTitle: { type: String, required: true },
  lessons: [lessonProgressSchema],
  moduleTest: moduleTestProgressSchema,
  completed: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  startedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  topicsProgress: [topicProgressSchema],
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  
  // Final Exam Progress
  finalExamCompleted: { type: Boolean, default: false },
  finalExamScore: { type: Number, default: 0 },
  finalExamAttempts: { type: Number, default: 0 },
  finalExamCompletedAt: { type: Date },
  certificateEarned: { type: Boolean, default: false },
  
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  // Backward compatibility
  completedModules: {
    type: [Number],
    default: [],
  },
  testAttempt: {
    score: Number,
    totalMarks: Number,
    percentage: Number,
    attemptedAt: Date,
    answers: [Object],
  },
}, {
  timestamps: true,
});

// Indexes for performance
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Calculate overall progress based on topics
UserProgressSchema.methods.calculateOverallProgress = function() {
  if (!this.topicsProgress || this.topicsProgress.length === 0) return 0;
  
  const totalTopics = this.topicsProgress.length;
  const completedTopics = this.topicsProgress.filter(tp => tp.completed).length;
  
  this.overallProgress = Math.round((completedTopics / totalTopics) * 100);
  return this.overallProgress;
};

// Update lesson progress
UserProgressSchema.methods.updateLessonProgress = function(topicId, lessonId, progressData) {
  let topic = this.topicsProgress.find(tp => tp.topicId === topicId);
  
  if (!topic) {
    topic = {
      topicId,
      topicTitle: progressData.topicTitle || 'Unknown Topic',
      lessons: [],
      completed: false,
      completionPercentage: 0,
      startedAt: new Date()
    };
    this.topicsProgress.push(topic);
  }
  
  let lesson = topic.lessons.find(lp => lp.lessonId === lessonId);
  
  if (!lesson) {
    lesson = {
      lessonId,
      completed: false,
      timeSpent: 0,
      score: 0,
      attempts: 0
    };
    topic.lessons.push(lesson);
  }
  
  // Update lesson data
  Object.assign(lesson, progressData);
  lesson.attempts += 1;
  
  if (progressData.completed) {
    lesson.completed = true;
    lesson.completedAt = new Date();
  }
  
  // Recalculate topic progress
  const totalLessons = topic.lessons.length;
  const completedLessons = topic.lessons.filter(lp => lp.completed).length;
  topic.completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  topic.completed = topic.completionPercentage === 100;
  
  if (topic.completed && !topic.completedAt) {
    topic.completedAt = new Date();
  }
  
  // Update overall progress
  this.calculateOverallProgress();
  this.lastAccessedAt = new Date();
  
  return this.save();
};

// Update module test progress
UserProgressSchema.methods.updateModuleTestProgress = function(topicId, testData) {
  let topic = this.topicsProgress.find(tp => tp.topicId === topicId);
  
  if (!topic) {
    topic = {
      topicId,
      topicTitle: testData.topicTitle || 'Unknown Topic',
      lessons: [],
      completed: false,
      completionPercentage: 0,
      startedAt: new Date()
    };
    this.topicsProgress.push(topic);
  }
  
  topic.moduleTest = {
    attempted: true,
    score: testData.score || 0,
    totalMarks: testData.totalMarks || 0,
    percentage: testData.totalMarks > 0 ? Math.round((testData.score / testData.totalMarks) * 100) : 0,
    attemptedAt: new Date(),
    answers: testData.answers || []
  };
  
  this.lastAccessedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("UserProgress", UserProgressSchema);
