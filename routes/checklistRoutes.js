// routes/checklistRoutes.js
const express = require('express');


// Fetch checklist
app.get("/api/checklist", (req, res) => {
  db.query("SELECT * FROM checklist", (err, results) => {
    if (err) return res.status(500).json({ message: "Database query failed." });

    res.json(results);
  });
});


// POST /api/checklist - Add a new checklist item
app.post("/api/checklist", (req, res) => {
  const { type, property_id, bhk_type, room_name, components } = req.body;

  if (!type || !property_id || !bhk_type || !room_name || !components) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = "INSERT INTO checklist (property_id, type, bhk_type, room_name, components) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [property_id, type, bhk_type, room_name, components], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.status(201).json({
      id: result.insertId,
      property_id,
      type,
      bhk_type,
      room_name,
      components
    });
  });
});
    return router;
};

