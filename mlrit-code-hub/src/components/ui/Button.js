import React from "react";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white shadow hover:from-[#a78bfa] hover:to-[#8b5cf6] transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 