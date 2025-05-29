import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  isSameMonth,
} from "date-fns";
import "./Profile.css";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({ name: "", email: "" });
  const [previewPic, setPreviewPic] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissionsData, setSubmissionsData] = useState({});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
      setLoading(false);
      fetchSubmissionsData();
    }
  }, [user]);

  const fetchSubmissionsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/submissions/last-6-months", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissionsData(res.data);
    } catch (err) {
      console.error("Error fetching submissions data:", err);
    }
  };

  const getColor = (submissions) => {
    if (!submissions) return "#e5e7eb";
    if (submissions <= 2) return "#a7f3d0";
    if (submissions <= 5) return "#34d399";
    return "#10b981";
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      alert("Profile updated");
    } catch {
      alert("Update failed");
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewPic(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/profile/upload-pic", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({ ...prev, profilePic: res.data.url }));
    } catch {
      alert("Image upload failed");
    }
  };

  const generateCalendar = () => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 6);
    const start = startOfWeek(startDate, { weekStartsOn: 0 });
    const end = endOfWeek(endDate, { weekStartsOn: 0 });

    const allDays = eachDayOfInterval({ start, end });

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  };

  if (loading) return <div className="profile">Loading...</div>;

  return (
    <div className="profile">
      <div className="profile-card">
        <h2>👤 My Profile</h2>

        <div className="profile-pic">
          <img
            src={previewPic || (user?.profilePic && `http://localhost:5000${user.profilePic}`) || "/default-profile.png"}
            alt="Profile"
          />
          <input type="file" onChange={handlePicUpload} />
        </div>

        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button onClick={handleUpdate}>💾 Save</button>

        {/* Heatmap */}
        <div className="submissions-heatmap">
          <h3>Submissions Heat Map (Last 6 Months)</h3>
          <div className="heatmap-container">
            <div className="day-labels">
              {["Mon", "Wed", "Fri"].map((day, i) => (
                <div key={i} className="day-label">{day}</div>
              ))}
            </div>

            <div className="heatmap-scroll">
              <div className="month-labels">
                {generateCalendar().map((week, index) => {
                  const firstDay = week[0];
                  return (
                    <div key={index} className="month-label">
                      {(index === 0 || !isSameMonth(firstDay, week[6])) ? format(firstDay, "MMM") : ""}
                    </div>
                  );
                })}
              </div>

              <div className="heatmap-grid">
                {generateCalendar().map((week, weekIndex) => (
                  <div key={weekIndex} className="heatmap-column">
                    {week.map((day, i) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const count = submissionsData[dateStr] || 0;
                      return (
                        <div
                          key={i}
                          className="heatmap-cell"
                          title={`${dateStr}: ${count} submissions`}
                          style={{ backgroundColor: getColor(count) }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
