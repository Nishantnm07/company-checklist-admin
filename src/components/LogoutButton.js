// src/components/LogoutButton.js
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token or other auth info from storage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
