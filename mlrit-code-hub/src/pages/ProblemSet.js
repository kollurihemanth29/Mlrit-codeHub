import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./ProblemSet.css";

const ProblemSet = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const problemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProblems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(res.data);
      } catch (err) {
        console.error("Failed to load problems", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const map = {};
        res.data.forEach((stat) => {
          map[stat.problemId] = stat;
        });
        setStatsMap(map);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    fetchProblems();
    fetchStats();
  }, [navigate]);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficulty === "All" || problem.difficulty?.toLowerCase() === difficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="problemset-page">
      <h2>🧩 Problem Set</h2>

      <div className="problemset-filters">
        <input
          type="text"
          placeholder="🔍 Search problems..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <table className="problemset-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Score</th>
            <th>Difficulty</th>
            <th>Users Tried</th>
            <th>Success Rate</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  {currentProblems.map((problem) => (
    <tr key={problem._id}>
      <td>{problem.title}</td>
      <td>{problem.score || 50}</td>
      <td>{problem.difficulty || "Easy"}</td>
      <td>{statsMap[problem._id]?.usersTried || 0}</td>
      <td>{statsMap[problem._id]?.successRate?.toFixed(2) || "0.00"}%</td>
      <td>
      <Link className="solve-btn" to={`/solve/${problem._id}`}>
  Solve →
</Link>

      </td>
    </tr>
  ))}
</tbody>

      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          ◀ Prev
        </button>
        <span>
          {indexOfFirst + 1} – {Math.min(indexOfLast, filteredProblems.length)} of{" "}
          {filteredProblems.length}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default ProblemSet;
