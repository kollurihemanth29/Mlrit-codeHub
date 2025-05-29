import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./StudentHome.css";

const StudentHome = () => {
  const [name, setName] = useState("");
  const [rank, setRank] = useState(null);
  const [celebrationMessage, setCelebrationMessage] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name);

        const leaderboardRes = await axios.get("http://localhost:5000/api/leaderboard");
        const userRank = leaderboardRes.data.find((user) => user.name === res.data.name)?.rank;
        setRank(userRank);

        if (userRank === 1) {
          setCelebrationMessage(true);
        }
      } catch (error) {
        console.error("Failed to load student user", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="student-home-container">
      {celebrationMessage && (
        <>
          <div className="confetti-drop-container">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`confetti-petal petal-${i % 5}`} />
            ))}
          </div>

          <motion.div
            className="celebration-box"
            animate={{ scale: [0.95, 1.05, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          >
            🎉 Congratulations! You are ranked 1st on the leaderboard! 🏆
          </motion.div>
        </>
      )}

      <div className="greeting">Hi, {name} 👋</div>
      <div className="sub-greeting">Welcome to the Student Home Page</div>
    </div>
  );
};

export default StudentHome;
