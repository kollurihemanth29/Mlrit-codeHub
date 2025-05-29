import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Contests = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/contests");
      setContests(res.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  return (
    <div className="container">
      <h1>Available Contests</h1>
      {contests.map((contest) => (
        <div key={contest._id} className="contest-card">
          <h2>{contest.title}</h2>
          <p>Starts at: {new Date(contest.startTime).toLocaleString()}</p>
          <p>Ends at: {new Date(contest.endTime).toLocaleString()}</p>
          <Link to={`/contest/${contest._id}`}>
            <button>View Contest</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Contests;
