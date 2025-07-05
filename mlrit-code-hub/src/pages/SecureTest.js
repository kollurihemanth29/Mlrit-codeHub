import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import "./SecureTest.css";
import { Shield, Eye } from "lucide-react";

const SecureTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // seconds
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [violationModal, setViolationModal] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [showViolationPrompt, setShowViolationPrompt] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch test data from backend
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/courses/${id}/tests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTest({
          courseTitle: '', // Optionally fetch course title separately if needed
          duration: 30, // Default duration, or fetch from course if available
          questions: data
        });
        setTimeLeft(30 * 60);
        setLoading(false);
        // Don't auto-start test - wait for user interaction for fullscreen
      })
      .catch(() => {
        setTest(null);
        setLoading(false);
      });
  }, [id, token]);

  // Security violations tracking
  const handleViolation = useCallback((type) => {
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        // Calculate score before autosubmit
        let score = 0;
        if (test && test.questions) {
          score = test.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correct ? 1 : 0), 0);
        }
        setFinalScore(score);
        setViolationModal(true);
        // Do not auto-redirect, wait for user to click OK
      } else {
        setShowViolationPrompt(true);
      }
      return newCount;
    });
    alert(`Security Violation: ${type}. Your test may be terminated if violations continue.`);
  }, [navigate, test, answers]);

  // Fullscreen management
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setTestStarted(true);
      }
    } catch (error) {
      console.error('Fullscreen failed:', error);
      // If fullscreen fails, still start the test
      setTestStarted(true);
    }
  }, []);

  const startTest = () => {
    enterFullscreen();
  };

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (e) {}
  }, []);

  // Event listeners for security
  useEffect(() => {
    if (!testStarted) return;
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && testStarted) {
        handleViolation("Exited fullscreen mode");
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted) {
        handleViolation("Tab switched or window minimized");
      }
    };
    const handleKeyDown = (e) => {
      if (!testStarted) return;
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        handleViolation("Attempted to switch applications");
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 't')) {
        e.preventDefault();
        handleViolation("Attempted to use keyboard shortcuts");
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        handleViolation("Attempted to open developer tools");
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleViolation("Attempted to exit fullscreen");
      }
    };
    const handleRightClick = (e) => {
      if (testStarted) {
      e.preventDefault();
        handleViolation("Right-click blocked");
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleRightClick);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [testStarted, handleViolation]);

  // Timer
  useEffect(() => {
    if (!testStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          alert("Time's up! Submitting test...");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = (auto = false) => {
    if (testStarted) exitFullscreen();
    setAutoSubmitted(auto);
    if (!test || !test.questions) {
      navigate('/courses');
      return;
    }
    const score = test.questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);
    if (auto) {
      setTimeout(() => navigate('/courses'), 2000);
    } else {
      alert(`Test completed! Score: ${score}/${test.questions.length}`);
      navigate('/courses');
    }
  };

  if (loading) {
    return <div className="securetest-bg"><div className="securetest-card">Loading test...</div></div>;
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return <div className="securetest-bg"><div className="securetest-card">Test not found or no questions available.</div></div>;
  }

  if (!testStarted) {
    return (
      <div className="securetest-bg">
        <div className="securetest-card">
          <div className="text-center mb-6">
            <h2 className="securetest-title flex items-center justify-center gap-2">
              <Shield className="inline-block" style={{ color: '#8b5cf6', marginRight: 8 }} size={32} />
              Secure Test Environment
            </h2>
            <div className="securetest-subtitle">
              <span style={{ fontWeight: 600 }}>{test.courseTitle || 'Final Test'}</span><br/>
              Duration: {test.duration} minutes<br/>
              Questions: {test.questions.length}
            </div>
          </div>
          <div className="securetest-alert">
            <strong>Important Security Rules:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Test will run in fullscreen mode</li>
              <li>Tab switching is not allowed</li>
              <li>Right-click is disabled</li>
              <li>Keyboard shortcuts are blocked</li>
              <li>3 violations will terminate the test</li>
            </ul>
          </div>
          <div className="text-center">
            <Button 
              onClick={startTest}
              className="securetest-btn"
              style={{ fontSize: 18, padding: '1rem 3rem', marginTop: 16 }}
            >
              <Shield className="inline-block" style={{ marginRight: 8 }} size={20} />
              Start Secure Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];

  return (
    <div className="securetest-bg">
      <div className="securetest-card">
        {/* Header with security indicators */}
        <div className="securetest-header">
          <div className="flex items-center gap-6">
            <div className="securetest-indicator secure flex items-center gap-2">
              <Shield className="inline-block" style={{ color: isFullscreen ? '#22c55e' : '#ef4444' }} size={20} />
              <span>{isFullscreen ? 'Secure Mode' : 'SECURITY BREACH'}</span>
            </div>
            <div className="securetest-indicator flex items-center gap-2">
              <Eye className="inline-block" style={{ color: '#eab308' }} size={18} />
              <span>Violations: {violations}/3</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="securetest-timer flex items-center gap-2">
              <span role="img" aria-label="clock">⏰</span> {formatTime(timeLeft)}
            </span>
            <span className="text-sm">Question {currentQuestion + 1} of {test.questions.length}</span>
          </div>
        </div>
        {/* Progress */}
        <div className="securetest-progress-bar">
          <div
            className="securetest-progress"
            style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
        {/* Question */}
        <div className="securetest-question-card">
          <h3 className="securetest-question-title">Question {currentQuestion + 1}</h3>
          <p className="text-lg mb-6">{currentQ.question}</p>
          <div className="securetest-options">
            {currentQ.options.map((option, index) => (
              <label 
                key={index}
                className={`securetest-option${answers[currentQ.id] === index ? ' selected' : ''}`}
              >
          <input
            type="radio"
                  name={`question-${currentQ.id}`}
                  value={index}
                  checked={answers[currentQ.id] === index}
                  onChange={() => handleAnswerSelect(currentQ.id, index)}
                  className="w-4 h-4"
                />
                <span>{option}</span>
        </label>
      ))}
          </div>
        </div>
        {/* Navigation */}
        <div className="securetest-nav">
          <Button
            className="securetest-btn secondary"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion === test.questions.length - 1 ? (
            <Button 
              className="securetest-btn"
              onClick={() => handleSubmit()}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              className="securetest-btn"
              onClick={() => setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1))}
            >
              Next
            </Button>
          )}
        </div>
        {showViolationPrompt && (
          <div className="securetest-violation-modal">
            <div className="securetest-violation-content">
              <h2>Security Violation</h2>
              <p>You have violated the test security policy.<br/>Please stay in fullscreen and do not switch tabs or use shortcuts.<br/>Violations: {violations}/3</p>
              <button className="securetest-btn" onClick={async () => { setShowViolationPrompt(false); await enterFullscreen(); }}>OK</button>
            </div>
          </div>
        )}
        {violationModal && (
          <div className="securetest-violation-modal">
            <div className="securetest-violation-content">
              <h2>Test Auto-Submitted</h2>
              <p>Too many security violations.<br/>Your test has been auto-submitted.<br/><br/>Score: {finalScore !== null ? `${finalScore}/${test?.questions?.length || 0}` : '-'}</p>
              <button className="securetest-btn" onClick={() => navigate('/courses')}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureTest;

