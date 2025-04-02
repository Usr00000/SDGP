import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const sidebarStyle = {
    height: "100vh",
    width: "200px",
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "#0d1b2a",
    padding: "20px",
    color: "white"
  };

  const linkStyle = {
    display: "block",
    color: "white",
    textDecoration: "none",
    margin: "10px 0",
    fontWeight: "bold"
  };

  return (
    <div style={sidebarStyle}>
      <h3 style={{ color: "#00d1b2" }}>Dashboard</h3>
      <Link to="/" style={linkStyle}>Homepage</Link>
      <Link to="/upload" style={linkStyle}>Upload Patient Data</Link>
      <Link to="/view" style={linkStyle}>View Patient Data</Link>
      <Link to="/analyse" style={linkStyle}>Analyse Patient Data</Link>
      <Link to="/help" style={linkStyle}>Help</Link>
    </div>
  );
};

export default Sidebar;
