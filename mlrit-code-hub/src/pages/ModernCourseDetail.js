import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  Lock,
  Award,
  Target,
  Code,
  FileText,
  ChevronRight,
  Zap,
  Trophy,
  TrendingUp,
  Shield,
  Brain,
  Timer,
  AlertTriangle
} from "lucide-react";
import "./ModernCourseDetail.css";

const ModernCourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);
        
        const enrolledResponse = await axios.get(`http://localhost:5000/api/courses/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const enrolled = (enrolledResponse.data?.courses || []).some(c => c._id === courseId || c.id === courseId);
        setIsEnrolled(enrolled);
        
        if (enrolled && userId) {
          const progressResponse = await axios.get(`http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProgress(progressResponse.data || {});
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, token, userId]);

  const reloadProgress = async () => {
    try {
      const progRes = await axios.get(`http://localhost:5000/api/progress`, {
        params: { userId, courseId: courseId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(progRes.data || {});
    } catch (e) {
      console.error('Error refreshing progress:', e);
    }
  };

  const startLesson = async (topic, lesson) => {
    try {
      await axios.post(`http://localhost:5000/api/progress/lesson`, {
        userId,
        courseId: courseId,
        topicId: topic?._id,
        lessonId: lesson?._id,
        completed: false,
        timeSpent: 0,
        score: 0,
        topicTitle: topic?.title || 'Unknown Topic'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await reloadProgress();
      navigate(`/courses/${courseId}/topic/${topic?._id}/lesson/${lesson?._id}`);
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const startTopic = (topicIndex) => {
    const topic = (course.topics || [])[topicIndex];
    if (!topic) return;
    const firstLesson = (topic.lessons || [])[0];
    if (firstLesson) {
      startLesson(topic, firstLesson);
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p className="loading-text">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Course not found</h2>
          <button onClick={() => navigate('/courses')} className="modern-back-btn">
            <ArrowLeft size={20} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const totalTopics = (course.topics || []).length;
  const p = progress || {};
  const completedTopics = (p.topicsProgress || []).filter(t => t.completed).length;
  const progressPercent = typeof p.overallProgress === 'number'
    ? p.overallProgress
    : (totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modern-course-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <button onClick={() => navigate('/courses')} className="modern-back-btn">
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div className="course-hero">
            <div className="course-info">
              <div className="badge-container">
                <span 
                  className={`difficulty-pill ${course.difficulty.toLowerCase()}`}
                  style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
                >
                  {course.difficulty}
                </span>
                <span className="course-pill">Course</span>
              </div>
              
              <h1 className="hero-title">{course.title}</h1>
              <p className="hero-description">{course.description}</p>
              
              <div className="stats-row">
                <div className="stat">
                  <Clock size={18} />
                  <span>{course.duration || '2-3 hours'}</span>
                </div>
                <div className="stat">
                  <Users size={18} />
                  <span>{course.enrolledCount || 0} students</span>
                </div>
                <div className="stat">
                  <BookOpen size={18} />
                  <span>{totalTopics} modules</span>
                </div>
                <div className="stat">
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <span>4.8 rating</span>
                </div>
              </div>
              
              {isEnrolled && (
                <div className="progress-card">
                  <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{progressPercent}%</span>
                  </div>
                  <div className="modern-progress-bar">
                    <div 
                      className="modern-progress-fill" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="progress-detail">{completedTopics} of {totalTopics} modules completed</span>
                </div>
              )}
            </div>
            
            <div className="action-panel">
              {!isEnrolled ? (
                <div className="enroll-card">
                  <div className="price-display">
                    <span className="price-label">Price</span>
                    <span className="price-value">Free</span>
                  </div>
                  <button onClick={handleEnroll} className="modern-enroll-btn">
                    <Play size={20} />
                    Enroll Now
                  </button>
                  <div className="features-list">
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Lifetime access</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Certificate included</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Interactive coding</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="enrolled-card">
                  <div className="enrolled-header">
                    <CheckCircle size={24} color="#10b981" />
                    <div>
                      <h3>Enrolled</h3>
                      <p>Continue your learning journey</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (progressPercent > 0) {
                        const firstIncompleteTopicIndex = (course.topics || []).findIndex((topic) => {
                          const tProg = ((p.topicsProgress || [])).find(tp => 
                            (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id)
                          );
                          return !tProg?.completed;
                        });
                        
                        if (firstIncompleteTopicIndex !== -1) {
                          const topic = course.topics[firstIncompleteTopicIndex];
                          const firstLesson = (topic.lessons || [])[0];
                          if (firstLesson) {
                            startLesson(topic, firstLesson);
                          }
                        } else {
                          startTopic(0);
                        }
                      } else {
                        startTopic(0);
                      }
                    }} 
                    className="modern-continue-btn"
                  >
                    <Play size={20} />
                    {progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="modern-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <button 
              className={`modern-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              <BookOpen size={18} />
              <span>Curriculum</span>
            </button>
            <button 
              className={`modern-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText size={18} />
              <span>About</span>
            </button>
            {isEnrolled && (
              <button 
                className={`modern-tab ${activeTab === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('progress')}
              >
                <TrendingUp size={18} />
                <span>Progress</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="modern-content">
        {activeTab === 'curriculum' && (
          <div className="curriculum-section">
            <div className="curriculum-header">
              <div className="header-content">
                <h3 className="section-title">Course Curriculum</h3>
                <p className="curriculum-subtitle">{totalTopics} modules • {course.duration || '2-3 hours'} total</p>
              </div>
            </div>
            
            <div className="modules-grid">
              {(course.topics || []).map((topic, topicIndex) => {
                const tProg = ((p.topicsProgress || [])).find(tp => (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id));
                const isTopicCompleted = tProg?.completed || false;
                const topicCompletionPercentage = tProg?.completionPercentage || 0;
                const isLocked = !isEnrolled;
                
                return (
                  <div key={topicIndex} className={`modern-module ${isTopicCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                    <div className="module-card">
                      <div className="module-header">
                        <div className="module-number">
                          {isLocked ? (
                            <Lock size={18} />
                          ) : isTopicCompleted ? (
                            <CheckCircle size={18} color="#10b981" />
                          ) : (
                            <span className="number">{topicIndex + 1}</span>
                          )}
                        </div>
                        
                        <div className="module-content">
                          <div className="module-title-row">
                            <h4 className="module-title">{topic.title}</h4>
                            {!isLocked && (
                              <button 
                                onClick={() => startTopic(topicIndex)} 
                                className="review-btn"
                              >
                                {isTopicCompleted ? 'Review' : topicCompletionPercentage > 0 ? 'Continue' : 'Start'}
                                <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                          <p className="module-description">{topic.description}</p>
                          
                          {topicCompletionPercentage > 0 && (
                            <div className="completion-badge">
                              {topicCompletionPercentage === 100 ? '100% Solved' : `${topicCompletionPercentage}% Complete`}
                            </div>
                          )}
                          
                          {/* Lesson and Test Items */}
                          <div className="module-items">
                            {(topic.lessons || []).map((lesson, lIndex) => {
                              const isLessonCompleted = !!(tProg?.lessons || []).find(l => (l.lessonId?.toString?.() || l.lessonId) === (lesson._id?.toString?.() || lesson._id))?.completed;
                              return (
                                <div 
                                  key={`lesson-${lIndex}`} 
                                  className={`module-item ${isLessonCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                  onClick={() => !isLocked && startLesson(topic, lesson)}
                                >
                                  <div className="item-status">
                                    {isLocked ? (
                                      <Lock size={16} />
                                    ) : (
                                      <div className={`completion-circle ${isLessonCompleted ? 'completed' : ''}`}></div>
                                    )}
                                  </div>
                                  <div className="item-content">
                                    <span className="item-title">{lesson.title}</span>
                                    <span className="item-type">Lesson</span>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Module Test */}
                            {topic.moduleTest && (topic.moduleTest.mcqs?.length > 0 || topic.moduleTest.codeChallenges?.length > 0) && (
                              <div 
                                className={`module-item test-item ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isLocked && navigate(`/courses/${courseId}/topic/${topic._id}/test`)}
                              >
                                <div className="item-status">
                                  {isLocked ? (
                                    <Lock size={16} />
                                  ) : (
                                    <div className="item-icon test">
                                      <Award size={16} />
                                    </div>
                                  )}
                                </div>
                                <div className="item-content">
                                  <span className="item-title">Knowledge Assessment: {topic.title}</span>
                                  <span className="item-type">Assessment</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Final Exam Section */}
            {course.finalExam && course.finalExam.isActive && (
              <div className="final-exam-section">
                <div className="final-exam-header">
                  <div className="exam-icon">
                    <Shield size={32} />
                  </div>
                  <div className="exam-info">
                    <h3 className="exam-title">{course.finalExam.title}</h3>
                    <p className="exam-description">{course.finalExam.description}</p>
                  </div>
                </div>
                
                <div className="exam-stats">
                  <div className="exam-stat">
                    <Brain size={20} />
                    <span>{course.finalExam.mcqs?.length || 0} MCQs + {course.finalExam.codeChallenges?.length || 0} Coding</span>
                  </div>
                  <div className="exam-stat">
                    <Timer size={20} />
                    <span>{course.finalExam.duration} minutes</span>
                  </div>
                  <div className="exam-stat">
                    <Trophy size={20} />
                    <span>{course.finalExam.totalMarks} marks</span>
                  </div>
                  <div className="exam-stat">
                    <Target size={20} />
                    <span>{course.finalExam.passingScore}% to pass</span>
                  </div>
                </div>
                
                {course.finalExam.securitySettings?.isSecure && (
                  <div className="security-notice">
                    <AlertTriangle size={16} />
                    <span>Secure Assessment - Full screen required, copy-paste disabled</span>
                  </div>
                )}
                
                <div className="exam-actions">
                  {!isEnrolled ? (
                    <button className="exam-btn locked" disabled>
                      <Lock size={18} />
                      Enroll to Access Final Exam
                    </button>
                  ) : (
                    <button 
                      className="exam-btn available"
                      onClick={() => navigate(`/courses/${courseId}/final-exam`)}
                    >
                      <Shield size={18} />
                      Take Final Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="content-grid">
              <div className="main-content">
                <div className="info-card">
                  <h3 className="section-title">What you'll learn</h3>
                  <div className="objectives-grid">
                    <div className="objective">
                      <div className="objective-icon">
                        <Zap size={20} />
                      </div>
                      <span>Master {course.title.toLowerCase()} fundamentals</span>
                    </div>
                    <div className="objective">
                      <div className="objective-icon">
                        <Code size={20} />
                      </div>
                      <span>Build practical coding projects</span>
                    </div>
                    <div className="objective">
                      <div className="objective-icon">
                        <Trophy size={20} />
                      </div>
                      <span>Industry best practices</span>
                    </div>
                    <div className="objective">
                      <div className="objective-icon">
                        <Target size={20} />
                      </div>
                      <span>Interview preparation</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-card">
                  <h3 className="section-title">Course Overview</h3>
                  <p className="course-overview">
                    {course.description} This comprehensive course takes you from beginner to advanced level 
                    through interactive lessons, coding challenges, and real-world projects.
                  </p>
                </div>
              </div>
              
              <div className="sidebar-content">
                <div className="instructor-card">
                  <div className="instructor-header">
                    <div className="instructor-avatar">
                      <span>AI</span>
                    </div>
                    <div className="instructor-info">
                      <h4>AI Learning Assistant</h4>
                      <p>Expert Instructor</p>
                    </div>
                  </div>
                  <div className="instructor-stats">
                    <div className="stat-item">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>4.9 rating</span>
                    </div>
                    <div className="stat-item">
                      <Users size={16} />
                      <span>10K+ students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && isEnrolled && (
          <div className="progress-section">
            <div className="progress-overview">
              <h3 className="section-title">Your Progress</h3>
              <div className="progress-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{progressPercent}%</span>
                    <span className="stat-label">Complete</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{completedTopics}/{totalTopics}</span>
                    <span className="stat-label">Modules</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Trophy size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">0/1</span>
                    <span className="stat-label">Certificates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernCourseDetail;
