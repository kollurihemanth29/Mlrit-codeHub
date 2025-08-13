import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Grid, List, Play, Star, Clock, Users, ChevronDown } from 'lucide-react';
import './CourseCatalog.css';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: [],
    topics: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roadmaps, setRoadmaps] = useState([]);

  const token = localStorage.getItem('token');

  // Categories data matching the reference image
  const categories = [
    { id: "all", name: "All Courses", count: 12, icon: "📚" },
    { id: "roadmaps", name: "Roadmaps", count: 5, icon: "🗺️" },
    { id: "skillTests", name: "Skill Tests", count: 8, icon: "📝" }
  ];

  // Topics data
  const topics = [
    "JavaScript", "Programming", "Web Development", "React", "Frontend", 
    "Components", "State Management", "DSA", "Algorithms", "Problem Solving",
    "Interview Prep", "Full Stack", "Backend", "TypeScript", "CSS", 
    "Assessment", "Advanced"
  ];

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  // Mock courses data matching the reference image layout
  const mockCourses = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      difficulty: "Beginner",
      rating: 4.8,
      progress: 65,
      duration: "4 weeks",
      students: "1,250",
      description: "Master the basics of JavaScript programming with hands-on exercises and real-world examples.",
      tags: ["JavaScript", "Programming", "Web Development"],
      status: "continue"
    },
    {
      id: 2,
      title: "React Development Mastery",
      difficulty: "Intermediate",
      rating: 4.9,
      progress: 30,
      duration: "6 weeks",
      students: "890",
      description: "Build modern web applications using React.js with hooks, state management, and best practices.",
      tags: ["React", "Frontend", "Components", "+1"],
      status: "continue"
    },
    {
      id: 3,
      title: "Data Structures & Algorithms",
      difficulty: "Advanced",
      rating: 4.7,
      progress: 0,
      duration: "8 weeks",
      students: "650",
      description: "Master essential data structures and algorithms for technical interviews and efficient programming.",
      tags: ["DSA", "Algorithms", "Problem Solving", "+1"],
      status: "start"
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Use real backend data
        const response = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform backend data to match our format
        const transformedCourses = response.data.map(course => ({
          id: course._id,
          title: course.title,
          difficulty: course.difficulty === 'Easy' ? 'Beginner' : 
                    course.difficulty === 'Medium' ? 'Intermediate' : 'Advanced',
          rating: 4.8, // Mock rating for now
          progress: Math.floor(Math.random() * 100), // Mock progress for now
          duration: course.duration || "2-3 hours",
          students: course.enrolledCount ? course.enrolledCount.toString() : "100",
          description: course.description,
          tags: course.title.toLowerCase().includes('javascript') ? ["JavaScript", "Programming", "Web Development"] :
                course.title.toLowerCase().includes('react') ? ["React", "Frontend", "Components", "+1"] :
                course.title.toLowerCase().includes('data') ? ["DSA", "Algorithms", "Problem Solving", "+1"] :
                ["Programming", "Web Development"],
          status: course.enrolledUsers?.includes(localStorage.getItem('userId')) ? "continue" : "start"
        }));
        
        setCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
        
        // Update "All Courses" count
        categories[0].count = transformedCourses.length;
      } catch (err) {
        console.error('Error fetching courses:', err);
        // Fallback to mock data if backend is not available
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
        categories[0].count = mockCourses.length;
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // Fetch roadmaps from backend
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/roadmaps", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform roadmap data to match frontend format
        const transformedRoadmaps = response.data.map(roadmap => ({
          id: roadmap._id,
          title: roadmap.title,
          description: roadmap.description,
          courses: roadmap.courses.length,
          difficulty: roadmap.courses.length > 0 ? roadmap.courses[0].difficulty : 'Intermediate',
          duration: `${roadmap.courses.reduce((total, course) => {
            const hours = parseInt(course.duration?.split(' ')[0] || '2');
            return total + hours;
          }, 0)} hours`,
          progress: 0, // TODO: Calculate based on user progress
          completedCourses: 0,
          remainingCourses: roadmap.courses.length,
          tags: [...new Set(roadmap.courses.flatMap(course => course.tags || []))],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          courseList: roadmap.courses
        }));
        
        setRoadmaps(transformedRoadmaps);
      } catch (err) {
        console.error('Error fetching roadmaps:', err);
        // Fallback to mock data if API fails
        setRoadmaps([
          {
            id: 1,
            title: "Full Stack Web Development",
            description: "Complete roadmap to become a full-stack web developer from scratch.",
            difficulty: "Beginner",
            duration: "3 months",
            courses: 3,
            progress: 35,
            completedCourses: 0,
            remainingCourses: 3,
            tags: ["JavaScript", "React", "Node.js", "MongoDB"],
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            courseList: []
          }
        ]);
      }
    };

    if (token) {
      fetchRoadmaps();
    }
  }, [token]);

  // Filter courses based on search, category, difficulty, and topics
  useEffect(() => {
    if (selectedCategory === "roadmaps") {
      // For roadmaps, we don't filter courses but will show roadmap cards instead
      setFilteredCourses([]);
      return;
    }

    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory === "skillTests") {
      // Filter for skill tests if needed
      filtered = filtered.filter(course => 
        course.tags.some(tag => tag.toLowerCase().includes('test') || tag.toLowerCase().includes('assessment'))
      );
    }

    // Difficulty filter
    if (selectedFilters.difficulty.length > 0) {
      filtered = filtered.filter(course =>
        selectedFilters.difficulty.includes(course.difficulty)
      );
    }

    // Topics filter (simplified - you can expand this based on your data)
    if (selectedFilters.topics.length > 0) {
      filtered = filtered.filter(course =>
        selectedFilters.topics.some(topic =>
          course.title.toLowerCase().includes(topic.toLowerCase()) ||
          course.description.toLowerCase().includes(topic.toLowerCase()) ||
          course.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
        )
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedFilters]);

  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedFilters({ difficulty: [], topics: [] });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'difficulty-beginner';
      case 'Intermediate':
        return 'difficulty-intermediate';
      case 'Advanced':
        return 'difficulty-advanced';
      default:
        return 'difficulty-beginner';
    }
  };

  const getProgressBarColor = (difficulty) => {
    return 'progress-fill';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-container">
      <div className="template-layout">
        {/* Left Sidebar - Exact Template Match */}
        <div className="template-sidebar">
          {/* Categories Section */}
          <div className="categories-section">
            <div className="categories-header">
              <ChevronDown className="dropdown-icon" />
              <h2 className="categories-title">Categories</h2>
            </div>
            <div className="categories-list">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item-template ${
                    selectedCategory === category.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="category-content">
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <span className="category-count-template">{category.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="filter-section-template">
            <h3 className="filter-title">Difficulty Level</h3>
            <div className="filter-options">
              {difficultyLevels.map((level) => (
                <label key={level} className="checkbox-item">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={selectedFilters.difficulty.includes(level)}
                    onChange={() => toggleFilter('difficulty', level)}
                  />
                  <span className="checkbox-label">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="filter-section-template">
            <h3 className="filter-title">Topics</h3>
            <div className="topics-grid">
              {topics.slice(0, 17).map((topic) => (
                <button
                  key={topic}
                  className={`topic-tag ${
                    selectedFilters.topics.includes(topic) ? 'selected' : ''
                  }`}
                  onClick={() => toggleFilter('topics', topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button className="clear-filters-template" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>

        {/* Right Content Area - Exact Template Match */}
        <div className="template-main">
          {/* Header */}
          <div className="main-header">
            <h1 className="page-title">All Courses</h1>
            <p className="page-subtitle">Explore our comprehensive course catalog and start your learning journey.</p>
          </div>

          {/* Search and View Controls */}
          <div className="controls-bar">
            <div className="search-wrapper">
              <Search className="search-icon-template" />
              <input
                type="text"
                placeholder="Search courses..."
                className="search-input-template"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="view-icon" />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="view-icon" />
              </button>
            </div>
          </div>

          <p className="results-count">
            {selectedCategory === 'roadmaps' ? roadmaps.length : filteredCourses.length} results found
          </p>

          {/* Course Cards Grid - Template Layout */}
          <div className="courses-grid-template">
            {selectedCategory === 'roadmaps' ? (
              // Roadmap Cards
              roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="roadmap-card-template" onClick={() => navigate(`/roadmaps/${roadmap.id}`)}>
                  {/* Roadmap Header with Gradient */}
                  <div className="roadmap-header" style={{ background: roadmap.gradient }}>
                    <div className="roadmap-badge">
                      <span className={`difficulty-badge-template ${roadmap.difficulty.toLowerCase()}`}>
                        {roadmap.difficulty}
                      </span>
                    </div>
                    <div className="roadmap-meta">
                      <span className="roadmap-duration">📅 {roadmap.duration}</span>
                      <span className="roadmap-courses">📚 {roadmap.courses} courses</span>
                    </div>
                  </div>

                  {/* Roadmap Content */}
                  <div className="roadmap-content">
                    <h3 className="roadmap-title">{roadmap.title}</h3>
                    <p className="roadmap-description">{roadmap.description}</p>

                    {/* Progress Overview */}
                    <div className="roadmap-progress">
                      <div className="progress-header">
                        <span className="progress-label">Progress Overview</span>
                        <span className="progress-percentage">{roadmap.progress}%</span>
                      </div>
                      <div className="progress-bar-roadmap">
                        <div 
                          className="progress-fill-roadmap"
                          style={{ width: `${roadmap.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-stats">
                        <span className="completed">{roadmap.completedCourses} Completed</span>
                        <span className="remaining">{roadmap.remainingCourses} Remaining</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="roadmap-tags">
                      {roadmap.tags.map((tag, index) => (
                        <span key={index} className="roadmap-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button className="roadmap-action-btn">
                      <Play className="play-icon-template" size={16} />
                      Start Learning Path
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Regular Course Cards
              filteredCourses.map((course) => (
                <div key={course.id} className="course-card-template">
                  {/* Course Badge and Rating */}
                  <div className="card-header">
                    <span className={`difficulty-badge-template ${course.difficulty.toLowerCase()}`}>
                      {course.difficulty}
                    </span>
                    <div className="rating-section">
                      <Star className="star-icon-template" fill="#fbbf24" color="#fbbf24" size={16} />
                      <span className="rating-value">{course.rating}</span>
                    </div>
                  </div>

                  {/* Course Title and Description */}
                  <h3 className="course-title-template">{course.title}</h3>
                  <p className="course-desc-template">{course.description}</p>

                  {/* Progress Bar (if applicable) */}
                  {course.progress > 0 && (
                    <div className="progress-section">
                      <div className="progress-info">
                        <span className="progress-label-template">Progress</span>
                        <span className="progress-percent">{course.progress}%</span>
                      </div>
                      <div className="progress-bar-template">
                        <div 
                          className="progress-fill-template"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Course Meta Info */}
                  <div className="course-meta-template">
                    <div className="meta-item-template">
                      <Clock className="meta-icon-template" size={16} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="meta-item-template">
                      <Users className="meta-icon-template" size={16} />
                      <span>{course.students}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="tags-section">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="course-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button 
                    className="course-action-btn"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <Play className="play-icon-template" size={16} />
                    {course.status === 'continue' ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <div className="no-results-template">
              <div className="no-results-icon-template">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="no-results-title-template">No courses found</h3>
              <p className="no-results-text-template">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
