import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminCreateCourse.css";

const AdminCreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("4 weeks");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [modules, setModules] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testUnlockThreshold, setTestUnlockThreshold] = useState(80);
  const navigate = useNavigate();

  const addModule = () => setModules([...modules, { title: "", description: "", hasCode: false, codeSnippet: "" }]);
  const addQuestion = () => setTestQuestions([...testQuestions, { question: "", options: ["", "", "", ""], correct: 0 }]);

  const submitCourse = () => {
    const token = localStorage.getItem('token');
    axios.post(
      "http://localhost:5000/api/courses",
      { title, description, level, duration, enrolledCount, modules, testQuestions, testUnlockThreshold },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        alert("Course Created");
        navigate("/courses");
      });
  };

  return (
    <div className="admin-create-bg">
      <div className="admin-create-card">
        <h2 className="admin-create-title">Create New Course</h2>
        <div className="mb-4">
          <label className="admin-create-label">Course Title</label>
          <input className="admin-create-input" placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="admin-create-label">Course Description</label>
          <textarea className="admin-create-textarea" placeholder="Course Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="admin-create-label">Level</label>
          <select className="admin-create-select" value={level} onChange={e => setLevel(e.target.value)}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <label className="admin-create-label">Duration</label>
          <input className="admin-create-input" placeholder="e.g. 4 weeks" value={duration} onChange={e => setDuration(e.target.value)} />
          <label className="admin-create-label">Enrolled Count</label>
          <input type="number" className="admin-create-input" value={enrolledCount} onChange={e => setEnrolledCount(Number(e.target.value))} />
        </div>
        <div className="mb-6">
          <label className="admin-create-label">Test Unlock Threshold (%)</label>
          <input type="number" className="admin-create-input" style={{ maxWidth: 120 }} value={testUnlockThreshold} onChange={e => setTestUnlockThreshold(Number(e.target.value))} />
        </div>
        <h3 className="admin-create-label" style={{ fontSize: '1.2rem' }}>Modules</h3>
        <div className="admin-create-modules">
          {modules.map((mod, idx) => (
            <div key={idx} className="admin-create-module-card">
              <input className="admin-create-input" placeholder="Module Title" value={mod.title} onChange={(e) => {
                const copy = [...modules];
                copy[idx].title = e.target.value;
                setModules(copy);
              }} />
              <textarea className="admin-create-textarea" placeholder="Description" value={mod.description} onChange={(e) => {
                const copy = [...modules];
                copy[idx].description = e.target.value;
                setModules(copy);
              }} />
              <label className="admin-create-checkbox-label">
                <input type="checkbox" checked={mod.hasCode} onChange={() => {
                  const copy = [...modules];
                  copy[idx].hasCode = !copy[idx].hasCode;
                  setModules(copy);
                }} /> Has Code Example
              </label>
              {mod.hasCode && (
                <div className="admin-create-code-editor">
                  <div className="admin-create-code-header">
                    <div className="admin-create-code-controls">
                      <span className="admin-create-code-control red"></span>
                      <span className="admin-create-code-control yellow"></span>
                      <span className="admin-create-code-control green"></span>
                    </div>
                    <span className="admin-create-code-filename">code.js</span>
                  </div>
                  <textarea className="admin-create-code-textarea" placeholder="Code Snippet" value={mod.codeSnippet} onChange={(e) => {
                    const copy = [...modules];
                    copy[idx].codeSnippet = e.target.value;
                    setModules(copy);
                  }} />
                </div>
              )}
            </div>
          ))}
          <button className="admin-create-btn-gradient" onClick={addModule}>+ Add Module</button>
        </div>
        <h3 className="admin-create-label" style={{ fontSize: '1.2rem' }}>Test Questions</h3>
        <div className="admin-create-questions">
          {testQuestions.map((q, idx) => (
            <div key={idx} className="admin-create-question-card">
              <input className="admin-create-input" placeholder="Question" value={q.question} onChange={(e) => {
                const copy = [...testQuestions];
                copy[idx].question = e.target.value;
                setTestQuestions(copy);
              }} />
              {q.options.map((opt, optIdx) => (
                <input key={optIdx} className="admin-create-input" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={(e) => {
                  const copy = [...testQuestions];
                  copy[idx].options[optIdx] = e.target.value;
                  setTestQuestions(copy);
                }} />
              ))}
              <label className="admin-create-label" style={{ marginTop: 8 }}>Correct Answer:
                <select className="admin-create-select" value={q.correct} onChange={(e) => {
                  const copy = [...testQuestions];
                  copy[idx].correct = parseInt(e.target.value);
                  setTestQuestions(copy);
                }}>
                  {q.options.map((_, optIdx) => (
                    <option key={optIdx} value={optIdx}>{optIdx + 1}</option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <button className="admin-create-btn-gradient" onClick={addQuestion}>+ Add Question</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="admin-create-btn-gradient" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }} onClick={submitCourse}>Create Course</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCourse;
