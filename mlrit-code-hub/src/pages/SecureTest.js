import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";

const SecureTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const timerRef = useRef(null);
  const violationsRef = useRef(0);
  const testStartTimeRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        
        // Mock test data - replace with actual API call
        const mockTestData = {
          id: "test-1",
          title: "JavaScript Fundamentals Assessment",
          duration: 30, // minutes
          questions: [
            {
              id: 1,
              question: "What is the output of typeof null?",
              options: ["null", "object", "undefined", "number"],
              correct: 1
            },
            {
              id: 2,
              question: "Which method removes the last element from an array?",
              options: ["shift()", "unshift()", "pop()", "push()"],
              correct: 2
            },
            {
              id: 3,
              question: "What does the 'this' keyword refer to in JavaScript?",
              options: ["The function itself", "The global object", "The object that owns the function", "The previous object"],
              correct: 2
            },
            {
              id: 4,
              question: "How do you declare a constant in JavaScript?",
              options: ["var", "let", "const", "constant"],
              correct: 2
            },
            {
              id: 5,
              question: "What is the purpose of the 'use strict' directive?",
              options: ["To enable strict mode", "To disable strict mode", "To declare variables", "To create functions"],
              correct: 0
            }
          ]
        };

        setTestData(mockTestData);
        setTimeLeft(mockTestData.duration * 60); // Convert to seconds

      } catch (err) {
        console.error('Error fetching test data:', err);
        setError(err.response?.data?.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [courseId]);

  // Security monitoring functions
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && testStarted) {
      addViolation("Tab switch detected");
    }
  }, [testStarted]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && testStarted) {
      addViolation("Exited fullscreen mode");
      // Try to re-enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          addViolation("Failed to re-enter fullscreen");
        });
      }
    }
  }, [testStarted]);

  const handleContextMenu = useCallback((e) => {
    if (testStarted) {
      e.preventDefault();
      addViolation("Right-click disabled");
    }
  }, [testStarted]);

  const handleKeyDown = useCallback((e) => {
    if (!testStarted) return;

    const forbiddenKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Escape', 'PrintScreen', 'ScrollLock', 'Pause'
    ];

    // Prevent F12 and Ctrl+Shift+I (Developer Tools)
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      addViolation("Developer tools access blocked");
    }

    // Prevent Alt+Tab
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      addViolation("Alt+Tab blocked");
    }

    // Prevent function keys
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
      addViolation(`Forbidden key pressed: ${e.key}`);
    }

    // Prevent Ctrl+ combinations
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'z')) {
      e.preventDefault();
      addViolation(`Forbidden keyboard shortcut: Ctrl+${e.key.toUpperCase()}`);
    }
  }, [testStarted]);

  const addViolation = (reason) => {
    const newViolations = violationsRef.current + 1;
    violationsRef.current = newViolations;
    setViolations(newViolations);

    // Show toast notification
    showToast(`Security Violation: ${reason}`, 'error');

    if (newViolations >= 3) {
      showToast("Maximum violations reached. Test will be auto-submitted.", 'error');
      setTimeout(() => {
        submitTest();
      }, 2000);
    }
  };

  const showToast = (message, type = 'info') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Timer countdown
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            showToast("Time's up! Test will be auto-submitted.", 'error');
            setTimeout(() => {
              submitTest();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeLeft]);

  // Security event listeners
  useEffect(() => {
    if (testStarted) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          showToast("Fullscreen mode is required for this test", 'error');
        });
      }

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [testStarted, handleVisibilityChange, handleFullscreenChange, handleContextMenu, handleKeyDown]);

  const startTest = () => {
    setTestStarted(true);
    testStartTimeRef.current = new Date();
    showToast("Test started! Fullscreen mode enabled.", 'info');
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitTest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const endTime = new Date();
      const duration = testStartTimeRef.current ? 
        Math.round((endTime.getTime() - testStartTimeRef.current.getTime()) / 1000) : 0;

      const submissionData = {
        courseId,
        testId: testData.id,
        answers,
        violations,
        duration,
        timeLeft
      };

      const response = await axios.post(
        'http://localhost:5000/api/courses/test/submit',
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showToast("Test submitted successfully!", 'success');
      
      // Navigate to results page
      setTimeout(() => {
        navigate(`/courses/${courseId}/test-results`);
      }, 2000);

    } catch (err) {
      console.error('Error submitting test:', err);
      showToast("Failed to submit test. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🧪</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {testData.title}
            </h1>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration:</span>
                <span>{testData.duration} minutes</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Questions:</span>
                <span>{testData.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Violations Allowed:</span>
                <span>2 (3rd violation auto-submits)</span>
              </div>
            </div>

                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
               <h3 className="font-semibold text-yellow-800 mb-2">Test Rules:</h3>
               <ul className="text-sm text-yellow-700 space-y-1">
                 <li>• Fullscreen mode will be enforced</li>
                 <li>• Tab switching is not allowed</li>
                 <li>• Right-click is disabled</li>
                 <li>• Function keys (F1-F12) are blocked</li>
                 <li>• Developer tools (F12, Ctrl+Shift+I) are blocked</li>
                 <li>• Alt+Tab switching is blocked</li>
                 <li>• Copy/paste shortcuts are disabled</li>
                 <li>• Exiting fullscreen will trigger violation</li>
               </ul>
             </div>

            <Button
              onClick={startTest}
              className="w-full"
              size="lg"
            >
              Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = testData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{testData.title}</h1>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {testData.questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">Time Remaining</div>
            </div>

            {/* Violations */}
            <div className="text-center">
              <div className={`text-lg font-bold ${
                violations >= 2 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {violations}/3
              </div>
              <div className="text-xs text-gray-400">Violations</div>
            </div>

            {/* Progress */}
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {Object.keys(answers).length}/{testData.questions.length}
              </div>
              <div className="text-xs text-gray-400">Answered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentQuestionData.question}
          </h2>
          
          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestionData.id] === index
                    ? 'border-blue-500 bg-blue-900'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionData.id}`}
                  checked={answers[currentQuestionData.id] === index}
                  onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                  className="text-blue-500 focus:ring-blue-500 mr-3"
                />
                <span className="text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            ← Previous
          </Button>

          <div className="flex space-x-4">
            {currentQuestion < testData.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                variant="outline"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={submitTest}
                loading={isSubmitting}
                disabled={isSubmitting}
                variant="success"
              >
                Submit Test
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Question Navigation</h3>
          <div className="grid grid-cols-5 gap-2">
            {testData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[testData.questions[index].id] !== undefined
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="fixed bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
        ⚠️ Test in Progress - Security Monitoring Active
      </div>
    </div>
  );
};

export default SecureTest;

