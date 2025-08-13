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
  BarChart3
} from "lucide-react";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResponse = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);
        
        // Check if user is enrolled
        const enrolledResponse = await axios.get(`http://localhost:5000/api/courses/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const enrolled = (enrolledResponse.data?.courses || []).some(c => c._id === id || c.id === id);
        setIsEnrolled(enrolled);
        
        // Fetch progress if enrolled
        if (enrolled && userId) {
          const progressResponse = await axios.get(`http://localhost:5000/api/progress?userId=${userId}&courseId=${id}`, {
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
  }, [id, token, userId]);

  // Refresh only progress
  const reloadProgress = async () => {
    try {
      const progRes = await axios.get(`http://localhost:5000/api/progress`, {
        params: { userId, courseId: id },
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(progRes.data || {});
    } catch (e) {
      console.error('Error refreshing progress:', e);
    }
  };

  // Start (mark as started) a lesson and navigate to the lesson viewer
  const startLesson = async (topic, lesson) => {
    try {
      await axios.post(`http://localhost:5000/api/progress/lesson`, {
        userId,
        courseId: id,
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
      // Navigate to lesson viewer
      navigate(`/courses/${id}/topic/${topic?._id}/lesson/${lesson?._id}`);
    } catch (error) {
      console.error('Error starting lesson:', error.response?.status, error.response?.data || error.message);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/enroll`, {}, {
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
      // mark as started then navigate
      startLesson(topic, firstLesson);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <h2>Course not found</h2>
        <button onClick={() => navigate('/courses')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Courses
        </button>
      </div>
    );
  }

  const totalTopics = (course.topics || []).length;
  const p = /** @type {any} */ (progress) || {};
  const completedTopics = (p.topicsProgress || []).filter(t => t.completed).length;
  const progressPercent = typeof p.overallProgress === 'number'
    ? p.overallProgress
    : (totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0);
  const testUnlocked = progressPercent >= (course.testUnlockThreshold || 80);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="course-detail-container">
      {/* Header */}
      <div className="course-detail-header">
        <button onClick={() => navigate('/courses')} className="back-button">
          <ArrowLeft size={20} />
          Back to Courses
        </button>
        
        <div className="course-header-content">
          <div className="course-header-left">
            <div className="course-badges">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
              >
                {course.difficulty}
              </span>
              <span className="course-type-badge">Course</span>
            </div>
            
            <h1 className="course-title">{course.title}</h1>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>{course.duration || '2-3 hours'}</span>
              </div>
              <div className="meta-item">
                <Users size={16} />
                <span>{course.enrolledCount || 0} students</span>
              </div>
              <div className="meta-item">
                <BookOpen size={16} />
                <span>{totalTopics} topics</span>
              </div>
              <div className="meta-item">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span>4.8 (1,234 reviews)</span>
              </div>
            </div>
            
            {isEnrolled && (
              <div className="progress-section">
                <div className="progress-header">
                  <span>Your Progress</span>
                  <span className="progress-text">{completedTopics}/{totalTopics} topics ({progressPercent}%)</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="course-header-right">
            <div className="course-action-card">
              {!isEnrolled ? (
                <>
                  <div className="price-section">
                    <span className="price">Free</span>
                  </div>
                  <button onClick={handleEnroll} className="enroll-btn">
                    <Play size={20} />
                    Enroll Now
                  </button>
                </>
              ) : (
                <>
                  <div className="enrolled-status">
                    <CheckCircle size={20} color="#10b981" />
                    <span>Enrolled</span>
                  </div>
                  <button 
                    onClick={() => startTopic(0)} 
                    className="continue-btn"
                  >
                    <Play size={20} />
                    {progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </>
              )}
              
              <div className="course-includes">
                <h4>This course includes:</h4>
                <ul>
                  <li><FileText size={16} /> {totalTopics} interactive topics</li>
                  <li><Code size={16} /> Hands-on coding exercises</li>
                  <li><Award size={16} /> Certificate of completion</li>
                  <li><Target size={16} /> Final assessment test</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="course-nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          Curriculum
        </button>
        <button 
          className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        {isEnrolled && (
          <button 
            className={`nav-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="course-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-main">
              <section className="course-section">
                <h3>What you'll learn</h3>
                <div className="learning-objectives">
                  <div className="objective-item">
                    <CheckCircle size={16} color="#10b981" />
                    <span>Master the fundamentals of {course.title.toLowerCase()}</span>
                  </div>
                  <div className="objective-item">
                    <CheckCircle size={16} color="#10b981" />
                    <span>Build practical projects and applications</span>
                  </div>
                  <div className="objective-item">
                    <CheckCircle size={16} color="#10b981" />
                    <span>Understand best practices and industry standards</span>
                  </div>
                  <div className="objective-item">
                    <CheckCircle size={16} color="#10b981" />
                    <span>Prepare for technical interviews and assessments</span>
                  </div>
                </div>
              </section>
              
              <section className="course-section">
                <h3>Prerequisites</h3>
                <div className="prerequisites">
                  <div className="prerequisite-item">
                    <Target size={16} />
                    <span>Basic understanding of programming concepts</span>
                  </div>
                  <div className="prerequisite-item">
                    <Target size={16} />
                    <span>Familiarity with web development basics</span>
                  </div>
                  <div className="prerequisite-item">
                    <Target size={16} />
                    <span>Access to a computer with internet connection</span>
                  </div>
                </div>
              </section>
              
              <section className="course-section">
                <h3>Course Description</h3>
                <div className="course-description-full">
                  <p>{course.description}</p>
                  <p>
                    This comprehensive course is designed to take you from beginner to advanced level 
                    through hands-on exercises, real-world projects, and interactive learning modules. 
                    You'll gain practical experience and build a strong foundation that will serve you 
                    throughout your development career.
                  </p>
                </div>
              </section>
            </div>
            
            <div className="overview-sidebar">
              <div className="instructor-card">
                <h4>Instructor</h4>
                <div className="instructor-info">
                  <div className="instructor-avatar">
                    <span>AI</span>
                  </div>
                  <div className="instructor-details">
                    <h5>AI Learning Assistant</h5>
                    <p>Expert in modern web development</p>
                    <div className="instructor-stats">
                      <span>⭐ 4.9 rating</span>
                      <span>👥 10,000+ students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'curriculum' && (
          <div className="curriculum-content">
            <div className="curriculum-header">
              <h3>Course Curriculum</h3>
              <p>{totalTopics} topics • {course.duration || '2-3 hours'} total length</p>
            </div>
            
            <div className="modules-list">
              {(course.topics || []).map((topic, topicIndex) => {
                const tProg = ((p.topicsProgress || [])).find(tp => (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id));
                const isTopicCompleted = tProg?.completed || false;
                const topicCompletionPercentage = tProg?.completionPercentage || 0;
                const isLocked = !isEnrolled;
                
                return (
                  <div key={topicIndex} className={`module-item ${isTopicCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                    <div className="module-header">
                      <div className="module-status">
                        {isLocked ? (
                          <Lock size={20} color="#9ca3af" />
                        ) : isTopicCompleted ? (
                          <CheckCircle size={20} color="#10b981" />
                        ) : (
                          <div className="module-number">{topicIndex + 1}</div>
                        )}
                      </div>
                      
                      <div className="module-info">
                        <h4 className="module-title">{topic.title}</h4>
                        <p className="module-description">{topic.description}</p>
                        <div className="module-meta">
                          <span className="module-type">
                            <BookOpen size={14} /> {(topic.lessons || []).length} lessons
                          </span>
                          <span className="module-duration">{topic.duration || '5-10 min'}</span>
                          {topicCompletionPercentage > 0 && (
                            <span className="module-progress-text">{topicCompletionPercentage}% complete</span>
                          )}
                        </div>
                        {topicCompletionPercentage > 0 && (
                          <div className="module-progress-bar">
                            <div 
                              className="module-progress-fill" 
                              style={{ width: `${topicCompletionPercentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="module-actions">
                        {!isLocked && (
                          <button 
                            onClick={() => startTopic(topicIndex)} 
                            className="module-action-btn"
                          >
                            {isTopicCompleted ? 'Review' : topicCompletionPercentage > 0 ? 'Continue' : 'Start'}
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Lessons List */}
                    {(topic.lessons || []).length > 0 && (
                      <div className="topics-list">
                        {(topic.lessons || []).map((lesson, lIndex) => {
                          const getTopicIcon = (type) => {
                            switch (type) {
                              case 'mcq': return <Target size={16} />;
                              case 'code': return <Code size={16} />;
                              case 'theory': return <FileText size={16} />;
                              default: return <FileText size={16} />;
                            }
                          };
                          const isLessonCompleted = !!(tProg?.lessons || []).find(l => (l.lessonId?.toString?.() || l.lessonId) === (lesson._id?.toString?.() || lesson._id))?.completed;
                          return (
                            <div 
                              key={lIndex} 
                              className={`topic-item ${isLessonCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                            >
                              <div className="topic-status">
                                {isLocked ? (
                                  <Lock size={16} color="#9ca3af" />
                                ) : isLessonCompleted ? (
                                  <CheckCircle size={16} color="#10b981" />
                                ) : (
                                  <div className="topic-icon">
                                    {getTopicIcon(lesson.type)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="topic-info">
                                <div className="topic-header">
                                  <h5 className="topic-title">
                                    {!isLocked ? (
                                      <button
                                        className="topic-link"
                                        onClick={() => startLesson(topic, lesson)}
                                      >
                                        {lesson.title}
                                      </button>
                                    ) : (
                                      lesson.title
                                    )}
                                  </h5>
                                  <span className="topic-type-badge">
                                    {lesson.type}
                                  </span>
                                </div>
                                {lesson.description && (
                                  <p className="topic-description">{lesson.description}</p>
                                )}
                                <div className="topic-meta">
                                  <span className="topic-duration">{lesson.duration || '5-10 min'}</span>
                                  {isLessonCompleted && (
                                    <span className="completion-status">✓ Completed</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="topic-actions">
                                {!isLocked && (
                                  <button 
                                    onClick={() => startLesson(topic, lesson)}
                                    className="topic-action-btn"
                                  >
                                    {isLessonCompleted ? 'Review' : 'Start'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Final Test Section */}
            <div className={`test-section ${testUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="test-header">
                <div className="test-status">
                  {!testUnlocked ? (
                    <Lock size={20} color="#9ca3af" />
                  ) : (p.testAttempt && p.testAttempt.completed) ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <Award size={20} color="#f59e0b" />
                  )}
                </div>
                
                <div className="test-info">
                  <h4>Final Assessment</h4>
                  <p>Test your knowledge with a comprehensive quiz</p>
                  {!testUnlocked && (
                    <p className="unlock-requirement">
                      Reach {course.testUnlockThreshold || 80}% overall progress to unlock
                    </p>
                  )}
                  {p.testAttempt && p.testAttempt.completed && (
                    <p className="test-score">
                      Score: {p.testAttempt.score}/{p.testAttempt.totalMarks || p.testAttempt.total} 
                      ({(() => {
                        const total = (p.testAttempt.totalMarks || p.testAttempt.total || 0);
                        return total > 0 ? Math.round((p.testAttempt.score / total) * 100) : 0;
                      })()}%)
                    </p>
                  )}
                </div>
                
                <div className="test-actions">
                  {testUnlocked && (!p.testAttempt || !p.testAttempt.completed) && (
                    <button 
                      onClick={() => navigate(`/courses/${id}/test`)}
                      className="test-action-btn"
                    >
                      Take Test
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="reviews-content">
            <div className="reviews-header">
              <h3>Student Reviews</h3>
              <div className="rating-summary">
                <div className="overall-rating">
                  <span className="rating-number">4.8</span>
                  <div className="stars">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={16} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <span className="rating-count">(1,234 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="reviews-list">
              {/* Mock reviews */}
              {[
                { name: "Sarah Johnson", rating: 5, comment: "Excellent course! Very well structured and easy to follow.", date: "2 weeks ago" },
                { name: "Mike Chen", rating: 5, comment: "Great practical examples and hands-on exercises.", date: "1 month ago" },
                { name: "Emily Davis", rating: 4, comment: "Good content, could use more advanced topics.", date: "1 month ago" }
              ].map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">{review.name[0]}</div>
                      <div className="reviewer-details">
                        <h5>{review.name}</h5>
                        <div className="review-rating">
                          {[1,2,3,4,5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              fill={star <= review.rating ? "#fbbf24" : "none"} 
                              color="#fbbf24" 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && isEnrolled && (
          <div className="progress-content">
            <div className="progress-header">
              <h3>Your Learning Progress</h3>
              <div className="progress-stats">
                <div className="stat-item">
                  <BarChart3 size={24} color="#3b82f6" />
                  <div className="stat-info">
                    <span className="stat-value">{progressPercent}%</span>
                    <span className="stat-label">Complete</span>
                  </div>
                </div>
                <div className="stat-item">
                  <BookOpen size={24} color="#10b981" />
                  <div className="stat-info">
                    <span className="stat-value">{completedTopics}/{totalTopics}</span>
                    <span className="stat-label">Topics</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Award size={24} color="#f59e0b" />
                  <div className="stat-info">
                    <span className="stat-value">{testUnlocked ? '1' : '0'}/1</span>
                    <span className="stat-label">Tests</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="progress-timeline">
              <h4>Learning Timeline</h4>
              <div className="timeline">
                {(course.topics || []).map((topic, index) => {
                  const isCompleted = !!((p.topicsProgress || []).find(tp => (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id))?.completed);
                  return (
                    <div key={index} className={`timeline-item ${isCompleted ? 'completed' : ''}`}>
                      <div className="timeline-marker">
                        {isCompleted ? (
                          <CheckCircle size={16} color="#10b981" />
                        ) : (
                          <div className="timeline-dot"></div>
                        )}
                      </div>
                      <div className="timeline-content">
                        <h5>{topic.title}</h5>
                        <p>{topic.description}</p>
                        {isCompleted && <span className="completion-badge">Completed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;