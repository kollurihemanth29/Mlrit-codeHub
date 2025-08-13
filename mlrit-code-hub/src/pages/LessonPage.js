import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft, ChevronRight, CheckCircle, Clock, Target, Play, Book, Code, HelpCircle, Award, Menu, Check, Settings, X, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import { validateCourseStructure } from "../utils/courseUtils";
import "./LessonPage.css";

const LessonPage = () => {
  const { courseId, topicId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('output');
  const [activeTab, setActiveTab] = useState('statement');
  const [leftWidth, setLeftWidth] = useState(50);
  const [executionError, setExecutionError] = useState("");
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  
  // Compiler integration - same as SolveProblemSetProblem
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };
  
  const boilerplate = {
    cpp: `#include <iostream>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
    python: `# your code here`,
    java: `public class Main {
    public static void main(String[] args) {
        // your code here
    }
}`,
  };
  
  const isModifiedRef = useRef(false);
  const containerRef = useRef(null);
  
  // Resizer functionality for split-screen layout
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepProgress, setStepProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [steps, setSteps] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const attemptedRecovery = useRef(false);

  // Fetch the full course data
  const fetchCourse = useCallback(async () => {
    if (!courseId || !token) return null;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
      setCourseTitle(response.data.title);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course data');
      return null;
    }
  }, [courseId, token]);

  useEffect(() => {
    if (!courseId || !topicId || !lessonId || !token || !userId) {
      setError('Invalid course, topic, or lesson ID');
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      console.log('Fetching lesson with IDs:', courseId, topicId, lessonId);
      
      try {
        setLoading(true);
        
        // First, fetch the full course data
        const courseData = await fetchCourse();
        if (!courseData || !courseData.topics) {
          setError('Failed to load course data');
          setLoading(false);
          return;
        }
        
        // Then validate the course structure
        const validation = await validateCourseStructure(courseId, topicId, lessonId);
        
        if (!validation) {
          setError('Failed to validate course structure');
          setLoading(false);
          return;
        }
        
        if (!validation.valid) {
          console.warn('ID mismatch detected:', validation.error);
          
          // If we have a corrected URL, redirect to it
          if (validation.correctedUrl && validation.correctedUrl !== window.location.pathname) {
            console.log('Redirecting to corrected URL:', validation.correctedUrl);
            navigate(validation.correctedUrl);
            return;
          }
          
          // Otherwise show error
          setError(validation.error || 'Course structure validation failed');
          return;
        }
        
        // If validation passed, use the validated data
        const { topic, lesson } = validation;
        setLesson(lesson);
        setTopicTitle(topic.title);
        
        console.log('✅ Lesson loaded successfully:', lesson.title);
        
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || "Failed to load lesson";
        console.error('Fetch error:', status, message);
        setError(message);

        // Fallback recovery for unexpected errors
        if (status === 404 && !attemptedRecovery.current) {
          attemptedRecovery.current = true;
          console.log('Attempting fallback recovery...');
          navigate(`/courses/${courseId}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, topicId, lessonId, token, navigate]);

  const markComplete = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/lesson`,
        { userId, courseId, topicId, lessonId, completed: true, timeSpent: 0, score: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete lesson");
    }
  };

  // Initialize code with boilerplate when language changes
  useEffect(() => {
    if (!isModifiedRef.current) {
      setCode(boilerplate[language]);
      setOutput("");
      setVerdict("");
    }
  }, [language]);

  // Initialize custom input with sample input from current challenge
  useEffect(() => {
    const currentStep = getCurrentStep();
    if (currentStep?.type === 'coding' && currentStep.content?.sampleInput) {
      setCustomInput(currentStep.content.sampleInput);
    }
  }, [currentStep, steps]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setShowConsole(true);
      return;
    }
    setIsRunning(true);
    setOutput("Running...");
    setVerdict("");
    setShowConsole(true);

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      // Check against expected output if available
      const currentStep = getCurrentStep();
      if (currentStep?.type === 'coding' && currentStep.content?.sampleOutput) {
        const expected = currentStep.content.sampleOutput.trim();
        setVerdict(finalOutput.trim() === expected ? "✅ Correct Output" : "❌ Wrong Output");
      } else {
        setVerdict("");
      }
    } catch (err) {
      console.error("Run Error:", err);
      setOutput("Error running code");
      setVerdict("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before submitting.");
      return;
    }

    const currentStep = getCurrentStep();
    if (!currentStep?.content?.sampleOutput) {
      setOutput("No expected output available for submission.");
      return;
    }

    setIsRunning(true);
    setOutput("Evaluating solution...");
    setVerdict("");

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: currentStep.content.sampleInput || "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = currentStep.content.sampleOutput.trim();
      const isSuccess = finalOutput.trim() === expected;
      setVerdict(isSuccess ? "✅ Correct Output" : "❌ Wrong Output");

      // Mark step as completed if solution is correct
      if (isSuccess) {
        setStepProgress(prev => ({
          ...prev,
          [currentStep]: true
        }));
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setOutput("Submission error");
      setVerdict("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleMCQAnswer = (mcqIndex, optionIndex) => {
    const current = getCurrentStep()?.content;
    if (!current) return;
    
    setSelectedAnswer({ mcqIndex, optionIndex });
    setIsAnswered(true);
    setIsCorrect(optionIndex === current.correct);
    setShowExplanation(true);
  };

  const resetMCQ = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  // Calculate total steps based on lesson content
  useEffect(() => {
    if (lesson) {
      const stepsList = [];
      
      // Theory step
      if (lesson.content) {
        stepsList.push({
          type: 'theory',
          title: 'Theory',
          icon: <FileText size={20} />,
          content: lesson.content
        });
      }
      
      // MCQ steps - each MCQ as separate step
      if (lesson.mcqs?.length > 0) {
        lesson.mcqs.forEach((mcq, index) => {
          stepsList.push({
            type: 'mcq',
            title: `Question ${index + 1}`,
            icon: <Target size={20} />,
            content: mcq,
            mcqIndex: index
          });
        });
      }
      
      // Coding challenge steps - each challenge as separate step
      if (lesson.codeChallenges?.length > 0) {
        lesson.codeChallenges.forEach((challenge, index) => {
          stepsList.push({
            type: 'coding',
            title: `Coding Challenge ${index + 1}`,
            icon: <Code size={20} />,
            content: challenge,
            challengeIndex: index
          });
        });
      }
      
      // Review step
      if (lesson.review) {
        stepsList.push({
          type: 'review',
          title: 'Review',
          icon: <CheckCircle size={20} />,
          content: lesson.review
        });
      }
      
      setSteps(stepsList);
      setTotalSteps(stepsList.length);
    }
  }, [lesson]);

  // Get current step content
  const getCurrentStep = () => {
    return steps[currentStep] || null;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Mark current step as completed
      setStepProgress(prev => ({
        ...prev,
        [currentStep]: true
      }));
      setCurrentStep(currentStep + 1);
      // Reset MCQ state when moving to next step
      resetMCQ();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Reset MCQ state when moving to previous step
      resetMCQ();
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    resetMCQ();
  };

  // Check if current step can proceed to next
  const canProceedToNext = () => {
    const step = getCurrentStep();
    if (!step) return false;
    
    // For MCQ steps, user must answer correctly
    if (step.type === 'mcq') {
      return isAnswered && isCorrect;
    }
    
    // For coding steps, user should have a successful submission (optional but encouraged)
    if (step.type === 'coding') {
      return true; // Allow proceeding even without successful submission for now
    }
    
    // For other steps, always allow proceeding
    return true;
  };

  if (loading) return <div>Loading lesson...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="lesson-page">
      {/* Dark Progress Navigation Bar - Exact Match */}
      <div className="dark-progress-navbar">
        <div className="navbar-content">
          {/* Left Side - Navigation Icons */}
          <div className="navbar-left-icons">
            <button 
              onClick={() => navigate(`/courses/${courseId}`)} 
              className="nav-icon back-icon"
              title="Back to Course"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="nav-icon menu-icon"
              title="Course Menu"
            >
              <Menu size={16} />
            </button>
            <button 
              className="nav-icon check-icon"
              title="Mark Complete"
            >
              <Check size={16} />
            </button>
            <button 
              className="nav-icon settings-icon"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Right Side - Progress Navigation */}
          <div className="progress-navigation">
            {/* Previous Button */}
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="nav-btn prev-btn"
              title="Previous Step"
            >
              <ArrowLeft size={14} />
              <span>Prev</span>
            </button>

            {/* Progress Segments */}
            <div className="progress-segments">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`progress-dot ${
                    index < currentStep ? 'completed' : 
                    index === currentStep ? 'active' : 'pending'
                  }`}
                  onClick={() => index <= currentStep && goToStep(index)}
                  title={`${step.type.charAt(0).toUpperCase() + step.type.slice(1)}: ${step.title || `Step ${index + 1}`}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button 
              onClick={currentStep < totalSteps - 1 ? nextStep : markComplete}
              disabled={!canProceedToNext()}
              className={`nav-btn next-btn ${
                currentStep < totalSteps - 1 ? '' : 'complete-btn'
              }`}
              title={currentStep < totalSteps - 1 ? "Next Step" : "Complete Lesson"}
            >
              <span>{currentStep < totalSteps - 1 ? 'Next' : 'Complete'}</span>
              {currentStep < totalSteps - 1 ? 
                <ChevronRight size={14} /> : 
                <CheckCircle size={14} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Course Sidebar */}
      <div className={`course-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="sidebar-close"
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* Course Info */}
          <div className="sidebar-course-info">
            <div className="course-icon">
              <img src="/api/placeholder/48/48" alt="Python" className="course-logo" />
            </div>
            <div className="course-details">
              <h3 className="course-name">{courseTitle || 'Learn Python Programming'}</h3>
              <a href="#" className="view-syllabus">View full syllabus</a>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="sidebar-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.round(((currentStep + 1) / totalSteps) * 100)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Completed
            </div>
          </div>
          
          {/* Course Topics and Lessons List */}
          <div className="modules-list">
            {course?.topics?.map((topic, topicIndex) => {
              const isCurrentTopic = topic._id === topicId;
              const isExpanded = expandedTopics[topicIndex] ?? isCurrentTopic;
              
              return (
                <div key={topicIndex} className="module-section">
                  {/* Topic Header */}
                  <div 
                    className="module-header"
                    onClick={() => setExpandedTopics(prev => ({
                      ...prev,
                      [topicIndex]: !isExpanded
                    }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="module-number">{topicIndex + 1}</div>
                    <h3 className="module-title">{topic.title}</h3>
                    <div className="expand-icon">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  
                  {/* Topic Lessons - Only show when expanded */}
                  {isExpanded && (
                    <div className="module-lessons">
                      {topic.lessons?.map((lesson, lessonIndex) => {
                        const isCurrentLesson = isCurrentTopic && lesson._id === lessonId;
                        return (
                          <div 
                            key={lessonIndex} 
                            className={`lesson-item ${isCurrentLesson ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${courseId}/topic/${topic._id}/lesson/${lesson._id}`);
                            }}
                          >
                            <div className="lesson-status">
                              {isCurrentLesson ? (
                                <div className="active-dot"></div>
                              ) : (
                                <div className="pending-dot"></div>
                              )}
                            </div>
                            <span className="lesson-title">
                              {lesson.title}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Module Test */}
                      {topic.moduleTest && (
                        <div 
                          className="lesson-item test-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${courseId}/test`);
                          }}
                        >
                          <div className="lesson-status">
                            <div className="pending-dot"></div>
                          </div>
                          <span className="lesson-title">Module Test</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="lesson-content">
        {getCurrentStep() && (
          <div className="step-container">
            <div className="step-header">
              <h2>{getCurrentStep().icon} {getCurrentStep().title}</h2>
            </div>
            
            <div className="step-content">
              {/* Theory Step */}
              {getCurrentStep().type === 'theory' && (
                <div className="theory-step">
                  <div className="theory-content" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                </div>
              )}

              {/* MCQ Step */}
              {getCurrentStep().type === 'mcq' && (
                <div className="mcq-step">
                  <div className="mcq-question">
                    <h3>{getCurrentStep().content.question}</h3>
                    <div className="mcq-options">
                      {getCurrentStep().content.options.map((opt, optionIndex) => (
                        <button
                          key={optionIndex}
                          disabled={isAnswered}
                          className={`mcq-option ${
                            isAnswered
                              ? optionIndex === getCurrentStep().content.correct 
                                ? 'correct' 
                                : optionIndex === selectedAnswer?.optionIndex 
                                  ? 'incorrect' 
                                  : ''
                              : ''
                          }`}
                          onClick={() => handleMCQAnswer(getCurrentStep().mcqIndex, optionIndex)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {showExplanation && (
                      <div className={`mcq-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <strong>{isCorrect ? 'Correct! 🎉' : 'Incorrect 😞'}</strong>
                        <p>{getCurrentStep().content.explanation}</p>
                        {!isCorrect && (
                          <button onClick={resetMCQ} className="try-again-btn">Try Again</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Coding Challenge Step - Split Screen Layout */}
              {getCurrentStep().type === 'coding' && (
                <div className="coding-step-split">
                  <div className="solve-container" ref={containerRef}>
                    {/* Left Panel - Problem Statement */}
                    <div className="solve-left" style={{ width: `${leftWidth}%` }}>
                      <div className="left-tabs">
                        <button
                          className={activeTab === "statement" ? "active-tab" : ""}
                          onClick={() => setActiveTab("statement")}
                        >
                          Statement
                        </button>
                        <button
                          className={activeTab === "submissions" ? "active-tab" : ""}
                          onClick={() => setActiveTab("submissions")}
                        >
                          Submissions
                        </button>
                        <button
                          className={activeTab === "solution" ? "active-tab" : ""}
                          onClick={() => setActiveTab("solution")}
                        >
                          Solution
                        </button>
                        <button
                          className={activeTab === "aihelp" ? "active-tab" : ""}
                          onClick={() => setActiveTab("aihelp")}
                        >
                          AI Help
                        </button>
                      </div>

                      <div className="left-content">
                        {activeTab === "statement" ? (
                          <>
                            <h2>{getCurrentStep().content.title}</h2>
                            <div className="problem-description">
                              <p>{getCurrentStep().content.description}</p>
                              {getCurrentStep().content.constraints && (
                                <div className="constraints-section">
                                  <h3>Constraints:</h3>
                                  <p>{getCurrentStep().content.constraints}</p>
                                </div>
                              )}
                            </div>
                            
                            {getCurrentStep().content.sampleInput && getCurrentStep().content.sampleOutput && (
                              <div className="sample-cases">
                                <h3>Sample Test Cases:</h3>
                                <div className="testcase-block">
                                  <strong>Input:</strong>
                                  <pre>{getCurrentStep().content.sampleInput}</pre>
                                  <strong>Output:</strong>
                                  <pre>{getCurrentStep().content.sampleOutput}</pre>
                                </div>
                              </div>
                            )}
                          </>
                        ) : activeTab === "submissions" ? (
                          <div className="submissions-section">
                            <h2>Submission History</h2>
                            <div className="no-submissions">
                              <p>No submissions yet.</p>
                              <p className="submission-hint">Submit your solution to see it here.</p>
                            </div>
                          </div>
                        ) : activeTab === "solution" ? (
                          <div className="solution-section">
                            <h2>Solution</h2>
                            <p>Complete the challenge to unlock the solution.</p>
                          </div>
                        ) : (
                          <div className="aihelp-section">
                            <h2>AI Help</h2>
                            <p>Need help? Ask AI for hints and guidance.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resizer */}
                    <div className="resizer" onMouseDown={startDrag} />

                    {/* Right Panel - Code Editor */}
                    <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
                      <div className="editor-toolbar">
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            isModifiedRef.current = false;
                            setOutput("");
                            setVerdict("");
                          }}
                        >
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>
                        <div className="toolbar-buttons">
                          <button 
                            className="run-button"
                            onClick={handleRun} 
                            disabled={isRunning}
                          >
                            {isRunning ? 'Running...' : 'Run'}
                          </button>
                          <button 
                            className="submit-button"
                            onClick={handleSubmit} 
                            disabled={isRunning}
                          >
                            {isRunning ? 'Submitting...' : 'Submit'}
                          </button>
                        </div>
                      </div>

                      <div className="monaco-editor-container">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={language === 'cpp' ? 'cpp' : language}
                          value={code}
                          onChange={(val) => {
                            setCode(val);
                            isModifiedRef.current = true;
                          }}
                          options={{ 
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollbar: {
                              vertical: 'visible',
                              horizontal: 'visible',
                              useShadows: false,
                              verticalScrollbarSize: 8,
                              horizontalScrollbarSize: 8
                            }
                          }}
                        />
                      </div>

                      <div className="input-section">
                        <div className="input-header">
                          <h3>Custom Input</h3>
                        </div>
                        <textarea
                          className="input-box"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter custom input here"
                        />
                      </div>

                      <div className={`output-console ${showConsole ? 'visible' : ''}`}>
                        <div className="console-header" onClick={() => setShowConsole(!showConsole)}>
                          <h4>Console</h4>
                          <button className="console-close" onClick={(e) => {
                            e.stopPropagation();
                            setShowConsole(false);
                          }}>×</button>
                        </div>
                        <div className="console-content">
                          <div className="console-tabs">
                            <button 
                              className={`console-tab ${activeConsoleTab === 'output' ? 'active' : ''}`}
                              onClick={() => setActiveConsoleTab('output')}
                            >
                              Output
                            </button>
                            <button 
                              className={`console-tab ${activeConsoleTab === 'input' ? 'active' : ''}`}
                              onClick={() => setActiveConsoleTab('input')}
                            >
                              Input
                            </button>
                          </div>
                          <div className="console-body">
                            {activeConsoleTab === 'output' ? (
                              <>
                                <pre className="console-output">{output}</pre>
                                {verdict && <p className="verdict-msg">{verdict}</p>}
                              </>
                            ) : (
                              <textarea
                                className="console-input"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter custom input here"
                                rows={5}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {getCurrentStep().type === 'review' && (
                <div className="review-step">
                  <div className="review-content" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                </div>
              )}
            </div>


          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
