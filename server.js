
// server.js (Your main Node.js backend server file)

const express = require('express');
const app = express(); // Initialize Express app
const cors = require('cors'); // For Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Request body parse karne ke liye
const bcrypt = require('bcrypt'); // Password hashing ke liye

const PORT = 3000; // Server port

// --- MySQL Database Connection Pool ---
// Using 'mysql2/promise' for async/await functionality, which is recommended
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost', // Ensure 'localhost' is lowercase
    user: 'root',
    password: '', // <--- IMPORTANT: Replace with your actual MySQL password
    port: 3307,   // <--- IMPORTANT: Replace with your actual MySQL server port
    database: 'checklist_user', // <--- IMPORTANT: Replace with your database name
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections in the pool
    queueLimit: 0
});

// Test database connection on server startup
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit the Node.js process if database connection fails
    });

// --- Middleware ---
// These middleware process incoming request bodies and enable CORS
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(bodyParser.json()); // Additional JSON body parser (for compatibility)
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies (for form submissions)
app.use(cors()); // Enable CORS for all origins (Crucial for Flutter app to connect from different IP)

// --- API Endpoints ---

// --- User (Public & Admin-related) Routes ---

// --- Import Routers ---
const propertiesRouter = require('./properties');

app.use('/api/properties', propertiesRouter(db));


// Register New User: POST /api/register
app.post('/api/register', async (req, res) => {
    const { name, email, phone, password, occupation, address } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !occupation || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Hash the password before storing it for security
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlQuery = `
            INSERT INTO user (name, email, phone, password, occupation, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [results] = await db.query(sqlQuery, [name, email, phone, hashedPassword, occupation, address]);

        res.status(201).json({ success: true, message: 'User registered successfully!', userId: results.insertId });
    } catch (error) {
        // Handle duplicate entry error (e.g., if email/phone is unique)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email or phone number already registered.' });
        }
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
});

// User Login Route: POST /api/user/login
app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const sql = "SELECT id, name, email, phone, occupation, address, password FROM user WHERE email = ?";
        const [results] = await db.query(sql, [email]); // db.query returns [rows, fields]

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password); // Compare hashed password

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const { password: userPassword, ...userWithoutPassword } = user; // Remove password from response for security
        res.status(200).json({ success: true, message: 'Login successful!', user: userWithoutPassword });
    } catch (error) {
        console.error('User Login error:', error);
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
});

// Fetch all users (primarily for admin panel): GET /api/user
app.get("/api/user", async (req, res) => {
    try {
        // Select specific columns, avoid sensitive data like raw passwords
        const query = "SELECT id, name, email, phone, occupation, address, status FROM user";
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

// Block/Unblock User Endpoint: POST /api/user/block
app.post("/api/user/block", async (req, res) => {
    const { id } = req.body; // User ID from request body

    if (!id) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        // First, get the current status of the user
        const [userResults] = await db.query("SELECT status FROM user WHERE id = ?", [id]);
        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const currentStatus = userResults[0].status;
        // Toggle status: if active or null, set to 'Blocked'; otherwise, set to 'Active'
        const newStatus = (currentStatus === 'Active' || currentStatus === null) ? 'Blocked' : 'Active';

        const query = "UPDATE user SET status = ? WHERE id = ?";
        const [updateResults] = await db.query(query, [newStatus, id]);

        if (updateResults.affectedRows === 0) {
            // This might happen if user ID is valid but status is already what we're trying to set
            return res.status(404).json({ message: "User not found or status not changed." });
        }
        res.status(200).json({ message: `User status updated to ${newStatus} successfully.`, newStatus: newStatus });
    } catch (error) {
        console.error("Error blocking/unblocking user:", error.message);
        res.status(500).json({ message: "Failed to update user status." });
    }
});


// Delete a user: DELETE /api/user/:id
app.delete('/api/user/:id', async (req, res) => {
    const { id } = req.params; // Get the user ID from the URL parameters

    if (!id) { // Added validation for missing ID in params
        return res.status(400).json({ message: "User ID is required in path." });
    }

    try {
        const sqlQuery = "DELETE FROM user WHERE id = ?";
        const [result] = await db.query(sqlQuery, [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user from database:', error);
        res.status(500).json({ message: 'Failed to remove user' });
    }
});


// --- Admin-specific Routes ---

// Admin Signup with Role: POST /api/admins/signup
app.post("/api/admins/signup", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  try {
    const checkQuery = "SELECT * FROM admins WHERE email = ?";
    const [checkResults] = await db.query(checkQuery, [email]);
    if (checkResults.length > 0) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO admins (email, password, role) VALUES (?, ?, ?)";
    await db.query(insertQuery, [email, hashedPassword, role]);

    res.status(201).json({ message: "Admin created successfully." });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: "Failed to create admin." });
  }
});

// Admin Login API: POST /api/admins/login
app.post("/api/admins/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const query = "SELECT * FROM admins WHERE email = ?";
  const [results] = await db.query(query, [email]);

  if (results.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const admin = results[0];
  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // In a real application, generate a JWT token here
  res.status(200).json({ message: "Login successful", token: "your_jwt_token", role: admin.role });
});

// Get all admins: GET /api/admins
app.get("/api/admins", async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, email, role FROM admins"); // Don't return sensitive data like passwords
    res.json(results);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: "Failed to fetch admins." });
  }
});

// --- Properties Routes ---

// POST endpoint to add a property: POST /api/properties
app.post('/api/properties', async (req, res) => {
  const { type, name, bhk, location, properties_image } = req.body;

  if (!type || !name || !bhk || !location || !properties_image) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const locationString = JSON.stringify(location); // Convert location object to JSON string
    const propertiesImageString = JSON.stringify(properties_image); // Convert images array to JSON string

    const sql = 'INSERT INTO properties (type, name, bhk, location, properties_image) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [type, name, bhk, locationString, propertiesImageString]);

    const newProperty = { id: result.insertId, type, name, bhk, location, properties_image };
    res.status(201).json(newProperty);
  } catch (err) {
    console.error('Insert property error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});


// Get all properties (raw data, often for admin grid): GET /api/properties
app.get("/api/properties", async (req, res) => { // This fetches raw data
  try {
    const [results] = await db.query("SELECT * FROM properties");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching all properties (raw):", error);
    res.status(500).json({ message: "Database query failed." });
  }
});

// Get all properties with specific overview data (for Flutter cards): GET /api/properties/data
app.get('/api/properties/data', async (req, res) => {
    try {
        const query = 'SELECT id, name, location, bhk, properties_image, type FROM properties ORDER BY created_at DESC';
        const [properties] = await db.query(query); // db.query returns [rows, fields]

        if (properties.length === 0) {
            return res.json([]);
        }

        // Process each property to parse JSON fields if they are stored as strings
        const propertiesWithParsedData = properties.map(property => {
            let imagesArray = [];
            if (property.properties_image) {
                try {
                    // Check if it's already an array/object (if MySQL JSON type) before parsing
                    if (typeof property.properties_image === 'string') {
                        imagesArray = JSON.parse(property.properties_image);
                        if (!Array.isArray(imagesArray)) { // Agar JSON.parse se single string aa jaye
                            imagesArray = [imagesArray.toString()]; // Convert to array containing that value
                        }
                    } else if (Array.isArray(property.properties_image)) {
                        imagesArray = property.properties_image; // Already an array (from MySQL JSON type)
                    }
                } catch (e) {
                    console.error(`Error parsing properties_image for property ID ${property.id}:`, e);
                    imagesArray = []; // Fallback to empty array on parse error
                }
            }

            let parsedLocation = {};
            if (property.location) {
                // Check if it's already an object (if MySQL JSON type) before parsing
                if (typeof property.location === 'string') {
                    try { // <--- The 'try' block that was missing a catch
                        parsedLocation = JSON.parse(property.location);
                    } catch (e) { // <--- ADDED: Missing catch block
                        console.error(`Error parsing location for property ID ${property.id}:`, e);
                        // Optionally set parsedLocation to an empty object or a default value
                        parsedLocation = {};
                    }
                } else if (typeof property.location === 'object' && property.location !== null) {
                    parsedLocation = property.location; // Already an object (from MySQL JSON type)
                }
            }

            return {
                id: property.id,
                name: property.name,
                location: parsedLocation,
                bhk: property.bhk,
                properties_image: imagesArray,
                type: property.type,
            };
        });

        res.status(200).json(propertiesWithParsedData);

    } catch (error) { // This catch block handles errors for the outer async function
        console.error('Error fetching properties data:', error);
        res.status(500).json({ success: false, message: `Failed to fetch properties: ${error.message}` });
    }
});
// --- Checklist Routes ---

// Fetch all checklists: GET /api/checklist
app.get("/api/checklist", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM checklist");
    res.json(results);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ message: "Database query failed." });
  }
});

// Add a new checklist item: POST /api/checklist
app.post("/api/checklist", async (req, res) => {
  const { type, property_id, bhk_type, room_name, components } = req.body;

  if (!type || !property_id || !bhk_type || !room_name || !components) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const componentsString = JSON.stringify(components); // Convert components array to JSON string

    const sql = "INSERT INTO checklist (property_id, type, bhk_type, room_name, components) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [property_id, type, bhk_type, room_name, componentsString]);

    res.status(201).json({
      id: result.insertId,
      property_id,
      type,
      bhk_type,
      room_name,
      components // Original components return karein
    });
  } catch (err) {
      console.error('Insert checklist error:', err);
      res.status(500).json({ error: 'Database error.' });
  }
});





// --- Default Error Handling Middleware ---
// Ye middleware un errors ko catch karta hai jo routes mein occur hote hain aur handle nahi hue
app.use((err, req, res, next) => {
  console.error(err.stack); // Error stack ko log karein debugging ke liye
  res.status(500).json({ message: "An unexpected error occurred on the server." });
});

// --- Server Start ---
// Server ko PORT par start karein, aur yeh sabhi network interfaces (0.0.0.0) par accessible hoga
app.listen(PORT, () => {
  console.log(`Unified Server running on port ${PORT}`);
  console.log(`Accessible from:`);
  console.log(`- Web Admin Panel (on same machine): http://localhost:${PORT}`);
  console.log(`- Flutter App (on local network): http://192.168.0.189:${PORT}`); // Apka actual IP yahan verify karein

  console.log(`\n--- Important Endpoints ---`);
    // User Register endpoint: Used by the Flutter Application for new user sign-ups.
    console.log(`User Register: POST http://192.168.0.189:${PORT}/api/register`);
    // User Login endpoint: Used by the Flutter Application for existing user authentication.
    console.log(`User Login: POST http://192.168.0.189:${PORT}/api/user/login`);

    // Get Properties for Flutter: Used by the Flutter Application to display property listings.
    // **UPDATED** to use the dedicated mobile-list endpoint
    console.log(`Get Properties for Flutter: GET http://192.168.0.189:${PORT}/api/properties/mobile-list`);

    // Get Properties for Web Admin Panel (overview data):
    // **UPDATED** to use the /data endpoint for dashboard/overview
    console.log(`Get Properties for Admin (Overview): GET http://localhost:${PORT}/api/properties/data`);

    // Get ALL Properties (raw data for admin grid/list):
    // **UPDATED** - This is the main /api/properties route now
    console.log(`Get All Properties (Admin Grid): GET http://localhost:${PORT}/api/properties`);

    // Add New Property: Used by the Web Admin Panel to create new property listings.
    console.log(`Add New Property: POST http://localhost:${PORT}/api/properties`);
    // Delete Property: Used by the Web Admin Panel to remove properties.
    console.log(`Delete Property: DELETE http://localhost:${PORT}/api/properties/:id`);


    // Admin Login: Used by the Web Admin Panel for administrator authentication.
    console.log(`Admin Login: POST http://localhost:${PORT}/api/admins/login`);
    // Get All Users (for Admin): Used by the Web Admin Panel to view and manage user accounts.
    console.log(`Get All Users (for Admin): GET http://localhost:${PORT}/api/user`);
    // Block/Unblock User: Used by the Web Admin Panel for administrators to change user status.
    console.log(`Block/Unblock User: POST http://localhost:${PORT}/api/user/block`);
    // Delete User: Used by the Web Admin Panel for administrators to remove user accounts.
    console.log(`Delete User: DELETE http://localhost:${PORT}/api/user/:id`);
    // Get All Checklists: Can be used by both Flutter Application (to display relevant checklists) and Web Admin Panel (for checklist management).
    console.log(`Get All Checklists: GET http://localhost:${PORT}/api/checklist`);
  });