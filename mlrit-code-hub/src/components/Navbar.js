import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserContext from "../context/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getRole = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">MLRIT Code Hub</Link>

      <div className="nav-links">
        {token && (
          <>
            {getRole() === "admin" && (
              <>
                <Link className="nav-btn" to="/admin-home">Dashboard</Link>
                <Link className="nav-btn" to="/admin/add-problem">Add Problem</Link>
                <Link className="nav-btn" to="/admin/manage-problems">Manage</Link>
                <Link className="nav-btn" to="/admin/create-contest">Create Contest</Link>
                
              </>
            )}
            {getRole() === "student" && (
              <>
                <Link className="nav-btn" to="/student-home">Home</Link>
                <Link className="nav-btn" to="/editor">Compiler</Link>
                <Link className="nav-btn" to="/problem-set">Problem Set</Link>
                <Link className="nav-btn" to="/contests">Contests</Link>
                <Link className="nav-btn" to="/Leaderboard">Leaderboard</Link>
              </>
            )}

            {/* Profile Dropdown */}
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img
                  src={
                    user?.profilePic
                      ? `http://localhost:5000${user.profilePic}`
                      : "/default-profile.png"
                  }
                  alt="Profile"
                  className="nav-profile-pic"
                />
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>👤 Profile</Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)}>⚙️ Settings</Link>
                  <button onClick={handleLogout}>🔓 Logout</button>
                </div>
              )}
            </div>
          </>
        )}

        {!token && <Link className="nav-btn" to="/">Login/Register</Link>}
      </div>
    </nav>
  );
};

export default Navbar;
