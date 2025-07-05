import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCourse(res.data));
    if (userId) {
      axios.get(`http://localhost:5000/api/courses/${id}/progress?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProgress(res.data || {}));
    }
  }, [id, token, userId]);

  if (!course) return <div className="course-detail-bg">Loading...</div>;

  const totalModules = course.modules.length;
  const completed = progress.completedModules ? progress.completedModules.length : 0;
  const percent = totalModules ? Math.round((completed / totalModules) * 100) : 0;
  const testUnlocked = percent >= (course.testUnlockThreshold || 80);

  return (
    <div className="course-detail-bg">
      <div className="course-detail-card">
        <h2 className="course-detail-title">{course.title}</h2>
        <p className="course-detail-desc">{course.description}</p>
        <div className="course-detail-progress-bar">
          <div className="course-detail-progress" style={{ width: `${percent}%` }}></div>
        </div>
        <div className="course-detail-progress-info">Progress: {completed} / {totalModules} modules ({percent}%)</div>
        <div className="course-detail-modules-title">Modules</div>
        <div className="course-detail-modules-list">
          {course.modules.map((mod, idx) => (
            <div key={idx} className={`course-detail-module-card${progress.completedModules && progress.completedModules.includes(idx) ? ' completed' : ''}`}>
              <div>
                <div className="course-detail-module-title">{mod.title}</div>
                <div className="course-detail-module-desc">{mod.description}</div>
                {mod.hasCode && (
                  <pre className="course-detail-module-code">{mod.codeSnippet}</pre>
                )}
              </div>
              <Button onClick={() => navigate(`/courses/${id}/module/${idx}`)}>
                {progress.completedModules && progress.completedModules.includes(idx) ? 'Review' : 'Start'}
              </Button>
            </div>
          ))}
        </div>
        <div className="course-detail-test-section">
          {testUnlocked ? (
            progress.testAttempt && progress.testAttempt.completed ? (
              <div className="course-detail-test-btn completed">Test Completed: {progress.testAttempt.score} / {progress.testAttempt.total}</div>
            ) : (
              <Button className="course-detail-test-btn" onClick={() => navigate(`/courses/${id}/test`)}>
                Take Test
              </Button>
            )
          ) : (
            <div className="course-detail-test-info">Complete {course.testUnlockThreshold || 80}% modules to unlock test</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 