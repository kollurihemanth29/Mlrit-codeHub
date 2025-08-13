import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";

const Catalog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  
  const [roadmaps, setRoadmaps] = useState([]);
  const [skillTests, setSkillTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesResponse.data);

        // Fetch roadmaps (mock data for now)
        const mockRoadmaps = [
          {
            id: 1,
            title: "Web Development Path",
            description: "Master HTML, CSS, JavaScript, and modern frameworks",
            image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
            steps: [
              { title: "HTML Basics", description: "Learn HTML structure and semantics" },
              { title: "CSS Styling", description: "Master CSS layouts and styling" },
              { title: "JavaScript Fundamentals", description: "Learn JavaScript programming" },
              { title: "React Framework", description: "Build modern web applications" }
            ]
          },
          {
            id: 2,
            title: "Data Science Journey",
            description: "From Python basics to machine learning algorithms",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
            steps: [
              { title: "Python Programming", description: "Learn Python fundamentals" },
              { title: "Data Analysis", description: "Master pandas and numpy" },
              { title: "Data Visualization", description: "Create compelling charts and graphs" },
              { title: "Machine Learning", description: "Build predictive models" }
            ]
          },
          {
            id: 3,
            title: "Mobile App Development",
            description: "Create iOS and Android applications",
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
            steps: [
              { title: "React Native", description: "Cross-platform mobile development" },
              { title: "UI/UX Design", description: "Design beautiful mobile interfaces" },
              { title: "State Management", description: "Manage app state effectively" },
              { title: "App Deployment", description: "Publish to app stores" }
            ]
          }
        ];
        setRoadmaps(mockRoadmaps);

        // Fetch skill tests (mock data for now)
        const mockSkillTests = [
          {
            id: 1,
            title: "JavaScript Assessment",
            description: "Test your JavaScript knowledge with 20 questions",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
            duration: "30 minutes",
            questions: 20,
            difficulty: "Intermediate"
          },
          {
            id: 2,
            title: "Python Programming Test",
            description: "Evaluate your Python programming skills",
            image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
            duration: "45 minutes",
            questions: 25,
            difficulty: "Advanced"
          },
          {
            id: 3,
            title: "Web Development Quiz",
            description: "Comprehensive test covering HTML, CSS, and JavaScript",
            image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop",
            duration: "60 minutes",
            questions: 30,
            difficulty: "Beginner"
          }
        ];
        setSkillTests(mockSkillTests);

      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError(err.response?.data?.message || 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleRoadmapClick = (roadmap) => {
    // Navigate to roadmap detail page with steps
    navigate(`/roadmap/${roadmap.id}`, { 
      state: { roadmap } 
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Medium':
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Learning Catalog
            </h1>
            <p className="text-xl text-gray-600 text-center">
              Choose your learning path and start your journey
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "courses", label: "Courses", count: courses.length },
              { id: "roadmaps", label: "Roadmaps", count: roadmaps.length },
              { id: "skillTests", label: "Skill Tests", count: skillTests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Courses Section */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-sm opacity-90">{course.difficulty}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>⏱ {course.duration}</span>
                      <span>📚 {course.modules.length} modules</span>
                      <span>👥 {course.enrolledCount} students</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="w-full"
                    >
                      Start Course
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmaps Section */}
        {activeTab === "roadmaps" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Roadmaps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p className="text-sm opacity-90">{roadmap.steps.length} steps</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {roadmap.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {roadmap.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {roadmap.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                          <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          <span className="line-clamp-1">{step.title}</span>
                        </div>
                      ))}
                      {roadmap.steps.length > 3 && (
                        <div className="text-sm text-gray-400">
                          +{roadmap.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRoadmapClick(roadmap)}
                      className="w-full"
                    >
                      View Roadmap
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Tests Section */}
        {activeTab === "skillTests" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Skill Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillTests.map((test) => (
                <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🧪</div>
                      <p className="text-sm opacity-90">{test.difficulty}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {test.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>⏱ {test.duration}</span>
                      <span>❓ {test.questions} questions</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/skill-test/${test.id}`)}
                      className="w-full"
                    >
                      Start Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog; 