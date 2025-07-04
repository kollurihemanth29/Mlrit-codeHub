// pages/Leaderboard.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Leaderboard Error", err);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredData = data.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="leaderboard-container">
      <h1 className="page-title">🌟 Leaderboard</h1>
      {user && user.college && (
        <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 18 }}>
          College: <span style={{ color: '#facc15' }}>{user.college}</span>
        </div>
      )}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="table-wrapper">
        <table className="leaderboard-table" style={{ borderRadius: 12, overflow: 'hidden', background: '#1e293b', boxShadow: '0 4px 24px #00000030' }}>
          <thead>
            <tr style={{ background: '#232946' }}>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Rank</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>User</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Roll Number</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Academic Year</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Department</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Score</th>
              <th style={{ color: '#facc15', fontWeight: 700, fontSize: 16 }}>Solved</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <tr key={user.rank} className={`rank-row rank-${user.rank}`} style={{ fontWeight: user.rank === 1 ? 700 : 500, background: user.rank === 1 ? 'rgba(250, 204, 21, 0.08)' : 'transparent', color: user.rank === 1 ? '#fde68a' : '#fff', fontSize: 16 }}>
                <td>
                  <span className={`badge rank-badge-${user.rank}`}>{user.rank}</span>
                </td>
                <td style={{ fontWeight: user.rank === 1 ? 700 : 500 }}>{user.name}</td>
                <td>{user.rollNumber}</td>
                <td>{user.year}</td>
                <td>{user.department}</td>
                <td style={{ fontWeight: 600 }}>{user.totalScore}</td>
                <td>{user.totalSolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
