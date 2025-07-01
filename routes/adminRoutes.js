// routes/adminRoutes.js
const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing

module.exports = (db) => { // Accept db connection
    const router = express.Router();

// Admin Signup with Role
app.post("/api/admins/signup", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  try {
    const checkQuery = "SELECT * FROM admins WHERE email = ?";
    db.query(checkQuery, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error." });

      if (results.length > 0) {
        return res.status(400).json({ message: "Admin already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = "INSERT INTO admins (email, password, role) VALUES (?, ?, ?)";
      db.query(insertQuery, [email, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "Failed to create admin." });

        res.status(201).json({ message: "Admin created successfully." });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Admin Login API
app.post("/api/admins/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const query = "SELECT * FROM admins WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = results[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", token: "your_jwt_token" });
  });
});

// Get all admins
app.get("/api/admins", (req, res) => {
  db.query("SELECT * FROM admins", (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch admins." });

    res.json(results);
  });
});

