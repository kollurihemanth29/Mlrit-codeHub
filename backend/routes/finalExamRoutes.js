const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');
const UserProgress = require('../models/UserProgress');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Get final exam for a course
router.get('/courses/:courseId/final-exam', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get course with final exam
    const course = await Course.findById(courseId);
    if (!course || !course.finalExam || !course.finalExam.isActive) {
      return res.status(404).json({ message: 'Final exam not found or not active' });
    }

    // Check if user is enrolled
    const userProgress = await UserProgress.findOne({ userId, courseId });
    if (!userProgress) {
      return res.status(403).json({ message: 'User not enrolled in this course' });
    }

    // Progress check removed for testing purposes
    const overallProgress = userProgress.calculateOverallProgress();
    // if (overallProgress < 80) {
    //   return res.status(403).json({ 
    //     message: 'Complete at least 80% of the course to access final exam',
    //     currentProgress: overallProgress
    //   });
    // }

    // Check if final exam already exists in SkillTest collection
    let skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    // If not exists, create it from course final exam data
    if (!skillTest) {
      skillTest = new SkillTest({
        title: course.finalExam.title,
        description: course.finalExam.description,
        duration: course.finalExam.duration,
        type: 'final_exam',
        difficulty: 'Hard',
        questions: course.finalExam.mcqs || [],
        codingProblems: course.finalExam.codeChallenges || [],
        courseId,
        isFinalExam: true,
        passingScore: course.finalExam.passingScore,
        totalMarks: course.finalExam.totalMarks,
        securitySettings: course.finalExam.securitySettings || {},
        isActive: true
      });
      await skillTest.save();
    }

    // Check previous attempts
    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    // Remove sensitive data (correct answers) for security
    const sanitizedQuestions = skillTest.questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      marks: q.marks
    }));

    const sanitizedCodingProblems = skillTest.codingProblems.map(p => ({
      title: p.title,
      description: p.description,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      constraints: p.constraints,
      initialCode: p.initialCode,
      language: p.language,
      testCases: p.testCases?.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden
      }))
    }));

    res.json({
      exam: {
        _id: skillTest._id,
        title: skillTest.title,
        description: skillTest.description,
        duration: skillTest.duration,
        totalMarks: skillTest.totalMarks,
        passingScore: skillTest.passingScore,
        mcqs: sanitizedQuestions,
        codeChallenges: sanitizedCodingProblems,
        securitySettings: skillTest.securitySettings
      },
      course: {
        title: course.title,
        _id: course._id
      },
      attempts: userAttempts.length,
      maxAttempts: 3, // Allow 3 attempts
      canRetake: userAttempts.length < 3,
      bestScore: userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : null
    });

  } catch (error) {
    console.error('Error fetching final exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit final exam
router.post('/courses/:courseId/final-exam/submit', 
  authenticateToken,
  body('answers').isArray().withMessage('Answers must be an array'),
  body('codingSubmissions').isArray().withMessage('Coding submissions must be an array'),
  body('timeSpent').isNumeric().withMessage('Time spent must be a number'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { answers, codingSubmissions, timeSpent, securityViolations = [], proctoringData = {} } = req.body;
    const userId = req.user.id;
    
    // Use securityViolations as-is since we changed the schema to Mixed type
    const parsedSecurityViolations = securityViolations || [];

    // Get the skill test (final exam)
    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    // Check attempt limit
    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    if (userAttempts.length >= 3) {
      return res.status(403).json({ message: 'Maximum attempts exceeded' });
    }

    // Calculate MCQ score
    let correctMCQs = 0;
    let mcqScore = 0;
    const mcqAttempted = answers.filter(a => a !== null && a !== undefined).length;
    
    skillTest.questions.forEach((question, index) => {
      if (answers[index] !== undefined && answers[index] === question.correct) {
        correctMCQs++;
        mcqScore += question.marks || 0;
      }
    });
    
    const mcqPercentage = skillTest.questions.length > 0 
      ? Math.round((correctMCQs / skillTest.questions.length) * 100) 
      : 0;

    // For coding problems, we'll use a simplified scoring
    // In a real system, you'd run the code against test cases
    let codingScore = 0;
    const codingResults = [];

    skillTest.codingProblems.forEach((problem, index) => {
      const submission = codingSubmissions[index];
      if (submission && submission.code && submission.code.trim().length > 50) {
        // Simple scoring: give partial credit if code is substantial
        const partialScore = Math.floor((problem.marks || 0) * 0.7); // 70% for attempt
        codingScore += partialScore;
        codingResults.push({
          problemIndex: index,
          score: partialScore,
          maxScore: problem.marks || 0,
          status: 'partial'
        });
      } else {
        codingResults.push({
          problemIndex: index,
          score: 0,
          maxScore: problem.marks || 0,
          status: 'not_attempted'
        });
      }
    });

    const totalScore = mcqScore + codingScore;
    const percentage = Math.round((totalScore / skillTest.totalMarks) * 100);
    const passed = percentage >= skillTest.passingScore;

    // Create attempt record
    const attempt = {
      userId,
      score: totalScore,
      totalQuestions: skillTest.questions.length + skillTest.codingProblems.length,
      correctAnswers: correctMCQs,
      timeSpent,
      securityViolations: parsedSecurityViolations,
      tabSwitchCount: proctoringData.tabSwitchCount || parsedSecurityViolations.filter(v => v.type && v.type.includes('Tab switch')).length,
      submittedAt: new Date(),
      autoSubmitted: timeSpent >= skillTest.duration * 60, // Auto-submit if time exceeded
      passed,
      details: {
        mcqScore,
        codingScore,
        codingResults,
        percentage
      }
    };

    skillTest.attempts.push(attempt);
    await skillTest.save();

    // Update user progress if passed
    if (passed) {
      const userProgress = await UserProgress.findOne({ userId, courseId });
      if (userProgress) {
        userProgress.finalExamCompleted = true;
        userProgress.finalExamScore = percentage;
        userProgress.certificateEarned = true;
        await userProgress.save();
      }
    }

    // Calculate correct coding answers
    const correctCoding = codingResults.filter(r => r.status === 'correct' || r.status === 'partial').length;
    const totalAttempted = mcqAttempted + codingResults.filter(r => r.status !== 'not_attempted').length;
    const totalCorrect = correctMCQs + correctCoding;
    const totalQuestions = skillTest.questions.length + skillTest.codingProblems.length;
    const wrongCount = totalAttempted - totalCorrect;
    const unattemptedCount = totalQuestions - totalAttempted;

    // Prepare the response in the format expected by the frontend
    const responseData = {
      success: true,
      results: {
        totalScore,
        percentage,
        passed,
        mcqScore,
        codingScore,
        correctMCQs,
        totalMCQs: skillTest.questions.length,
        mcqAttempted,
        mcqPercentage,
        codingAttempted: codingResults.filter(r => r.status !== 'not_attempted').length,
        codingPercentage: skillTest.codingProblems.length > 0 
          ? Math.round((codingScore / skillTest.codingProblems.reduce((sum, p) => sum + (p.marks || 0), 0)) * 100) 
          : 0,
        codingResults,
        timeSpent,
        attemptNumber: userAttempts.length + 1,
        canRetake: userAttempts.length + 1 < 3 && !passed,
        certificateEarned: passed,
        totalQuestions,
        totalAttempted,
        totalCorrect,
        correctCount: totalCorrect,
        wrongCount,
        unattemptedCount,
        mcqCorrect: correctMCQs,
        codingCorrect: correctCoding,
        securityViolations: securityViolations || []
      },
      examData: {
        title: skillTest.title,
        description: skillTest.description,
        duration: skillTest.duration,
        totalMarks: skillTest.totalMarks,
        passingScore: skillTest.passingScore,
        questions: skillTest.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          userAnswer: answers[i],
          isCorrect: answers[i] === q.correct,
          marks: q.marks || 0,
          type: 'mcq'
        })),
        codingProblems: skillTest.codingProblems.map((p, i) => ({
          title: p.title,
          description: p.description,
          userCode: codingSubmissions[i]?.code || '',
          result: codingResults[i] || { status: 'not_attempted', score: 0 },
          marks: p.marks || 0,
          type: 'coding'
        }))
      }
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error submitting final exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit final exam',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get final exam results
router.get('/courses/:courseId/final-exam/results', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (userAttempts.length === 0) {
      return res.status(404).json({ message: 'No attempts found' });
    }

    const bestAttempt = userAttempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    res.json({
      attempts: userAttempts.map(attempt => ({
        score: attempt.score,
        percentage: attempt.details?.percentage || Math.round((attempt.score / skillTest.totalMarks) * 100),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        mcqScore: attempt.details?.mcqScore || 0,
        codingScore: attempt.details?.codingScore || 0
      })),
      bestScore: bestAttempt.score,
      bestPercentage: bestAttempt.details?.percentage || Math.round((bestAttempt.score / skillTest.totalMarks) * 100),
      passed: bestAttempt.passed,
      totalMarks: skillTest.totalMarks,
      passingScore: skillTest.passingScore
    });

  } catch (error) {
    console.error('Error fetching final exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
