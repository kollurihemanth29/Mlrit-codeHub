// pages/Leaderboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/leaderboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Leaderboard Error", err));
  }, []);

  const filteredData = data.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === "all" || user.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const languages = ["all", ...new Set(data.map((user) => user.language))];

  return (
    <div className="leaderboard-container">
      <h1 className="page-title">🌟 Leaderboard</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="filter-select"
        >
          {languages.map((lang, i) => (
            <option key={i} value={lang}>
              {lang === "all" ? "All Languages" : lang}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Solved</th>
              <th>Language</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <tr key={user.rank} className={`rank-row rank-${user.rank}`}>
                <td>
                  <span className={`badge rank-badge-${user.rank}`}>{user.rank}</span>
                </td>
                <td>{user.name}</td>
                <td>{user.score}</td>
                <td>{user.totalSolved}</td>
                <td>{user.language}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
