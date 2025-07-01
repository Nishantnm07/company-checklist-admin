
const mysql = require('mysql2/promise'); // Using mysql2/promise for async/await

// Create MySQL connection pool (recommended over single connection for Express apps)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL password
    port: 3307,   // Port as a number
    database: 'checklist_user', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections in the pool
    queueLimit: 0
});

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit process if database connection fails
    });

module.exports = pool; // Export the pool