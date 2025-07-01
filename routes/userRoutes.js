const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming you have a database setup

app.get("/api/user", (req, res) => {
  const query = "SELECT * FROM user";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message); // Log the exact error
      return res.status(500).json({ message: "Failed to fetch users." });
    }
    res.status(200).json(results);
  });
});

    // Register Route: POST /api/register
    router.post('/register', async (req, res) => {
        const { name, email, phone, password, occupation, address } = req.body;

        if (!name || !email || !phone || !password || !occupation || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            const sqlQuery = `
                INSERT INTO user (name, email, phone, password, occupation, address)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [results] = await db.query(sqlQuery, [name, email, phone, hashedPassword, occupation, address]);

            res.status(201).json({ success: true, message: 'User registered successfully!', userId: results.insertId });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email or phone number already registered.' });
            }
            console.error('Register error:', error);
            res.status(500).json({ success: false, message: `Database error: ${error.message}` });
        }
    });

    // Login Route: POST /api/user/login
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        try {
            const sql = "SELECT id, name, email, phone, occupation, address, password FROM user WHERE email = ?";
            const [results] = await db.query(sql, [email]);

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password); // Compare hashed password

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const { password: userPassword, ...userWithoutPassword } = user; // Remove password from response
            res.status(200).json({ success: true, message: 'Login successful!', user: userWithoutPassword });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    });



    // Block a user: POST /api/user/block
    router.post('/block', async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            // Ensure 'users' table is correctly named 'user' if that's what you use
            const [results] = await db.query("UPDATE user SET status = 'blocked' WHERE id = ?", [userId]);
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "User not found or already blocked." });
            }
            res.json({ message: "User blocked successfully." });
        } catch (error) {
            console.error("Error blocking user:", error);
            res.status(500).json({ message: "Failed to block user." });
        }
    });

    return router;
};


//Block/Unblock User Endpoint:
app.post("/api/user/block", (req, res) => {
  const { id } = req.body;
  const query = "UPDATE user SET status = IF(status='Active', 'Blocked', 'Active') WHERE id = ?";
  connection.query(query, [id], (err) => {
    if (err) {
      console.error("Error blocking/unblocking user:", err.message);
      return res.status(500).json({ message: "Failed to block/unblock user." });
    }
    res.status(200).json({ message: "User status updated successfully." });
  });
});


app.delete('/api/user/:id', async (req, res) => {
  const { id } = req.params; // Get the user ID from the URL

  try {
    // 🔒 Use a '?' placeholder to prevent SQL injection attacks
    const sqlQuery = "DELETE FROM user WHERE id = ?";
    const [result] = await db.query(sqlQuery, [id]);

    // Check if a row was actually deleted
    if (result.affectedRows > 0) {
      // Send a success message back to the React app
      res.status(200).json({ message: 'User removed successfully' });
    } else {
      // If no user with that ID was found
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user from database:', error);
    res.status(500).json({ message: 'Failed to remove user' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


module.exports = router;
