import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const AdminHome = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setName(res.data.name);
      } catch (error) {
        console.error("Failed to load admin user", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <motion.div
      className="admin-home"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: "40px", color: "#ffa116", fontSize: "24px" }}>
        Hi, {name} 👋<br />
        <span style={{ fontSize: "18px", color: "#fff" }}>Welcome to the Admin Dashboard</span>
      </div>
    </motion.div>
  );
};

export default AdminHome;
