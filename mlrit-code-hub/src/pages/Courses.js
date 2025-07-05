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
  const [progress, setProgress] = useState({});
  const [expandedModule, setExpandedModule] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  let userRole = null;
  try {
    userRole = token ? jwtDecode(token)["role"] : null;
  } catch {}

  useEffect(() => {
    axios.get("http://localhost:5000/api/courses", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setCourses(res.data);
      });
  }, [token]);

  useEffect(() => {
    if (userRole === 'student' && userId) {
      courses.forEach(course => {
        axios.get(`http://localhost:5000/api/courses/${course._id}/progress?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => setProgress(prev => ({ ...prev, [course._id]: res.data })))
          .catch(() => {});
      });
    } else if (userRole === 'student' && !userId) {
      console.warn('User ID is missing. Progress will not be loaded.');
    }
  }, [courses, token, userId, userRole]);

  // Dashboard stats
  const totalCourses = courses.length;
  let totalModulesCompleted = 0;
  let totalTestsUnlocked = 0;
  courses.forEach(c => {
    const prog = progress[c._id] || { completedModules: [] };
    totalModulesCompleted += prog.completedModules ? prog.completedModules.length : 0;
    const percent = c.modules.length ? Math.round(((prog.completedModules ? prog.completedModules.length : 0) / c.modules.length) * 100) : 0;
    if (percent >= (c.testUnlockThreshold || 80)) totalTestsUnlocked++;
  });

  const handleResume = (course, prog) => {
    const nextIdx = course.modules.findIndex((_, idx) => !prog.completedModules || !prog.completedModules.includes(idx));
    if (nextIdx !== -1) navigate(`/courses/${course._id}/module/${nextIdx}`);
    else navigate(`/courses/${course._id}`);
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
            {courses.map(c => {
              const prog = progress[c._id] || { completedModules: [], testAttempt: { completed: false } };
              const totalModules = c.modules.length;
              const completed = prog.completedModules ? prog.completedModules.length : 0;
              const percent = totalModules ? Math.round((completed / totalModules) * 100) : 0;
              const testUnlocked = percent >= (c.testUnlockThreshold || 80);
              const isCompleted = completed === totalModules;
              return (
                <div key={c._id} className="course-card">
                  <div className="course-card-header">
                    <span className="course-card-title">{c.title}</span>
                    <span className={levelClass[c.level] || 'course-card-badge'}>{c.level}</span>
                    {isCompleted && <span className="course-card-badge" style={{ background: '#22c55e' }}>🏅 Completed</span>}
                  </div>
                  <div className="course-card-desc">{c.description}</div>
                  <div className="course-card-meta">
                    <span>⏱ {c.duration}</span>
                    <span>👥 {c.enrolledCount} students</span>
                    <span>📚 {c.modules.length} modules</span>
                  </div>
                  <div className="course-card-progress-label">Progress</div>
                  <div className="course-card-progress-bar">
                    <div className="course-card-progress" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="course-card-progress-info">{completed}/{totalModules} modules</div>
                  <div className="course-card-progress-info">{percent}% complete</div>
                  <div className="course-card-stepper">
                    {c.modules.slice(0, 5).map((mod, idx) => (
                      <React.Fragment key={idx}>
                        <div className="course-card-step">
                          <div className={`course-card-step-circle${(prog.completedModules && prog.completedModules.includes(idx)) ? ' completed' : ''}`} onClick={() => setExpandedModule({ ...expandedModule, [c._id]: idx })} style={{ cursor: 'pointer' }}>
                            {(prog.completedModules && prog.completedModules.includes(idx)) ? '✓' : idx + 1}
                          </div>
                          <div className="course-card-step-label" title={mod.title}>{mod.title}</div>
                          {expandedModule[c._id] === idx && (
                            <div className="course-card-step-label" style={{ background: '#f7f9fb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginTop: 4, zIndex: 10, position: 'absolute', left: 0, minWidth: 180 }}>
                              <div style={{ fontWeight: 600 }}>{mod.title}</div>
                              <div style={{ color: '#a78bfa', fontSize: 13 }}>{mod.description}</div>
                              {mod.hasCode && <pre style={{ background: '#23234a', color: '#a78bfa', borderRadius: 6, padding: 6, marginTop: 4 }}>{mod.codeSnippet}</pre>}
                              <Button style={{ marginTop: 6 }} onClick={() => navigate(`/courses/${c._id}/module/${idx}`)}>Go to Module</Button>
                              <Button style={{ marginTop: 6, marginLeft: 8 }} onClick={() => setExpandedModule({ ...expandedModule, [c._id]: undefined })}>Close</Button>
                            </div>
                          )}
                        </div>
                        {idx < Math.min(4, c.modules.length - 1) && (
                          <div className={`course-card-step-line${(prog.completedModules && prog.completedModules.includes(idx)) ? ' completed' : ''}`}></div>
                        )}
                      </React.Fragment>
                    ))}
                    {c.modules.length > 5 && (
                      <div className="course-card-step-label" style={{ marginLeft: 8, color: '#bdbdfd' }}>...+{c.modules.length - 5} more</div>
                    )}
                  </div>
                  <div className="course-card-actions">
                    <Button className="course-card-btn secondary" onClick={() => handleResume(c, prog)}>
                      {isCompleted ? 'Review Course' : 'Resume'}
                    </Button>
                    {testUnlocked && !prog.testAttempt?.completed && (
                      <Button className="course-card-btn" style={{ background: '#22c55e' }} onClick={() => navigate(`/courses/${c._id}/test`)}>
                        <span role="img" aria-label="trophy">🏆</span> Take Test
                      </Button>
                    )}
                    {testUnlocked && prog.testAttempt?.completed && (
                      <Button className="course-card-btn locked" disabled>
                        <span role="img" aria-label="trophy">🏆</span> Test Completed
                      </Button>
                    )}
                    {!testUnlocked && (
                      <div className="course-card-btn locked flex items-center text-xs gap-1" style={{ background: '#e5e7eb', color: '#bdbdfd' }}><span role="img" aria-label="lock">🔒</span> {c.testUnlockThreshold || 80}% required</div>
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
                <div className="courses-dashboard-value">{totalModulesCompleted}</div>
                <div className="courses-dashboard-label">Modules Completed</div>
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
