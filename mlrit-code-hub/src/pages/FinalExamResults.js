import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';
import './FinalExamResults.css';

const FinalExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [showDetailedResults, setShowDetailedResults] = useState(true);

  const { results, score, examData, submissionData } = location.state || {};
  
  // Provide fallback values for missing data
  const safeResults = results || {
    correctCount: 0,
    wrongCount: 0,
    unattemptedCount: 0,
    percentage: 0,
    totalQuestions: 0,
    mcqCorrect: 0,
    codingCorrect: 0,
    mcqAttempted: 0,
    codingAttempted: 0,
    totalAttempted: 0
  };
  
  const safeScore = score || safeResults.percentage || 0;
  const safeExamData = examData || {
    title: 'Final Exam',
    duration: 0,
    totalMarks: 0
  };
  
  const safeSubmissionData = submissionData || {
    timeSpent: 0,
    securityViolations: [],
    autoSubmitted: false,
    proctoringData: { tabSwitchCount: 0 }
  };

  useEffect(() => {
    // Only redirect if completely no data is available
    if (!location.state) {
      console.warn('No exam results data found, redirecting to course page');
      navigate(`/course/${courseId}`);
    }
  }, [location.state, navigate, courseId]);

  if (!location.state) {
    return (
      <div className="final-exam-results">
        <div className="results-header">
          <h1>Loading Results...</h1>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#f44336';
  };

  const getPerformanceRemark = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 50) return 'Below Average';
    return 'Poor';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="final-exam-results">
      <div className="results-header">
        <button 
          className="back-btn"
          onClick={() => navigate(`/course/${courseId}`)}
        >
          <ArrowLeft size={20} />
          Back to Course
        </button>
        <h1>Final Exam Results</h1>
      </div>

      {showDetailedResults && (
        <div className="detailed-results-container">
          <div className="results-summary">
            <div className="score-circle">
              <div 
                className="score-progress"
                style={{
                  background: `conic-gradient(${getScoreColor(safeScore)} ${safeScore * 3.6}deg, #e0e0e0 0deg)`
                }}
              >
                <div className="score-inner">
                  <span className="score-percentage">{safeScore}%</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
            </div>

            <div className="score-breakdown">
              <div className="breakdown-item correct">
                <CheckCircle size={20} />
                <span>Correct: {safeResults.correctCount}</span>
              </div>
              <div className="breakdown-item wrong">
                <XCircle size={20} />
                <span>Wrong: {safeResults.wrongCount}</span>
              </div>
              <div className="breakdown-item unattempted">
                <Clock size={20} />
                <span>Unattempted: {safeResults.unattemptedCount}</span>
              </div>
            </div>
          </div>

          <div className="exam-info">
            <h3>Exam Information</h3>
            <div className="exam-details">
              <div className="detail-item">
                <strong>Exam:</strong> {safeExamData.title}
              </div>
              <div className="detail-item">
                <strong>Duration:</strong> {safeExamData.duration} minutes
              </div>
              <div className="detail-item">
                <strong>Time Spent:</strong> {formatTime(safeSubmissionData.timeSpent)}
              </div>
              <div className="detail-item">
                <strong>Total Questions:</strong> {safeResults.totalQuestions}
              </div>
              <div className="detail-item">
                <strong>Attempted on:</strong> {new Date().toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className="performance-summary">
            <h3>Performance Summary</h3>
            <div className="summary-table">
              <div className="summary-row header">
                <span>Question Type</span>
                <span>Attempted</span>
                <span>Correct</span>
                <span>Accuracy</span>
                <span>Remarks</span>
              </div>
              
              <div className="summary-row">
                <span>MCQ Questions</span>
                <span>{safeResults.mcqAttempted}</span>
                <span>{safeResults.mcqCorrect}</span>
                <span>{safeResults.mcqAttempted > 0 ? Math.round((safeResults.mcqCorrect / safeResults.mcqAttempted) * 100) : 0}%</span>
                <span className={`remark ${getPerformanceRemark(safeResults.mcqAttempted > 0 ? (safeResults.mcqCorrect / safeResults.mcqAttempted) * 100 : 0).toLowerCase().replace(' ', '-')}`}>
                  {getPerformanceRemark(safeResults.mcqAttempted > 0 ? (safeResults.mcqCorrect / safeResults.mcqAttempted) * 100 : 0)}
                </span>
              </div>

              <div className="summary-row">
                <span>Coding Questions</span>
                <span>{safeResults.codingAttempted}</span>
                <span>{safeResults.codingCorrect}</span>
                <span>{safeResults.codingAttempted > 0 ? Math.round((safeResults.codingCorrect / safeResults.codingAttempted) * 100) : 0}%</span>
                <span className={`remark ${getPerformanceRemark(safeResults.codingAttempted > 0 ? (safeResults.codingCorrect / safeResults.codingAttempted) * 100 : 0).toLowerCase().replace(' ', '-')}`}>
                  {getPerformanceRemark(safeResults.codingAttempted > 0 ? (safeResults.codingCorrect / safeResults.codingAttempted) * 100 : 0)}
                </span>
              </div>

              <div className="summary-row total">
                <span><strong>Overall</strong></span>
                <span><strong>{safeResults.totalAttempted}</strong></span>
                <span><strong>{safeResults.correctCount}</strong></span>
                <span><strong>{safeScore}%</strong></span>
                <span className={`remark ${getPerformanceRemark(safeScore).toLowerCase().replace(' ', '-')}`}>
                  <strong>{getPerformanceRemark(safeScore)}</strong>
                </span>
              </div>
            </div>
          </div>

          {safeSubmissionData.securityViolations?.length > 0 && (
            <div className="security-summary">
              <h3><Shield size={20} /> Security Report</h3>
              <div className="security-details">
                <div className="security-item">
                  <strong>Tab Switches:</strong> {safeSubmissionData.proctoringData?.tabSwitchCount || 0}
                </div>
                <div className="security-item">
                  <strong>Total Violations:</strong> {safeSubmissionData.securityViolations.length}
                </div>
                <div className="security-item">
                  <strong>Auto Submitted:</strong> {safeSubmissionData.autoSubmitted ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="back-to-course-btn"
              onClick={() => navigate(`/course/${courseId}`)}
            >
              <ArrowLeft size={20} />
              Back to Course
            </button>
            
            <button 
              className="review-assessment-btn"
              onClick={() => setShowDetailedResults(false)}
            >
              📋 Review Assessment
            </button>
          </div>
        </div>
      )}

      {!showDetailedResults && (
        <div className="review-container">
          <div className="review-header">
            <h2>Assessment Review</h2>
            <button 
              className="back-to-results-btn"
              onClick={() => setShowDetailedResults(true)}
            >
              Back to Results
            </button>
          </div>
          
          <div className="review-content">
            <p>Detailed question review will be available here.</p>
            <p>This feature shows individual question analysis and explanations.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalExamResults;
