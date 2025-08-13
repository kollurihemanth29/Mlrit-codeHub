import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Bell,
  User,
  CheckCircle,
  Star,
  Trophy,
  Target,
  BookOpen,
  Code,
  Play,
  Lock,
  Circle,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import './ModuleDisplayNew.css';

const ModuleDisplayNew = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseResponse.data);
        
        // Fetch user progress
        if (userId) {
          const progressResponse = await axios.get(
            `http://localhost:5000/api/courses/${courseId}/progress?userId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProgress(progressResponse.data || {});
        }
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && token) {
      fetchCourseAndProgress();
    }
  }, [courseId, token, userId]);

  // Helper functions for module progress and status
  const getModuleProgress = (moduleIndex) => {
    if (!progress?.modulesProgress) return { completed: 0, total: 0, percentage: 0 };
    
    const moduleProgress = progress.modulesProgress.find(m => m.moduleIndex === moduleIndex);
    if (!moduleProgress) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = moduleProgress.topicsProgress?.filter(t => t.completed).length || 0;
    const total = course?.modules?.[moduleIndex]?.topics?.length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const getModuleStatus = (moduleIndex) => {
    const moduleProgress = getModuleProgress(moduleIndex);
    if (moduleProgress.percentage === 100) return 'completed';
    if (moduleProgress.percentage > 0) return 'current';
    return 'locked';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson': return <BookOpen className="topic-icon" />;
      case 'coding': return <Code className="topic-icon" />;
      case 'quiz': return <Target className="topic-icon" />;
      case 'test': return <Award className="topic-icon" />;
      case 'reading': return <BookOpen className="topic-icon" />;
      case 'video': return <Play className="topic-icon" />;
      default: return <BookOpen className="topic-icon" />;
    }
  };

  const handleModuleClick = (moduleIndex) => {
    const status = getModuleStatus(moduleIndex);
    if (status !== 'locked') {
      // Find first incomplete topic or start from beginning
      let targetTopicIndex = 0;
      if (status === 'current') {
        const moduleProgress = progress?.modulesProgress?.find(m => m.moduleIndex === moduleIndex);
        if (moduleProgress) {
          const firstIncomplete = course.modules[moduleIndex].topics.findIndex((topic, index) => {
            const topicProgress = moduleProgress.topicsProgress?.find(t => t.topicIndex === index);
            return !topicProgress?.completed;
          });
          targetTopicIndex = firstIncomplete !== -1 ? firstIncomplete : 0;
        }
      }
      navigate(`/courses/${courseId}/module/${moduleIndex}/topic/${targetTopicIndex}`);
    }
  };

  const getOverallStats = () => {
    if (!course?.modules) return { completed: 0, total: 0, points: 0, progress: 0 };
    
    let totalModules = course.modules.length;
    let completedModules = 0;
    let totalPoints = 0;
    
    course.modules.forEach((module, index) => {
      const moduleProgress = getModuleProgress(index);
      if (moduleProgress.percentage === 100) {
        completedModules++;
        totalPoints += 100; // Base points per completed module
      }
    });
    
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    return {
      completed: completedModules,
      total: totalModules,
      points: totalPoints,
      progress: overallProgress
    };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="module-display-container">
      {/* Header */}
      <div className="module-header">
        <div className="module-header-content">
          <div className="flex items-center space-x-4">
            <h1 className="module-title">{course?.title || 'Python Programming'}</h1>
          </div>
          <div className="module-header-actions">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <div className="user-avatar">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Completed</h3>
                <p className="stat-completed">{stats.completed}/{stats.total}</p>
              </div>
              <CheckCircle className="stat-icon stat-completed" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Points Earned</h3>
                <p className="stat-points">{stats.points}</p>
              </div>
              <Star className="stat-icon stat-points" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Progress</h3>
                <p className="stat-progress">{stats.progress}%</p>
              </div>
              <Trophy className="stat-icon stat-progress" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Rank</h3>
                <p className="stat-rank">Beginner</p>
              </div>
              <Target className="stat-icon stat-rank" />
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="modules-section">
          <h2 className="modules-title">Course Modules</h2>
          <div className="modules-grid">
            {course?.modules
              ?.filter(module => 
                module.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              ?.map((module, moduleIndex) => {
                const moduleProgress = getModuleProgress(moduleIndex);
                const moduleStatus = getModuleStatus(moduleIndex);
                
                return (
                  <div
                    key={module._id || moduleIndex}
                    className="module-card"
                  >
                    {/* Module Header */}
                    <div className="module-header-section">
                      <div className="module-number">
                        {moduleIndex + 1}
                      </div>
                      <div className="module-info">
                        <h3 className="module-name">{module.title}</h3>
                        <p className="module-description">
                          {module.description || 'Learn how to make Python print whatever you want, and learn to use it as a basic calculator.'}
                        </p>
                        {moduleProgress.percentage === 100 && (
                          <div className="status-badge status-completed">
                            100% Solved
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Topics List - Exact Reference Style */}
                    <div className="module-topics">
                      <div className="topics-list">
                        {module.topics?.map((topic, topicIndex) => {
                          const topicProgress = progress?.modulesProgress
                            ?.find(m => m.moduleIndex === moduleIndex)
                            ?.topicsProgress?.find(t => t.topicIndex === topicIndex);
                          const isCompleted = topicProgress?.completed || false;
                          const isCurrent = !isCompleted && topicIndex === 0; // First incomplete topic
                          const isLocked = !isCompleted && !isCurrent;
                          
                          return (
                            <div 
                              key={topic._id || topicIndex}
                              className="topic-item"
                              onClick={() => {
                                if (!isLocked) {
                                  navigate(`/courses/${courseId}/module/${moduleIndex}/topic/${topicIndex}`);
                                }
                              }}
                            >
                              <div className={`topic-status-icon ${
                                isCompleted ? 'completed' : 
                                isCurrent ? 'current' : 'locked'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : isCurrent ? (
                                  <Play className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>
                              
                              <div className="topic-content">
                                <h4 className={`topic-title ${
                                  isCompleted ? 'completed' : 
                                  isLocked ? 'locked' : ''
                                }`}>
                                  {topic.title}
                                </h4>
                                
                                <div className={`topic-badge ${
                                  topic.type === 'lesson' ? 'lesson' :
                                  topic.type === 'test' ? 'test' :
                                  topic.type === 'quiz' ? 'quiz' :
                                  topic.type === 'coding' ? 'coding' : 'lesson'
                                }`}>
                                  {topic.type === 'test' ? 'Test' : 'Lesson'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module Progress */}
                    {moduleProgress.total > 0 && (
                      <div className="module-progress">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className="progress-percentage">{moduleProgress.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${moduleProgress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDisplayNew;
