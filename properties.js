// properties.js (Your Express Router for Properties)

const express = require('express');
const bcrypt = require('bcrypt'); // Not strictly needed in properties, but if you had user-like actions here
const Joi = require('joi'); // For more robust validation (optional, but good practice)

// This module exports a function that takes the database connection 'db' as an argument.
module.exports = (db) => {
    const router = express.Router(); // Initialize a new router instance for this module

    // --- Joi Schema for Property Validation (Example) ---
    const propertySchema = Joi.object({
        type: Joi.string().valid('Residential', 'Commercial', 'Land', 'Other').required(),
        name: Joi.string().min(3).max(255).required(),
        bhk: Joi.string().valid('1BHK', '2BHK', '2.5BHK', '3BHK', '4BHK', 'Studio', 'Other').required(), // Example BHk types
        location: Joi.object({
            address: Joi.string().min(5).max(255).required(),
            city: Joi.string().min(2).max(100).required(),
            state: Joi.string().min(2).max(100).required(),
            // Add other location fields if necessary
        }).required(),
        properties_image: Joi.array().items(Joi.string().uri()).min(1).required(), // Array of image URLs
    });

    // --- Middleware for basic validation (using Joi) ---
    const validateProperty = (req, res, next) => {
        const { error } = propertySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        next();
    };

    // Helper function to parse JSON fields safely
    const parsePropertyJsonFields = (property) => {
        let imagesArray = [];
        if (property.properties_image) {
            try {
                if (typeof property.properties_image === 'string') {
                    imagesArray = JSON.parse(property.properties_image);
                    if (!Array.isArray(imagesArray)) {
                        imagesArray = [imagesArray.toString()];
                    }
                } else if (Array.isArray(property.properties_image)) {
                    imagesArray = property.properties_image;
                }
            } catch (e) {
                console.error(`Error parsing properties_image for property ID ${property.id}:`, e);
                imagesArray = [];
            }
        }

        let parsedLocation = {};
        if (property.location) {
            if (typeof property.location === 'string') {
                try {
                    parsedLocation = JSON.parse(property.location);
                } catch (e) {
                    console.error(`Error parsing location for property ID ${property.id}:`, e);
                    parsedLocation = {};
                }
            } else if (typeof property.location === 'object' && property.location !== null) {
                parsedLocation = property.location;
            }
        }
        return {
            id: property.id,
            name: property.name,
            location: parsedLocation,
            bhk: property.bhk,
            properties_image: imagesArray,
            type: property.type,
            created_at: property.created_at // Include created_at for sorting
        };
    };

    // POST endpoint to add a property
    // Full path when mounted under /api/properties will be: POST /api/properties
    router.post('/', validateProperty, async (req, res) => { // Path is '/' (relative to mount point /api/properties)
        const { type, name, bhk, location, properties_image } = req.body;

        try {
            // Convert location object and images array to JSON strings for DB storage
            const locationString = JSON.stringify(location);
            const propertiesImageString = JSON.stringify(properties_image);

            const sql = 'INSERT INTO properties (type, name, bhk, location, properties_image) VALUES (?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [type, name, bhk, locationString, propertiesImageString]);

            // Return the newly created property with its ID
            const newProperty = { id: result.insertId, type, name, bhk, location, properties_image };
            res.status(201).json({ success: true, message: 'Property added successfully!', property: newProperty });
        } catch (err) {
            console.error('Insert property error:', err);
            if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_PARSE_ERROR') {
                return res.status(500).json({ success: false, message: `Database schema mismatch: ${err.sqlMessage || err.message}. Check 'properties' table columns.` });
            }
            res.status(500).json({ success: false, message: 'Failed to add property. Check server logs for details.' });
        }
    });

    // Get all properties with specific overview data (for Admin Dashboard display using /api/properties/data)
    router.get('/data', async (req, res) => { // <--- Path is '/data'
        try {
            const query = 'SELECT id, name, location, bhk, properties_image, type, created_at FROM properties ORDER BY created_at DESC';
            const [properties] = await db.query(query);

            if (properties.length === 0) {
                return res.status(200).json([]); // Return empty array if no properties
            }

            const propertiesWithParsedData = properties.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);

        } catch (error) {
            console.error('Error fetching properties data for admin:', error);
            res.status(500).json({ success: false, message: `Failed to fetch properties for admin: ${error.message}` });
        }
    });

    // NEW: Get all properties specifically for the Flutter app (using /api/properties/mobile-list)
    router.get('/mobile-list', async (req, res) => { // <--- NEW PATH FOR FLUTTER APP
        try {
            const query = 'SELECT id, name, location, bhk, properties_image, type FROM properties ORDER BY created_at DESC'; // Exclude 'created_at' if not strictly needed by Flutter for a lighter payload
            const [properties] = await db.query(query);

            if (properties.length === 0) {
                return res.status(200).json([]);
            }

            const propertiesWithParsedData = properties.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);

        } catch (error) {
            console.error('Error fetching properties data for Flutter:', error);
            res.status(500).json({ success: false, message: `Failed to fetch properties for mobile: ${error.message}` });
        }
    });

    // Fetch all properties (raw data, often for /api/properties endpoint)
    router.get('/', async (req, res) => { // Path is '/'
        try {
            const [results] = await db.query("SELECT * FROM properties");
            const propertiesWithParsedData = results.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);
        } catch (error) {
            console.error("Error fetching all properties (raw):", error);
            res.status(500).json({ message: "Failed to fetch all properties." });
        }
    });

    // Fetch all properties for checklist (if needed by a specific checklist endpoint)
    // Full path will be: GET /api/properties/checklist/properties
    router.get('/checklist/properties', async (req, res) => { // Path is '/checklist/properties'
        try {
            const [results] = await db.query("SELECT * FROM properties");
            const propertiesWithParsedData = results.map(parsePropertyJsonFields);
            res.status(200).json(propertiesWithParsedData);
        } catch (err) {
            console.error("Error fetching properties for checklist:", err);
            res.status(500).json({ message: "Failed to fetch properties for checklist." });
        }
    });

    // Delete a property: DELETE /api/properties/:id
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