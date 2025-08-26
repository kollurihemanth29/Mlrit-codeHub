import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Courses.css";

const levelClass = {
  Beginner: "course-card-badge beginner",
  Intermediate: "course-card-badge intermediate",
  Advanced: "course-card-badge advanced"
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({}); // { [courseId]: progressDoc }
  const [expandedTopic, setExpandedTopic] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  let userRole = null;
  try {
    userRole = token ? jwtDecode(token)["role"] : null;
  } catch {}

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch(() => setCourses([]));
  }, [token]);

  useEffect(() => {
    if (userRole === 'student' && userId && courses.length) {
      courses.forEach((course) => {
        axios
          .get(
            `http://localhost:5000/api/progress?userId=${userId}&courseId=${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) =>
            setProgress((prev) => ({ ...prev, [course._id]: res.data || {} }))
          )
          .catch(() => {
            // ignore missing progress (not enrolled yet)
          });
      });
    } else if (userRole === 'student' && !userId) {
      console.warn('User ID is missing. Progress will not be loaded.');
    }
  }, [courses, token, userId, userRole]);

  // Dashboard stats (topics-based)
  const totalCourses = courses.length;
  let totalTopicsCompleted = 0;
  let totalTestsUnlocked = 0;
  courses.forEach((c) => {
    const prog = progress[c._id] || {};
    const topics = c.topics || [];
    const completedTopics = (prog.topicsProgress || []).filter((t) => t.completed).length;
    totalTopicsCompleted += completedTopics;
    const percent = typeof prog.overallProgress === 'number'
      ? prog.overallProgress
      : topics.length
        ? Math.round((completedTopics / topics.length) * 100)
        : 0;
    if (percent >= (c.testUnlockThreshold || 80)) totalTestsUnlocked++;
  });

  const handleResume = (course, prog) => {
    // Navigate to course detail; within detail user can continue from last topic/lesson
    navigate(`/courses/${course._id}`);
  };

  return (
    <div className="courses-bg">
      <div className="courses-header">
        <h2 className="courses-title">All Courses</h2>
        <div className="courses-subtitle">Continue your learning journey</div>
      </div>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
          <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="70" y="60" width="100" height="120" rx="12" fill="#EDEDED" stroke="#BDBDFD" strokeWidth="2"/>
            <rect x="110" y="40" width="100" height="120" rx="12" fill="#F5F6FA" stroke="#6366F1" strokeWidth="2"/>
            <rect x="130" y="60" width="60" height="80" rx="8" fill="#EDEDED" stroke="#6366F1" strokeWidth="1.5"/>
            <rect x="150" y="80" width="20" height="40" rx="4" fill="#6366F1"/>
            <rect x="90" y="55" width="40" height="10" rx="2" fill="#6366F1"/>
            <rect x="170" y="35" width="40" height="10" rx="2" fill="#6366F1"/>
          </svg>
          <div className="mt-8 text-xl font-medium text-gray-500">No data found</div>
        </div>
      ) : (
        <>
          <div className="courses-list">
            {courses.map((c) => {
              const prog = progress[c._id] || {};
              const topics = c.topics || [];
              const completedTopics = (prog.topicsProgress || []).filter((t) => t.completed).length;
              const percent = typeof prog.overallProgress === 'number'
                ? prog.overallProgress
                : topics.length
                  ? Math.round((completedTopics / topics.length) * 100)
                  : 0;
              const testUnlocked = percent >= (c.testUnlockThreshold || 80);
              const isCompleted = topics.length > 0 && completedTopics === topics.length;
              return (
                <div key={c._id} className="course-card pro">
                  <div className="course-card-header">
                    <span className="course-card-title">{c.title}</span>
                    <span className={levelClass[c.difficulty] || 'course-card-badge'}>{c.difficulty}</span>
                    {isCompleted && (
                      <span className="course-card-badge" style={{ background: '#22c55e' }}>🏅 Completed</span>
                    )}
                  </div>
                  <div className="course-card-desc">{c.description}</div>
                  <div className="course-card-meta">
                    <span>⏱ {c.duration || '2-3 hours'}</span>
                    <span>👥 {c.enrolledCount || 0} students</span>
                    <span>📚 {topics.length} topics</span>
                  </div>
                  <div className="course-card-progress-label">Progress</div>
                  <div className="course-card-progress-bar">
                    <div className="course-card-progress" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="course-card-progress-info">{completedTopics}/{topics.length} topics</div>
                  <div className="course-card-progress-info">{percent}% complete</div>
                  <div className="course-card-chips">
                    {(topics.slice(0, 6)).map((t, idx) => (
                      <div
                        key={t._id || idx}
                        className={`chip ${ (prog.topicsProgress || []).find(tp => tp.topicId === (t._id?.toString?.() || t._id || t.id))?.completed ? 'completed' : ''}`}
                        title={t.title}
                        onClick={() => setExpandedTopic({ ...expandedTopic, [c._id]: t._id || idx })}
                      >
                        {t.title}
                      </div>
                    ))}
                    {topics.length > 6 && (
                      <div className="chip more">+{topics.length - 6} more</div>
                    )}
                  </div>
                  {expandedTopic[c._id] && (
                    <div className="topic-popover">
                      {(() => {
                        const tIdx = topics.findIndex(t => (t._id || '').toString() === (expandedTopic[c._id] || '').toString());
                        const topic = tIdx >= 0 ? topics[tIdx] : null;
                        return topic ? (
                          <>
                            <div className="topic-popover-title">{topic.title}</div>
                            {topic.description && (
                              <div className="topic-popover-desc">{topic.description}</div>
                            )}
                            <Button style={{ marginTop: 6 }} onClick={() => navigate(`/courses/${c._id}`)}>Open Course</Button>
                            <Button style={{ marginTop: 6, marginLeft: 8 }} onClick={() => setExpandedTopic({ ...expandedTopic, [c._id]: undefined })}>Close</Button>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <div className="course-card-actions">
                    <Button className="course-card-btn secondary" onClick={() => handleResume(c, prog)}>
                      {isCompleted ? 'Review Course' : 'Resume'}
                    </Button>
                    {testUnlocked ? (
                      <div className="course-card-badge" style={{ background: '#22c55e' }}>
                        <span role="img" aria-label="trophy">🏆</span> Test Unlocked
                      </div>
                    ) : (
                      <div className="course-card-btn locked flex items-center text-xs gap-1" style={{ background: '#e5e7eb', color: '#bdbdfd' }}>
                        <span role="img" aria-label="lock">🔒</span> {c.testUnlockThreshold || 80}% required
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="courses-dashboard">
            <div className="courses-dashboard-card">
              <span className="courses-dashboard-icon">📖</span>
              <div>
                <div className="courses-dashboard-value">{totalCourses}</div>
                <div className="courses-dashboard-label">Courses Available</div>
              </div>
            </div>
            <div className="courses-dashboard-card">
              <span className="courses-dashboard-icon" style={{ color: '#22c55e' }}>✅</span>
              <div>
                <div className="courses-dashboard-value">{totalTopicsCompleted}</div>
                <div className="courses-dashboard-label">Topics Completed</div>
              </div>
            </div>
            <div className="courses-dashboard-card">
              <span className="courses-dashboard-icon" style={{ color: '#eab308' }}>🏆</span>
              <div>
                <div className="courses-dashboard-value">{totalTestsUnlocked}</div>
                <div className="courses-dashboard-label">Tests Unlocked</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Courses;