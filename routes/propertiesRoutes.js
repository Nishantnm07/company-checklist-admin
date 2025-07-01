// properties.js (Your Express Router for Properties - Older Version)

/*
const express = require('express');

// This module exports a function that takes the database connection 'db' as an argument.
// This function returns an Express router.
module.exports = (db) => {
    const router = express.Router(); // Initialize a new router instance for this module

    // POST endpoint to add a property
    // Full path when mounted under /api/properties will be: POST /api/properties
    router.post('/', async (req, res) => { // Path is '/' (relative to mount point /api/properties)
        const { type, name, bhk, location, properties_image } = req.body;

        if (!type || !name || !bhk || !location || properties_image === undefined) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Frontend validation added for string checks (as per previous versions)
        if (typeof location !== 'object' || location === null ||
            !location.address || !location.city || !location.state ||
            !Array.isArray(properties_image)) {
            return res.status(400).json({ error: 'Location must be an object with address, city, state. Properties_image must be an array.' });
        }

        try {
            // Convert location object and images array to JSON strings for DB storage
            const locationString = JSON.stringify(location);
            const propertiesImageString = JSON.stringify(properties_image);

            const sql = 'INSERT INTO properties (type, name, bhk, location, properties_image) VALUES (?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [type, name, bhk, locationString, propertiesImageString]);

            // Return the newly created property with its ID
            const newProperty = { id: result.insertId, type, name, bhk, location, properties_image };
            res.status(201).json(newProperty); // Old response format, without 'success' and 'message'
        } catch (err) {
            console.error('Insert property error:', err);
            // Check for specific SQL error to give more context
            if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_PARSE_ERROR') {
                return res.status(500).json({ error: `Database schema mismatch: ${err.sqlMessage || err.message}. Check 'properties' table.` });
            }
            res.status(500).json({ error: 'Database operation failed. Check server logs for details.' });
        }
    });

    // Helper function to parse JSON fields safely (as it was)
    const parsePropertyJsonFields = (property) => {
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
                try {
                    parsedLocation = JSON.parse(property.location);
                } catch (e) {
                    console.error(`Error parsing location for property ID ${property.id}:`, e);
                    parsedLocation = {}; // Fallback to empty object on parse error
                }
            } else if (typeof property.location === 'object' && property.location !== null) {
                parsedLocation = property.location; // Already an object (from MySQL JSON type)
            }
        }
        // Exclude created_at from the returned object if it was not explicitly requested or causing issues
        // In the original provided snippet, `created_at` was not explicitly part of the return, so omitting it here.
        return {
            id: property.id,
            name: property.name,
            location: parsedLocation,
            bhk: property.bhk,
            properties_image: imagesArray,
            type: property.type,
            // created_at: property.created_at // Removed, as it was not consistently in all prior returns
        };
    };


    // Get all properties with specific overview data (for Flutter cards and Admin display)
    // Full path will be: GET /api/properties/data
    router.get('/data', async (req, res) => { // <--- Path is '/data'
        try {
            // In the older version, created_at might not have been selected, but adding it for robustness.
            const query = 'SELECT id, name, location, bhk, properties_image, type, created_at FROM properties ORDER BY created_at DESC';
            const [properties] = await db.query(query); // db.query returns [rows, fields]

            if (properties.length === 0) {
                return res.json([]); // Return empty array if no properties
            }

            const propertiesWithParsedData = properties.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);

        } catch (error) { // This catch block handles errors for the outer async function
            console.error('Error fetching properties data:', error);
            res.status(500).json({ success: false, message: `Failed to fetch properties: ${error.message}` });
        }
    });

    // Fetch all properties (raw data, often for admin grid)
    // Full path will be: GET /api/properties
    router.get('/', async (req, res) => { // Path is '/'
        try {
            const [results] = await db.query("SELECT * FROM properties");
            // Also parse JSON fields for the raw data fetch for consistency
            const propertiesWithParsedData = results.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);
        } catch (error) {
            console.error("Error fetching all properties (raw):", error);
            res.status(500).json({ message: "Database query failed." });
        }
    });

    // Fetch all properties for checklist (raw data)
    // Full path will be: GET /api/properties/checklist/properties
    router.get('/checklist/properties', async (req, res) => { // Path is '/checklist/properties'
        try {
            const [results] = await db.query("SELECT * FROM properties");
            // Also parse JSON fields for this route
            const propertiesWithParsedData = results.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);
        } catch (err) {
            console.error("Error fetching properties for checklist:", err);
            res.status(500).json({ message: "Database query failed." });
        }
    });

    // DELETE a property: DELETE /api/properties/:id (this was added in the previous turn, keeping it)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Property ID is required." });
        }

        try {
            const sqlQuery = "DELETE FROM properties WHERE id = ?";
            const [result] = await db.query(sqlQuery, [id]);

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: 'Property deleted successfully.' });
            } else {
                res.status(404).json({ success: false, message: 'Property not found.' });
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            res.status(500).json({ success: false, message: `Failed to delete property: ${error.message}` });
        }
    });

    return router; // Export the configured router
};

*/