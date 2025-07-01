// src/pages/Login.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null); // Reset error state

    try {
      const response = await axios.post("http://localhost:3000/api/admins/login", {
        email,
        password,
      });

      // Assuming the API returns a success message and a JWT token
      if (response.status === 200) {
        alert(response.data.message); // Show success message
        // Save the token to localStorage or a global state
        localStorage.setItem("token", response.data.token);
        // Navigate to the dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <Grid item xs={12} sm={8} md={4}>
        <Paper elevation={6} style={{ padding: "30px", borderRadius: "15px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          <Box mt={2}>
            {error && (
              <Typography
                variant="body2"
                color="error"
                align="center"
                gutterBottom
              >
                {error}
              </Typography>
            )}
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
