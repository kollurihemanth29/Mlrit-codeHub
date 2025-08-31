import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, AlertTriangle, CheckCircle, XCircle, Play, RotateCcw, Target, Award, TrendingUp, Brain, Code, FileText, ChevronRight, ArrowRight, ArrowLeft, Send, Zap, Eye, BarChart3 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './ModuleTestPage.css';

const ModuleTestPage = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();
  
  // Core state
  const [moduleTest, setModuleTest] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Test flow state
  const [showIntro, setShowIntro] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  // Question navigation
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  
  // Answer management
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Coding interface
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  // Results and evaluation
  const [testResults, setTestResults] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [timeSpent, setTimeSpent] = useState(0);
  
  // UI state
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Layout
  const [leftWidth, setLeftWidth] = useState(50);
  const [codeHeight, setCodeHeight] = useState(60);
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Initialize test data
  useEffect(() => {
    fetchModuleTest();
  }, [courseId, topicId]);

  // Timer management
  useEffect(() => {
    if (testStarted && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted]);

  // Load saved answers when switching questions
  useEffect(() => {
    const currentQ = allQuestions[currentQuestion];
    if (currentQ) {
      if (currentQ.type === 'mcq') {
        setSelectedAnswer(mcqAnswers[currentQuestion] || null);
      } else if (currentQ.type === 'coding') {
        const savedCoding = codingAnswers[currentQuestion];
        if (savedCoding) {
          setCode(savedCoding.code || '');
          setLanguage(savedCoding.language || 'python');
        } else {
          setCode(getInitialCode());
          setLanguage('python');
        }
      }
    }
  }, [currentQuestion, allQuestions, mcqAnswers, codingAnswers]);

  const fetchModuleTest = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/test`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const testData = response.data;
      
      setTopic({ title: testData.topicTitle });
      setModuleTest({
        mcqs: testData.mcqs || [],
        codeChallenges: testData.codeChallenges || [],
        totalMarks: testData.totalMarks
      });
      
      // Combine MCQs and coding challenges into unified question list
      const combinedQuestions = [
        ...(testData.mcqs || []).map((mcq, index) => ({ ...mcq, type: 'mcq', questionIndex: index })),
        ...(testData.codeChallenges || []).map((challenge, index) => ({ ...challenge, type: 'coding', questionIndex: index }))
      ];
      setAllQuestions(combinedQuestions);
    } catch (err) {
      console.error('Error fetching module test:', err);
      setError('Failed to load module test');
    } finally {
      setLoading(false);
    }
  };

  const handleMcqSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleSaveMcqAnswer = () => {
    if (selectedAnswer !== null) {
      setMcqAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }
  };

  const handleSaveCodingAnswer = () => {
    if (code.trim()) {
      setCodingAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          code: code.trim(),
          language: language
        }
      }));
    }
  };

  // Language mapping for Judge0 API
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const getInitialCode = () => {
    const currentQ = allQuestions[currentQuestion];
    if (currentQ?.type !== 'coding') return '';
    
    return currentQ.initialCode || `# Write your solution here
def solution():
    pass`;
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setShowOutput(true);
      return;
    }
    setIsRunning(true);
    setOutput("Running...");
    setShowOutput(true);

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());
    } catch (err) {
      console.error("Run Error:", err);
      setOutput("Error running code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartTest = () => {
    setShowIntro(false);
    setTestStarted(true);
  };

  const handleAutoSubmit = () => {
    handleSubmitTest(true);
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const totalAnswered = Object.keys(mcqAnswers).length + Object.keys(codingAnswers).length;
      if (totalAnswered === 0) {
        setShowSubmitWarning(true);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const mcqResults = [];
      const codingResults = [];
      
      // Process MCQ answers
      allQuestions.forEach((question, index) => {
        if (question.type === 'mcq') {
          const userAnswer = mcqAnswers[index];
          mcqResults.push({
            questionIndex: question.questionIndex,
            selectedOption: userAnswer !== undefined ? userAnswer : null,
            isCorrect: userAnswer !== undefined && userAnswer === question.correct,
            marks: question.marks || 1
          });
        }
      });
      
      // Process coding answers
      allQuestions.forEach((question, index) => {
        if (question.type === 'coding') {
          const userCode = codingAnswers[index];
          codingResults.push({
            questionIndex: question.questionIndex,
            submittedCode: userCode ? userCode.code : null,
            language: userCode ? userCode.language : null,
            marks: question.marks || 2
          });
        }
      });
      
      const submissionPayload = {
        userId: userId,
        topicId: topicId,
        mcqResults: mcqResults,
        codingResults: codingResults,
        timeSpent: timeSpent,
        completedAt: new Date().toISOString()
      };
      
      // Submit to backend for evaluation
      const response = await axios.post(
        `http://localhost:5000/api/progress/module-test`,
        {
          userId: userId,
          courseId: courseId,
          topicId: topicId,
          answers: mcqResults.map(result => result.selectedOption),
          codingAnswers: codingResults.reduce((acc, result, index) => {
            if (result.submittedCode) {
              acc[index + mcqResults.length] = {
                code: result.submittedCode,
                language: result.language
              };
            }
            return acc;
          }, {}),
          topicTitle: topic?.title
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const results = response.data.testResult;
      
      // Update leaderboard with module test completion
      try {
        await axios.post(
          `http://localhost:5000/api/course-leaderboard/${courseId}/update-score`,
          {
            userId,
            assessmentType: 'moduleTest',
            assessmentData: {
              topicId,
              mcqResults,
              codingResults
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Leaderboard updated with module test completion');
      } catch (leaderboardError) {
        console.warn('Failed to update leaderboard for module test:', leaderboardError);
      }
      
      setTestResults(results);
      setSubmissionData(submissionPayload);
      setTestCompleted(true);
      setShowResults(true);
      
      // Trigger progress refresh for course page
      localStorage.setItem('testCompleted', Date.now().toString());
      
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceSubmit = () => {
    setShowSubmitWarning(false);
    handleSubmitTest(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Resizer functionality
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    
    const doDrag = (e) => {
      const containerWidth = containerRef.current?.offsetWidth || 1200;
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newLeftWidth = Math.min(80, Math.max(20, startLeftWidth + deltaPercent));
      setLeftWidth(newLeftWidth);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startVerticalDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startCodeHeight = codeHeight;
    
    const doDrag = (e) => {
      const containerHeight = verticalContainerRef.current?.offsetHeight || 600;
      const deltaY = e.clientY - startY;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newCodeHeight = Math.min(85, Math.max(30, startCodeHeight + deltaPercent));
      setCodeHeight(newCodeHeight);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // Results display component
  const ResultsDisplay = () => {
    if (!testResults) return null;

    const getPerformanceRemark = (percentage) => {
      if (percentage >= 90) return { text: 'LEGENDARY', class: 'legendary', color: '#00ff41', glow: '#00ff41' };
      if (percentage >= 80) return { text: 'ELITE', class: 'elite', color: '#ff0080', glow: '#ff0080' };
      if (percentage >= 70) return { text: 'SKILLED', class: 'skilled', color: '#00d4ff', glow: '#00d4ff' };
      if (percentage >= 60) return { text: 'DECENT', class: 'decent', color: '#ffaa00', glow: '#ffaa00' };
      if (percentage >= 40) return { text: 'ROOKIE', class: 'rookie', color: '#ff6600', glow: '#ff6600' };
      return { text: 'NOVICE', class: 'novice', color: '#ff3333', glow: '#ff3333' };
    };

    const remark = getPerformanceRemark(testResults.percentage || 0);
    const totalMarks = testResults.totalMarks || ((moduleTest?.mcqs || []).reduce((sum, q) => sum + (q.marks || 1), 0) + (moduleTest?.codeChallenges || []).reduce((sum, q) => sum + (q.marks || 2), 0));

    return (
      <div className="neon-results-container">
        {/* Animated Background */}
        <div className="neon-bg">
          <div className="neon-grid"></div>
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle-${i % 4}`}></div>
            ))}
          </div>
        </div>

        {/* Header with Glitch Effect */}
        <div className="neon-header">
          <button 
            className="neon-back-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <ArrowLeft size={20} />
            <span>BACK TO COURSE</span>
          </button>
          <h1 className="glitch-title" data-text="TEST RESULTS">
            TEST RESULTS
          </h1>
        </div>

        <div className="neon-results-grid">
          {/* Holographic Score Display */}
          <div className="holo-score-section">
            <div className="holo-container">
              <div className="score-hologram">
                <div 
                  className="neon-circle"
                  style={{
                    ...({
                      '--percentage': testResults.percentage || 0,
                      '--glow-color': remark.glow
                    })
                  }}
                >
                  <div className="circle-inner">
                    <div className="percentage-display">
                      <span className="percentage-number">{Math.round(testResults.percentage || 0)}</span>
                      <span className="percentage-symbol">%</span>
                    </div>
                    <div className="score-rank" style={{ color: remark.color }}>
                      {remark.text}
                    </div>
                  </div>
                  <svg className="circle-progress" viewBox="0 0 200 200">
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="90" 
                      className="circle-bg"
                    />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="90" 
                      className="circle-fill"
                      style={{
                        ...({
                          '--stroke-color': remark.glow
                        }),
                        strokeDasharray: `${(testResults.percentage || 0) * 5.65} 565`
                      }}
                    />
                  </svg>
                </div>
              </div>
              
              <div className="marks-holo">
                <div className="marks-display-neon">
                  <div className="marks-icon">
                    <TrendingUp size={40} />
                  </div>
                  <div className="marks-data">
                    <div className="marks-value-neon">
                      <span className="earned">{testResults.score || 0}</span>
                      <span className="separator">/</span>
                      <span className="total">{totalMarks}</span>
                    </div>
                    <div className="marks-label-neon">MARKS EARNED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cyber Question Analysis */}
          <div className="cyber-analysis">
            <h3 className="cyber-title">
              <Target size={24} />
              <span className="title-text">QUESTION ANALYSIS</span>
              <div className="title-line"></div>
            </h3>
            <div className="cyber-stats-grid">
              <div className="cyber-card correct-card">
                <div className="card-glow correct-glow"></div>
                <div className="card-content">
                  <div className="stat-icon correct-icon">
                    <CheckCircle size={36} />
                  </div>
                  <div className="stat-data">
                    <div className="stat-number correct-number">{testResults.correctAnswers || 0}</div>
                    <div className="stat-label">CORRECT</div>
                  </div>
                </div>
                <div className="card-border"></div>
              </div>
              
              <div className="cyber-card wrong-card">
                <div className="card-glow wrong-glow"></div>
                <div className="card-content">
                  <div className="stat-icon wrong-icon">
                    <div className="wrong-x">✕</div>
                  </div>
                  <div className="stat-data">
                    <div className="stat-number wrong-number">{testResults.wrongAnswers || 0}</div>
                    <div className="stat-label">WRONG</div>
                  </div>
                </div>
                <div className="card-border"></div>
              </div>
              
              <div className="cyber-card unattempted-card">
                <div className="card-glow unattempted-glow"></div>
                <div className="card-content">
                  <div className="stat-icon unattempted-icon">
                    <div className="dash-icon">—</div>
                  </div>
                  <div className="stat-data">
                    <div className="stat-number unattempted-number">{testResults.unattempted || 0}</div>
                    <div className="stat-label">SKIPPED</div>
                  </div>
                </div>
                <div className="card-border"></div>
              </div>
            </div>
          </div>

          {/* Digital Assessment Info */}
          <div className="digital-info-panel">
            <h3 className="panel-title">
              <BookOpen size={24} />
              <span>ASSESSMENT DATA</span>
            </h3>
            <div className="info-matrix">
              <div className="matrix-row">
                <div className="matrix-cell">
                  <div className="cell-label">TOTAL QUESTIONS</div>
                  <div className="cell-value">{testResults.totalQuestions || 0}</div>
                </div>
                <div className="matrix-cell">
                  <div className="cell-label">ATTEMPTED</div>
                  <div className="cell-value">{(testResults.totalQuestions || 0) - (testResults.unattempted || 0)}</div>
                </div>
              </div>
              <div className="matrix-row">
                <div className="matrix-cell">
                  <div className="cell-label">TIME SPENT</div>
                  <div className="cell-value">{formatTime(timeSpent)}</div>
                </div>
                <div className="matrix-cell">
                  <div className="cell-label">COMPLETED</div>
                  <div className="cell-value">{new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Futuristic Performance Matrix */}
          <div className="performance-matrix">
            <h3 className="matrix-title">
              <BarChart3 size={24} />
              <span>PERFORMANCE MATRIX</span>
            </h3>
            <div className="matrix-table">
              <div className="matrix-header">
                <div className="header-cell">TYPE</div>
                <div className="header-cell">CORRECT</div>
                <div className="header-cell">TOTAL</div>
                <div className="header-cell">MARKS</div>
                <div className="header-cell">MAX</div>
                <div className="header-cell">RATE</div>
                <div className="header-cell">RANK</div>
              </div>
              
              <div className="matrix-row mcq-row">
                <div className="type-cell mcq-type">MCQ</div>
                <div className="data-cell">{testResults.mcqCorrect || 0}</div>
                <div className="data-cell">{moduleTest?.mcqs?.length || 0}</div>
                <div className="data-cell">{testResults.mcqScore || 0}</div>
                <div className="data-cell">{(moduleTest?.mcqs || []).reduce((sum, q) => sum + (q.marks || 1), 0)}</div>
                <div className="rate-cell">{moduleTest?.mcqs?.length ? Math.round(((testResults.mcqCorrect || 0) / moduleTest.mcqs.length) * 100) : 0}%</div>
                <div className="rank-cell" style={{ color: getPerformanceRemark(moduleTest?.mcqs?.length ? ((testResults.mcqCorrect || 0) / moduleTest.mcqs.length) * 100 : 0).color }}>
                  {getPerformanceRemark(moduleTest?.mcqs?.length ? ((testResults.mcqCorrect || 0) / moduleTest.mcqs.length) * 100 : 0).text}
                </div>
              </div>
              
              <div className="matrix-row coding-row">
                <div className="type-cell coding-type">CODE</div>
                <div className="data-cell">{testResults.codingCorrect || 0}</div>
                <div className="data-cell">{moduleTest?.codeChallenges?.length || 0}</div>
                <div className="data-cell">{testResults.codingScore || 0}</div>
                <div className="data-cell">{(moduleTest?.codeChallenges || []).reduce((sum, q) => sum + (q.marks || 2), 0)}</div>
                <div className="rate-cell">{moduleTest?.codeChallenges?.length ? Math.round(((testResults.codingCorrect || 0) / moduleTest.codeChallenges.length) * 100) : 0}%</div>
                <div className="rank-cell" style={{ color: getPerformanceRemark(moduleTest?.codeChallenges?.length ? ((testResults.codingCorrect || 0) / moduleTest.codeChallenges.length) * 100 : 0).color }}>
                  {getPerformanceRemark(moduleTest?.codeChallenges?.length ? ((testResults.codingCorrect || 0) / moduleTest.codeChallenges.length) * 100 : 0).text}
                </div>
              </div>
              
              <div className="matrix-row total-row">
                <div className="type-cell total-type">TOTAL</div>
                <div className="data-cell total-data">{testResults.correctAnswers || 0}</div>
                <div className="data-cell total-data">{testResults.totalQuestions || 0}</div>
                <div className="data-cell total-data">{testResults.score || 0}</div>
                <div className="data-cell total-data">{totalMarks}</div>
                <div className="rate-cell total-rate">{Math.round(testResults.percentage || 0)}%</div>
                <div className="rank-cell total-rank" style={{ color: remark.color }}>
                  {remark.text}
                </div>
              </div>
            </div>
          </div>

          {/* Neon Action Buttons */}
          <div className="neon-actions">
            <button 
              className="neon-btn primary-neon"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <div className="btn-glow"></div>
              <BookOpen size={20} />
              <span>RETURN TO COURSE</span>
            </button>
            <button 
              className="neon-btn secondary-neon"
              onClick={() => setShowReview(true)}
            >
              <div className="btn-glow"></div>
              <Eye size={20} />
              <span>REVIEW ASSESSMENT</span>
            </button>
            <button 
              className="neon-btn tertiary-neon"
              onClick={() => {
                setShowResults(false);
                setTestCompleted(false);
                setTestStarted(false);
                setShowIntro(true);
                setCurrentQuestion(0);
                setMcqAnswers({});
                setCodingAnswers({});
                setSelectedAnswer(null);
                setTestResults(null);
                setTimeSpent(0);
              }}
            >
              <div className="btn-glow"></div>
              <RotateCcw size={20} />
              <span>RETAKE TEST</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Review Assessment Component
  const renderReviewAssessment = () => {
    if (!moduleTest || !testResults) return null;

    return (
      <div className="test-container">
        <div className="test-header">
          <div className="header-content">
            <h1 className="test-title">Assessment Review</h1>
            <p className="test-subtitle">Review your answers and correct solutions</p>
          </div>
          <button 
            className="close-review-btn"
            onClick={() => setShowReview(false)}
          >
            <XCircle size={20} />
            Close Review
          </button>
        </div>

        <div className="review-content">
          {/* MCQ Questions Review */}
          {moduleTest.mcqs?.map((mcq, index) => (
            <div key={`mcq-review-${index}`} className="review-question-card">
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`question-result ${mcqAnswers[index] === mcq.correct ? 'correct' : 'incorrect'}`}>
                  {mcqAnswers[index] === mcq.correct ? (
                    <>
                      <CheckCircle size={16} />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Incorrect
                    </>
                  )}
                </span>
              </div>
              
              <div className="question-content">
                <h3 className="question-text">{mcq.question}</h3>
                
                <div className="options-review">
                  {mcq.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`option-review ${
                        optionIndex === mcq.correct ? 'correct-answer' : ''
                      } ${
                        mcqAnswers[index] === optionIndex ? 'user-answer' : ''
                      } ${
                        mcqAnswers[index] === optionIndex && optionIndex !== mcq.correct ? 'wrong-answer' : ''
                      }`}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span className="option-text">{option}</span>
                      {optionIndex === mcq.correct && <CheckCircle size={16} className="correct-icon" />}
                      {mcqAnswers[index] === optionIndex && optionIndex !== mcq.correct && <XCircle size={16} className="wrong-icon" />}
                    </div>
                  ))}
                </div>
                
                {mcq.explanation && (
                  <div className="explanation-box">
                    <h4>Explanation:</h4>
                    <p>{mcq.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Coding Questions Review */}
          {moduleTest.codeChallenges?.map((challenge, index) => (
            <div key={`coding-review-${index}`} className="review-question-card coding-review">
              <div className="question-header">
                <span className="question-number">Coding Challenge {index + 1}</span>
                <span className={`question-result ${testResults.codingResults?.[index]?.verdict === 'Accepted' ? 'correct' : 'incorrect'}`}>
                  {testResults.codingResults?.[index]?.verdict === 'Accepted' ? (
                    <>
                      <CheckCircle size={16} />
                      Accepted
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      {testResults.codingResults?.[index]?.verdict || 'Wrong Answer'}
                    </>
                  )}
                </span>
              </div>
              
              <div className="question-content">
                <h3 className="question-text">{challenge.title}</h3>
                <p className="challenge-description">{challenge.description}</p>
                
                {challenge.sampleInput && (
                  <div className="sample-data">
                    <h4>Sample Input:</h4>
                    <pre className="sample-text">{challenge.sampleInput}</pre>
                  </div>
                )}
                
                {challenge.sampleOutput && (
                  <div className="sample-data">
                    <h4>Sample Output:</h4>
                    <pre className="sample-text">{challenge.sampleOutput}</pre>
                  </div>
                )}
                
                <div className="code-review">
                  <h4>Your Solution:</h4>
                  <div className="code-editor-readonly">
                    <Editor
                      height="200px"
                      defaultLanguage={challenge.language || 'python'}
                      value={codingAnswers[moduleTest.mcqs.length + index] || challenge.initialCode || ''}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        theme: 'vs-dark'
                      }}
                    />
                  </div>
                </div>
                
                {testResults.codingResults?.[index]?.output && (
                  <div className="execution-output">
                    <h4>Output:</h4>
                    <pre className="output-text">{testResults.codingResults[index].output}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show review page
  if (showReview) {
    return renderReviewAssessment();
  }

  // Show results page
  if (showResults && testResults) {
    return <ResultsDisplay />;
  }

  if (loading || !moduleTest) {
    return (
      <div className="module-test-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading module test...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="module-test-container">
        <div className="test-intro">
          <div className="intro-header">
            <h1>Module Test: {topic?.title}</h1>
            <p className="intro-subtitle">Are you ready to test your knowledge of {topic?.title}?</p>
          </div>

          <div className="intro-content">
            <div className="test-overview">
              <h2>Why Take Our Module Test?</h2>
              <div className="overview-text">
                <p><strong>Identify Areas for Improvement:</strong> Our module test will highlight your strengths and weaknesses in various aspects of this topic.</p>
                <ul>
                  <li>If you score more than 80% in the module test - you should continue learning the next topics.</li>
                  <li>If you score less than 80% in the module test - you should revisit the learning concepts and practice more problems in this module.</li>
                </ul>
              </div>
            </div>

            <div className="test-syllabus">
              <h3>Test Syllabus</h3>
              <div className="syllabus-item">
                <span className="syllabus-icon">📄</span>
                <span>{topic?.title}</span>
              </div>
            </div>

            <div className="test-details">
              <div className="detail-item">
                <div className="detail-icon">🕒</div>
                <div className="detail-content">
                  <h4>{Math.floor(timeLeft / 60)} Minutes</h4>
                  <p>Total time to attempt the assessment</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <h4>{(moduleTest?.mcqs?.length || 0) + (moduleTest?.codeChallenges?.length || 0)} Questions</h4>
                  <p>MCQs and coding challenges</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <h4>{localStorage.getItem('username') || 'Student'}</h4>
                  <p>CodeChef Username: {localStorage.getItem('username') || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="test-rules">
              <h3>Read the rules carefully before starting</h3>
              <ul className="rules-list">
                <li>You will not be able to pause the assessment after starting.</li>
                <li>You will get a detailed report on your performance at the end of the assessment.</li>
                <li>Make sure you have a stable internet connection.</li>
                <li>Do not refresh the page during the test.</li>
              </ul>
            </div>

            <div className="start-section">
              <label className="agreement-checkbox">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                />
                <span>I agree to participate fairly in the assessment</span>
              </label>

              <button 
                className="start-assessment-btn"
                disabled={!agreedToRules}
                onClick={handleStartTest}
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>No test questions available</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return null;
  }

  return (
    <div className="module-test-container">
      {/* Custom Test Navbar */}
      <div className="test-navbar">
        <div className="navbar-left">
          <div className="test-status">
            <span className="status-indicator">●</span>
            <span className="status-text">Not Attempted</span>
          </div>
        </div>
        
        <div className="navbar-center">
          <div className="test-title">{topic?.title}</div>
          <div className="question-counter">
            Question {currentQuestion + 1} / {allQuestions.length}
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="timer-display">
            <Clock size={16} />
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          <div className="nav-controls">
            <button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              className="nav-control prev"
            >
              ‹ Prev
            </button>
            <span className="nav-divider">|</span>
            <button 
              onClick={nextQuestion}
              disabled={!allQuestions.length || currentQuestion >= allQuestions.length - 1}
              className="nav-control next"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="test-progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${allQuestions.length ? ((currentQuestion + 1) / allQuestions.length) * 100 : 0}%` }}
        ></div>
      </div>


      {/* Main Content - Dynamic Layout */}
      <div className="test-main-content">
        {allQuestions[currentQuestion]?.type === 'mcq' ? (
          <>
            {/* Left Panel - Question Statement */}
            <div className="test-left-panel">
              <div className="question-statement">
                <h2>Question {currentQuestion + 1}</h2>
                <p className="question-text">
                  {allQuestions[currentQuestion]?.question}
                </p>
              </div>
            </div>

            {/* Right Panel - MCQ Options */}
            <div className="test-right-panel">
              <div className="mcq-options">
                <h3>Choose the correct answer:</h3>
                <div className="options-list">
                  {allQuestions[currentQuestion]?.options?.map((option, index) => (
                    <label key={index} className="mcq-option">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => handleMcqSelect(index)}
                        className="mcq-radio"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mcq-actions">
                  <button
                    onClick={handleSaveMcqAnswer}
                    className="save-btn"
                    disabled={selectedAnswer === null}
                  >
                    Save Answer
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Coding Challenge Interface */
          <div className="coding-container" ref={containerRef}>
            {/* Left Panel - Problem Statement */}
            <div className="coding-left" style={{ width: `${leftWidth}%` }}>
              <div className="problem-statement">
                <h2>Question {currentQuestion + 1}: {allQuestions[currentQuestion]?.title}</h2>
                <div className="problem-description">
                  <p>{allQuestions[currentQuestion]?.description}</p>
                  
                  {allQuestions[currentQuestion]?.constraints && (
                    <div className="constraints-section">
                      <h3>Constraints:</h3>
                      <p>{allQuestions[currentQuestion]?.constraints}</p>
                    </div>
                  )}
                  
                  {allQuestions[currentQuestion]?.sampleInput && (
                    <div className="sample-cases">
                      <h3>Sample Test Cases:</h3>
                      <div className="testcase-block">
                        <strong>Input:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleInput}</pre>
                        <strong>Output:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleOutput}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resizer */}
            <div className="resizer" onMouseDown={startDrag} />

            {/* Right Panel - Code Editor and Output */}
            <div className="coding-right" style={{ width: `${100 - leftWidth}%` }} ref={verticalContainerRef}>
              <div className="editor-toolbar">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <div className="toolbar-buttons">
                  <button 
                    className="run-button"
                    onClick={handleRunCode} 
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleSaveCodingAnswer}
                    className="save-btn"
                    disabled={!code.trim()}
                  >
                    Save Code
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="code-editor-area" style={{ height: `${codeHeight}%` }}>
                <div className="monaco-editor-container">
                  <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(val) => {
                      setCode(val);
                    }}
                    options={{ 
                      fontSize: 14,
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      renderLineHighlight: 'line',
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      overviewRulerLanes: 0,
                      lineNumbersMinChars: 1,
                      glyphMargin: false,
                      folding: false,
                      renderWhitespace: 'none',
                      cursorBlinking: 'blink',
                      cursorStyle: 'line',
                      wordWrap: 'on',
                      contextmenu: false,
                      selectOnLineNumbers: true,
                      padding: { top: 0, bottom: 0 },
                      lineDecorationsWidth: 0,
                      revealHorizontalRightPadding: 0,
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                      }
                    }}
                  />
                </div>
              </div>

              {/* Vertical Resizer between code and output */}
              {showOutput && (
                <div className="vertical-resizer" onMouseDown={startVerticalDrag} />
              )}

              {/* Output Section */}
              {showOutput && (
                <div className="output-area" style={{ height: `${100 - codeHeight}%` }}>
                  <div className="output-section">
                    <h4>Output</h4>
                    <pre className="output-box">{output}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>




      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="modal-overlay">
          <div className="warning-modal">
            <div className="warning-header">
              <h3>⚠️ Submit Test Without Answers?</h3>
            </div>
            <div className="warning-content">
              <p>You haven't answered any questions yet. Are you sure you want to submit the test?</p>
              <p className="warning-note">This will result in a score of 0 points.</p>
            </div>
            <div className="warning-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSubmitWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="force-submit-btn"
                onClick={handleForceSubmit}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="test-navigation">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          <ArrowLeft size={20} />
          Previous
        </button>

        <div className="question-indicators">
          {allQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`question-indicator ${
                index === currentQuestion ? 'current' : ''
              } ${
                (question.type === 'mcq' && mcqAnswers[index] !== undefined) || 
                (question.type === 'coding' && codingAnswers[index] !== undefined) ? 'saved' : ''
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {allQuestions.length > 0 && currentQuestion === allQuestions.length - 1 ? (
          <button
            onClick={() => handleSubmitTest()}
            className="nav-btn submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
            <CheckCircle size={20} />
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="nav-btn next-btn"
          >
            Next
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleTestPage;
