import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    if (allowedRole && decoded.role !== allowedRole) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (err) {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
