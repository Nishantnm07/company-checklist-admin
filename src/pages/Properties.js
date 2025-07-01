import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

// Predefined options for forms
const propertyTypes = ["House", "Villa", "Flat", "Bungalow"];
const bhkOptions = ["1BHK", "2BHK", "2.5BHK", "3BHK", "4BHK"];
const roomTypes = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Hall", "Dining Room", "Balcony", "Utility Room", "Study Room"];

// Set up axios with a base URL for your backend API
axios.defaults.baseURL = "http://localhost:3000/api";

// Define a custom Material-UI theme
const theme = createTheme({
    palette: {
        primary: { main: '#2c387e' },
        secondary: { main: '#607d8b' },
        success: { main: '#4caf50' },
        warning: { main: '#ff9800' },
        error: { main: '#f44336' },
        background: { default: '#f9fafb', paper: '#ffffff' },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h4: { fontWeight: 600, color: '#333333' },
        h6: { fontWeight: 500, color: '#2c387e', marginBottom: 8 },
        body1: { fontSize: '0.85rem', color: '#424242' },
        body2: { fontSize: '0.78rem', color: '#616161' },
        button: { textTransform: 'none' }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: { backgroundColor: '#3f51b5', '&:hover': { backgroundColor: '#2c387e' } },
                outlined: { borderColor: '#b0bec5', color: '#424242', '&:hover': { borderColor: '#90a4ae', backgroundColor: 'rgba(0, 0, 0, 0.03)' } },
            },
        },
        MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', marginBottom: '20px' } } },
        MuiDialog: { styleOverrides: { paper: { borderRadius: 12, padding: '10px 0' } } },
        MuiTextField: { styleOverrides: { root: { marginBottom: '10px' } } },
        MuiList: { styleOverrides: { root: { '& ul': { listStyleType: 'disc' } } } },
        MuiListItemText: { styleOverrides: { primary: { fontWeight: 500 } } },
        MuiTableCell: {
            styleOverrides: {
                head: { backgroundColor: '#e0e7fa', color: '#2c387e', fontWeight: 600, borderBottom: '2px solid #b3cde0', padding: '10px 12px' },
                body: { color: '#424242', fontSize: '0.78rem', padding: '8px 12px' },
            },
        },
        MuiTableRow: { styleOverrides: { root: { '&:nth-of-type(odd)': { backgroundColor: '#fdfdfd' }, '&:hover': { backgroundColor: '#e6f2ff' } } } },
        MuiPaper: { styleOverrides: { root: { borderRadius: 8, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)' } } }
    },
});


const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [viewChecklistDialogOpen, setViewChecklistDialogOpen] = useState(false);
    const [selectedPropertyForView, setSelectedPropertyForView] = useState(null);

    // --- UPDATED newProperty state: location is an object, properties_image is array ---
    const [newProperty, setNewProperty] = useState({
        type: "",
        name: "",
        bhk: "",
        location: { address: "", city: "", state: "" }, // Initialize location as an object
        properties_image: [] // Initialize properties_image as an empty array
    });
    // --- NEW State for Image Input ---
    const [currentImageUrlInput, setCurrentImageUrlInput] = useState("");

    const [currentPropertyId, setCurrentPropertyId] = useState(null);
    const [newRoomType, setNewRoomType] = useState("");
    const [newComponents, setNewComponents] = useState([]);
    const [currentComponentInput, setCurrentComponentInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch from /api/properties/data for processed data (with parsed location/images)
                const [propertyResponse, checklistResponse] = await Promise.all([
                    axios.get("/properties/data"),
                    axios.get("/checklist"),
                ]);

                // Assuming properties.id is a number from DB, convert to String for consistency with React keys
                const fetchedProperties = (propertyResponse.data || []).map(p => ({ ...p, id: String(p.id) }));

                // Assuming checklist.id and property_id are numbers from DB
                const fetchedChecklist = (checklistResponse.data || []).map(item => ({ ...item, id: String(item.id), property_id: String(item.property_id) }));

                setProperties(fetchedProperties);
                setChecklist(fetchedChecklist);
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error("Error fetching data during initial load:", err);
                let errorMessage = "Failed to load data. Please ensure your backend is running.";

                if (err.response) {
                    errorMessage = `Server Error ${err.response.status}: ${err.response.data.message || err.response.data || 'Unknown backend error'}`;
                } else if (err.request) {
                    errorMessage = "No response from server. Is the backend running at http://localhost:3000?";
                } else {
                    errorMessage = `Request setup error: ${err.message}`;
                }

                setError(errorMessage);
                setSnackbarMessage(errorMessage);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setProperties([]); // Clear properties on error
                setChecklist([]);   // Clear checklist on error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Empty dependency array means this runs once on component mount

    const handlePropertyDialogOpen = () => setPropertyDialogOpen(true);
    const handlePropertyDialogClose = () => {
        setPropertyDialogOpen(false);
        // --- RESET newProperty to initial state on dialog close ---
        setNewProperty({ type: "", name: "", bhk: "", location: { address: "", city: "", state: "" }, properties_image: [] });
        setCurrentImageUrlInput(""); // Reset image input
    };
    const handleRoomDialogClose = () => {
        setRoomDialogOpen(false);
        setCurrentPropertyId(null);
        setNewRoomType("");
        setNewComponents([]);
        setCurrentComponentInput("");
    };
    const handleViewChecklistOpen = (property) => {
        setSelectedPropertyForView(property);
        setViewChecklistDialogOpen(true);
    };
    const handleViewChecklistClose = () => {
        setSelectedPropertyForView(null);
        setViewChecklistDialogOpen(false);
    };

    // --- UPDATED: handleInputChange for nested location object ---
    const handlePropertyInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("location.")) { // Check if it's a location field (e.g., "location.address")
            const locationField = name.split(".")[1]; // Get "address", "city", or "state"
            setNewProperty(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locationField]: value
                }
            }));
        } else {
            // For other fields like type, name, bhk
            setNewProperty(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- NEW: Image URL Input Handlers ---
    const addImageUrl = () => {
        if (currentImageUrlInput.trim() !== "") {
            setNewProperty(prev => ({
                ...prev,
                properties_image: [...prev.properties_image, currentImageUrlInput.trim()]
            }));
            setCurrentImageUrlInput("");
        }
    };
    const removeImageUrl = (indexToRemove) => {
        setNewProperty(prev => ({
            ...prev,
            properties_image: prev.properties_image.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleComponentInputChange = (e) => setCurrentComponentInput(e.target.value);
    const addComponentToList = () => {
        if (currentComponentInput.trim() !== "") {
            setNewComponents(prevComponents => [...prevComponents, currentComponentInput.trim()]); // Use functional update
            setCurrentComponentInput(""); // Clear the input field after adding
        }
    };
    const removeComponentFromList = (indexToRemove) => {
        setNewComponents(prevComponents => prevComponents.filter((_, index) => index !== indexToRemove)); // Use functional update
    };

    const handlePropertySubmit = async () => {
        // --- Added more robust validation for location fields ---
        if (!newProperty.type || !newProperty.name || !newProperty.bhk ||
            !newProperty.location.address.trim() || !newProperty.location.city.trim() || !newProperty.location.state.trim() ||
            newProperty.properties_image === undefined) { // properties_image can be empty array
            setSnackbarMessage("Please fill all required property fields (including Address, City, State, and at least one Image URL).");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }
        // --- Added validation for at least one image URL ---
        if (newProperty.properties_image.length === 0) {
            setSnackbarMessage("Please add at least one image URL.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        setLoading(true); // Start loading indicator
        setError(null); // Clear previous errors
        try {
            // Post new property data to your backend
            // newProperty.location is already an object, newProperty.properties_image is an array
            const response = await axios.post("/properties", newProperty); // Send the whole newProperty object

            const addedProperty = response.data; // Backend should return the newly added property (with its ID)

            if (!addedProperty || !addedProperty.id) {
                 throw new Error("Backend did not return the expected property object with an ID.");
            }

            // --- SUCCESS PATH: Display Toast, Close Dialog, Open Room Dialog ---

            // Re-fetch ALL properties and checklists to ensure the UI is fully updated
            // Use axios.get("/properties/data") for the processed properties
            const [propertyResponse, checklistResponse] = await Promise.all([
                axios.get("/properties/data"),
                axios.get("/checklist"),
            ]);
            const fetchedProperties = (propertyResponse.data || []).map(p => ({ ...p, id: String(p.id) }));
            const fetchedChecklist = (checklistResponse.data || []).map(item => ({ ...item, id: String(item.id), property_id: String(item.property_id) }));
            setProperties(fetchedProperties);
            setChecklist(fetchedChecklist);

            setSnackbarMessage("Property added successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true); // Show success toast

            handlePropertyDialogClose(); // Close the "Add New Property" dialog (resets form)
            setCurrentPropertyId(String(addedProperty.id)); // Set ID for the next dialog
            // --- FIX: Set selectedPropertyForView immediately after adding property ---
            // This is crucial for the Add Room Checklist dialog to have type/bhk
            setSelectedPropertyForView(addedProperty);
            setRoomDialogOpen(true); // --- Open the "Add Room Checklist" dialog ---

        } catch (err) {
            // --- DETAILED ERROR LOGGING AND SNACKBAR FOR FAILURE ---
            console.error("--- Detailed Error Adding Property ---", err);
            let errorMessage = "Failed to add the property. Please check the console for details.";

            if (err.response) {
                // The server responded with an error status (4xx or 5xx)
                console.error("Server Response Data:", err.response.data);
                console.error("Server Response Status:", err.response.status);
                // Try to get specific error message from backend if available
                const serverMsg = typeof err.response.data === 'string' ? err.response.data : err.response.data.message || JSON.stringify(err.response.data);
                errorMessage = `Server Error ${err.response.status}: ${serverMsg || 'Unknown backend error.'}`;
            } else if (err.request) {
                // The request was made, but no response was received (e.g., network issue, backend down)
                console.error("No response received for request:", err.request);
                errorMessage = "No response from server. Is the backend running at http://localhost:3000?";
            } else {
                // An error occurred in setting up the request (e.g., malformed URL)
                console.error('Error setting up request:', err.message);
                errorMessage = `Request setup error: ${err.message}`;
            }

            setError(errorMessage); // Set error state for main page error display (if applicable)
            setSnackbarMessage(errorMessage); // Show error toast
            setSnackbarSeverity("error"); // Set severity to error
            setSnackbarOpen(true); // Show error toast
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const handleRoomChecklistSubmit = async () => {
        if (!currentPropertyId || !newRoomType.trim() || newComponents.length === 0) {
            setSnackbarMessage("Please select a room type and add at least one component.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        // --- NEW VALIDATION: Ensure selectedPropertyForView is available for type/bhk_type ---
        // This 'if' block will now be true because selectedPropertyForView is set in handlePropertySubmit
        if (!selectedPropertyForView || !selectedPropertyForView.type || !selectedPropertyForView.bhk) {
            setSnackbarMessage("Property details (type/BHK) not found for checklist. Please re-select property.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const newChecklistItem = {
                property_id: currentPropertyId,
                type: selectedPropertyForView.type, // <--- Now reliably gets type from selectedPropertyForView
                bhk_type: selectedPropertyForView.bhk, // <--- Now reliably gets bhk from selectedPropertyForView
                room_name: newRoomType.trim(),
                components: JSON.stringify(newComponents), // Components must be JSON string for DB
            };

            await axios.post("/checklist", newChecklistItem);

            // --- Re-fetch both properties and checklists for full UI update ---
            const [propertyResponse, checklistResponse] = await Promise.all([
                axios.get("/properties/data"),
                axios.get("/checklist"),
            ]);
            setProperties((propertyResponse.data || []).map(p => ({ ...p, id: String(p.id) })));
            setChecklist((checklistResponse.data || []).map(item => ({ ...item, id: String(item.id), property_id: String(item.property_id) })));

            setSnackbarMessage(`Room '${newRoomType}' added successfully! Add another or click Done.`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            // Reset room form fields for next entry
            setNewRoomType("");
            setNewComponents([]);
            setCurrentComponentInput("");
        } catch (err) {
            console.error("Error adding room checklist:", err);
            let errorMessage = "Failed to add room checklist. Check your backend API.";
            if (err.response) {
                errorMessage = `Server Error ${err.response.status}: ${err.response.data.message || err.response.data || 'Unknown backend error'}`;
            } else if (err.request) {
                errorMessage = "No response from server. Is the backend running?";
            } else {
                errorMessage = `Request setup error: ${err.message}`;
            }
            setError(errorMessage);
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Helper to filter checklist items for a specific property
    const getChecklistForProperty = (propertyId) => checklist.filter((item) => String(item.property_id) === String(propertyId));

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // --- Conditional Rendering for Initial Load/Error ---
    if (loading && properties.length === 0 && !error) {
        return (
            <ThemeProvider theme={theme}>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default, py: 6 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="textSecondary">Loading Data...</Typography>
            </Box>
            </ThemeProvider>
        );
    }

    if (error && properties.length === 0) { // Only show full error page if no properties loaded at all
        return (
            <ThemeProvider theme={theme}>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default, p: 3 }}>
                <Alert severity="error" sx={{ mb: 2, maxWidth: '600px', width: '100%' }}>{error}</Alert>
                <Typography variant="body1" color="textSecondary" align="center">
                    This app requires a running backend API at `http://localhost:3000/api` to connect to your MySQL database.
                </Typography>
            </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', py: 6, px: 2 }}>
                <Box sx={{ mx: "auto", maxWidth: 1200, p: 3, pt: 0 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                        Property Management Dashboard
                    </Typography>

                    <Button variant="contained" color="primary" onClick={handlePropertyDialogOpen} startIcon={<AddIcon />} sx={{ mb: 3 }} disabled={loading}>
                        Add New Property
                    </Button>

                    {loading && properties.length === 0 ? ( // Show loading spinner only if no data is present
                        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
                    ) : (
                        // Only show table or no properties message if not loading or if error occurred (handled above)
                        properties.length === 0 ? (
                            <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 4 }}>
                                No properties found. Click "Add New Property" to get started.
                            </Typography>
                        ) : (
                            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Table stickyHeader aria-label="property management table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Property Name</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>BHK</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {properties.map((property) => (
                                            <TableRow key={property.id}>
                                                <TableCell>{property.id}</TableCell>
                                                <TableCell>{property.name}</TableCell>
                                                <TableCell>{property.type}</TableCell>
                                                <TableCell>{property.bhk}</TableCell>
                                                <TableCell>
                                                    {/* Display location from parsed object if it's an object, otherwise display as is */}
                                                    {property.location && typeof property.location === 'object'
                                                        ? `${property.location.address || ''}, ${property.location.city || ''}${property.location.state ? `, ${property.location.state}` : ''}`
                                                        : property.location || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" color="primary" size="small" startIcon={<VisibilityIcon />} onClick={() => handleViewChecklistOpen(property)}>
                                                        View Checklist
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    )}
                </Box>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
                </Snackbar>

                <Dialog open={propertyDialogOpen} onClose={handlePropertyDialogClose}>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth select label="Property Type" name="type" value={newProperty.type} onChange={handlePropertyInputChange} margin="normal" size="small" required>
                            {propertyTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                        </TextField>
                        <TextField fullWidth label="Property Name" name="name" value={newProperty.name} onChange={handlePropertyInputChange} margin="normal" size="small" required />
                        <TextField fullWidth select label="BHK Type" name="bhk" value={newProperty.bhk} onChange={handlePropertyInputChange} margin="normal" size="small" required>
                            {bhkOptions.map((bhk) => (<MenuItem key={bhk} value={bhk}>{bhk}</MenuItem>))}
                        </TextField>
                        {/* --- Location fields for structured input --- */}
                        <TextField fullWidth label="Address" name="location.address" value={newProperty.location.address} onChange={handlePropertyInputChange} margin="normal" size="small" required />
                        <TextField fullWidth label="City" name="location.city" value={newProperty.location.city} onChange={handlePropertyInputChange} margin="normal" size="small" required />
                        <TextField fullWidth label="State" name="location.state" value={newProperty.location.state} onChange={handlePropertyInputChange} margin="normal" size="small" required />

                        {/* --- NEW: Image URL Input Field --- */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Property Images (URLs):</Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                            <TextField
                                fullWidth
                                label="Image URL (e.g., https://example.com/image.jpg)"
                                value={currentImageUrlInput}
                                onChange={(e) => setCurrentImageUrlInput(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                                margin="dense"
                                size="small"
                            />
                            <Button variant="outlined" onClick={addImageUrl} sx={{ ml: 1, flexShrink: 0 }} size="small" startIcon={<AddIcon />}>
                                Add
                            </Button>
                        </Box>
                        {newProperty.properties_image.length > 0 && (
                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                                <Typography variant="subtitle2" sx={{ ml: 1, mb: 0.5, color: 'text.secondary' }}>Added Images:</Typography>
                                <List dense disablePadding>
                                    {newProperty.properties_image.map((url, index) => (
                                        <ListItem key={index} secondaryAction={<IconButton edge="end" onClick={() => removeImageUrl(index)} size="small"><CloseIcon fontSize="small" /></IconButton>}>
                                            <ListItemText primary={url} primaryTypographyProps={{ variant: 'body2', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePropertyDialogClose} color="secondary" variant="outlined">Cancel</Button>
                        <Button onClick={handlePropertySubmit} color="primary" variant="contained" disabled={loading}>Submit Property</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={roomDialogOpen} onClose={handleRoomDialogClose}>
                    <DialogTitle>Add Room Checklist for Property ID: {currentPropertyId}</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Define rooms and their components for the new property.</Typography>
                        <TextField fullWidth select label="Room Type" value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)} margin="normal" size="small" required>
                            {roomTypes.map((room) => (<MenuItem key={room} value={room}>{room}</MenuItem>))}
                        </TextField>
                        <Box display="flex" alignItems="center" mb={1}>
                            <TextField fullWidth label="Component (e.g., Sofa)" value={currentComponentInput} onChange={handleComponentInputChange} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComponentToList(); } }} margin="dense" size="small" />
                            <Button variant="outlined" onClick={addComponentToList} sx={{ ml: 1, flexShrink: 0 }} size="small" startIcon={<AddIcon />}>Add</Button>
                        </Box>
                        {newComponents.length > 0 && (
                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                                <Typography variant="subtitle2" sx={{ ml: 1, mb: 0.5, color: 'text.secondary' }}>Components:</Typography>
                                <List dense disablePadding>
                                    {newComponents.map((comp, index) => (
                                        <ListItem key={index} secondaryAction={<IconButton edge="end" onClick={() => removeComponentFromList(index)} size="small"><CloseIcon fontSize="small" /></IconButton>}>
                                            <ListItemText primary={comp} primaryTypographyProps={{ variant: 'body2' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleRoomChecklistSubmit} color="primary" variant="contained" disabled={loading}>Add This Room</Button>
                        <Button onClick={handleRoomDialogClose} color="secondary" variant="outlined">Done</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={viewChecklistDialogOpen} onClose={handleViewChecklistClose} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedPropertyForView ? `${selectedPropertyForView.name} Checklist` : 'Checklist'}
                        <IconButton aria-label="close" onClick={handleViewChecklistClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedPropertyForView ? (
                            <>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Type: {selectedPropertyForView.type} | BHK: {selectedPropertyForView.bhk} | Location: {selectedPropertyForView.location && typeof selectedPropertyForView.location === 'object' ? `${selectedPropertyForView.location.address || ''}, ${selectedPropertyForView.location.city || ''}${selectedPropertyForView.location.state ? `, ${selectedPropertyForView.location.state}` : ''}` : selectedPropertyForView.location || 'N/A'}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.primary.main }}>Room Checklist Items:</Typography>
                                {getChecklistForProperty(selectedPropertyForView.id).length > 0 ? (
                                    <List disablePadding>
                                        {getChecklistForProperty(selectedPropertyForView.id).map((item) => (
                                            <ListItem key={item.id} sx={{ px: 0, py: 0.5, display: 'block' }}>
                                                <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>{item.room_name}:</Typography>
                                                <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2, listStyleType: 'disc' }}>
                                                    {(() => {
                                                        try {
                                                            // Ensure item.components is parsed if it's a string from DB
                                                            const components = typeof item.components === 'string' ? JSON.parse(item.components) : item.components;
                                                            return Array.isArray(components) && components.length > 0
                                                                ? components.map((c, i) => <Typography component="li" variant="body2" key={i} sx={{ ml: 1 }}>{c}</Typography>)
                                                                : <Typography component="li" variant="body2" sx={{ ml: 1, fontStyle: 'italic' }}>No components</Typography>;
                                                        } catch (e) {
                                                            return <Typography component="li" variant="body2" sx={{ ml: 1, fontStyle: 'italic' }}>Invalid data</Typography>;
                                                        }
                                                    })()}
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No room checklist items defined.</Typography>
                                )}
                            </>
                        ) : (
                            <Typography>No property selected.</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleViewChecklistClose} color="primary" variant="outlined">Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
};
// change for git

export default Properties;
