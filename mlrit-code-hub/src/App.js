import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Layout & Context
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import UserContext from "./context/UserContext";

// Auth & Profile
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";

// Admin Pages
import AdminHome from "./pages/AdminHome";
import AddProblem from "./pages/AddProblem";
import AdminProblems from "./pages/AdminProblems";
import EditProblem from "./pages/EditProblem";
import CreateContest from "./pages/CreateContest";
import ManageContests from "./pages/ManageContests";

// Student Pages
import StudentHome from "./pages/StudentHome";
import CodeEditor from "./pages/CodeEditor";
import ProblemSet from "./pages/ProblemSet";

// Leaderboard
import Leaderboard from "./pages/Leaderboard";

// Contest Pages
import Contests from "./pages/ContestList";
import ContestDetail from "./pages/ContestDetail";
import SolveContest from "./pages/SolveContestProblem";
import SolveProblemSetProblem from "./pages/SolveProblemSetProblem";

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load profile", err);
        }
      }
    };
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<AuthPage />} />

          {/* Admin Protected Routes */}
          <Route path="/admin-home" element={<ProtectedRoute allowedRole="admin"><AdminHome /></ProtectedRoute>} />
          <Route path="/admin/add-problem" element={<ProtectedRoute allowedRole="admin"><AddProblem /></ProtectedRoute>} />
          <Route path="/admin/manage-problems" element={<ProtectedRoute allowedRole="admin"><AdminProblems /></ProtectedRoute>} />
          <Route path="/admin/edit-problem/:id" element={<ProtectedRoute allowedRole="admin"><EditProblem /></ProtectedRoute>} />
          <Route path="/admin/create-contest" element={<ProtectedRoute allowedRole="admin"><CreateContest /></ProtectedRoute>} />
          <Route path="/admin/manage-contests" element={<ProtectedRoute allowedRole="admin"><ManageContests /></ProtectedRoute>} />

          {/* Student Protected Routes */}
          <Route path="/student-home" element={<ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute allowedRole="student"><CodeEditor /></ProtectedRoute>} />

          {/* Profile (common) */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Problem Set */}
          <Route path="/problem-set" element={<ProtectedRoute allowedRole="student"><ProblemSet /></ProtectedRoute>} />
          
          {/* Leaderboard (Visible to all authenticated users) */}
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

          {/* Contest Routes */}
          <Route path="/contests" element={<ProtectedRoute allowedRole="student"><Contests /></ProtectedRoute>} />
          <Route path="/contest/:id" element={<ProtectedRoute allowedRole="student"><ContestDetail /></ProtectedRoute>} />
          <Route path="/contest/:contestId/solve/:problemId" element={<ProtectedRoute allowedRole="student"><SolveContest /></ProtectedRoute>} />
          <Route path="/solve/:problemId" element={<ProtectedRoute allowedRole="student"><SolveProblemSetProblem /></ProtectedRoute>} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
