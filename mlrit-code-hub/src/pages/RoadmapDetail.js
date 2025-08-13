import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, BookOpen, CheckCircle, Circle, Users } from 'lucide-react';
import './RoadmapDetail.css';

// Simple Button component
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        
        // Mock roadmap data - replace with actual API call
        const roadmapData = {
          id: parseInt(id),
          title: "Full Stack Web Development",
          description: "Master HTML, CSS, JavaScript, and modern frameworks to become a full-stack developer",
          image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
          duration: "24 hours",
          difficulty: "Intermediate",
          courses: 6,
          progress: 33,
          tags: ["Web Development", "JavaScript", "React", "Node.js"],
          steps: [
            {
              id: 1,
              title: "HTML Basics",
              description: "Learn HTML structure and semantics",
              duration: "2 hours",
              difficulty: "Beginner",
              type: "course",
              courseId: "html-basics-101"
            },
            {
              id: 2,
              title: "CSS Styling",
              description: "Master CSS layouts and styling techniques",
              duration: "3 hours",
              difficulty: "Beginner",
              type: "course",
              courseId: "css-styling-101"
            },
            {
              id: 3,
              title: "JavaScript Fundamentals",
              description: "Learn JavaScript programming concepts",
              duration: "4 hours",
              difficulty: "Intermediate",
              type: "course",
              courseId: "js-fundamentals-101"
            },
            {
              id: 4,
              title: "React Framework",
              description: "Build modern web applications with React",
              duration: "6 hours",
              difficulty: "Advanced",
              type: "course",
              courseId: "react-framework-101"
            },
            {
              id: 5,
              title: "Node.js Backend",
              description: "Create server-side applications",
              duration: "5 hours",
              difficulty: "Advanced",
              type: "course",
              courseId: "nodejs-backend-101"
            },
            {
              id: 6,
              title: "Database Design",
              description: "Learn database concepts and SQL",
              duration: "4 hours",
              difficulty: "Intermediate",
              type: "course",
              courseId: "database-design-101"
            }
          ]
        };

        setRoadmap(roadmapData);

        // Load progress from localStorage
        const savedProgress = localStorage.getItem(`roadmap-${id}-progress`);
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          setCompletedSteps(progressData.completedSteps || []);
          setCurrentStep(progressData.currentStep || 0);
        }

      } catch (err) {
        console.error('Error loading roadmap:', err);
        setError(err.response?.data?.message || 'Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [id]);

  useEffect(() => {
    if (roadmap) {
      const progressPercentage = (completedSteps.length / roadmap.steps.length) * 100;
      setProgress(progressPercentage);
      
      // Save progress to localStorage
      localStorage.setItem(`roadmap-${id}-progress`, JSON.stringify({
        completedSteps,
        currentStep,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [completedSteps, currentStep, roadmap, id]);

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
      
      // Move to next step if available
      const stepIndex = roadmap.steps.findIndex(step => step.id === stepId);
      if (stepIndex < roadmap.steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
  };

  const startStep = (step) => {
    if (step.type === 'course') {
      navigate(`/courses/${step.courseId}`);
    } else if (step.type === 'test') {
      navigate(`/skill-test/${step.testId}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
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
          <p className="mt-4 text-gray-600">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
                <p className="text-gray-600 mt-2">{roadmap.description}</p>
              </div>
              <Button
                onClick={() => navigate('/catalog')}
                variant="outline"
              >
                Back to Catalog
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{completedSteps.length} of {roadmap.steps.length} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Learning Path</h2>
            <p className="text-gray-600 mt-1">Follow the steps below to complete your learning journey</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {roadmap.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep;
              const isAccessible = index <= currentStep || isCompleted;
              
              return (
                <div 
                  key={step.id}
                  className={`p-6 transition-all duration-300 ${
                    isCurrent ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step Number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isAccessible 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-medium transition-colors duration-300 ${
                          isCompleted ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">
                            ⏱ {step.duration}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-gray-600 mb-4 transition-colors duration-300 ${
                        isCompleted ? 'text-green-600' : ''
                      }`}>
                        {step.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <div className="flex items-center text-green-600">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : isAccessible ? (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => startStep(step)}
                              size="sm"
                            >
                              Start Lesson
                            </Button>
                            <Button
                              onClick={() => markStepComplete(step.id)}
                              variant="outline"
                              size="sm"
                            >
                              Mark Complete
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Complete previous steps first</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < roadmap.steps.length - 1 && (
                    <div className={`ml-5 mt-4 w-0.5 h-8 transition-colors duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Message */}
        {completedSteps.length === roadmap.steps.length && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p className="text-green-100 mb-4">
              You've completed the entire roadmap. You're now ready for advanced challenges!
            </p>
            <Button
              onClick={() => navigate('/catalog')}
              variant="outline"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              Explore More Roadmaps
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDetail; 