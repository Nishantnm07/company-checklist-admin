import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/signup", {
        email,
        password,
        role,
      });
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed.");
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
            Admin Signup
          </Typography>
          <Box mt={2}>
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
            <TextField
              label="Role"
              variant="outlined"
              fullWidth
              select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              margin="normal"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSignup}
              >
                Signup
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Signup;
