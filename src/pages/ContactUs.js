// src/pages/ContactUs.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress, // For loading indicator
  Alert,             // For success/error messages
  Grid
} from '@mui/material';

const ContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing contacts when the component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/admins/contacts');
        setContacts(response.data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []); // Empty dependency array means this runs once on mount

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prevContact) => ({ ...prevContact, [name]: value }));
  };

  // Add a new contact
  const handleAddContact = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError('');
    setSuccess('');

    // Basic client-side validation
    if (!newContact.name || !newContact.email || !newContact.phone) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('/api/admins/contacts', newContact);
      setContacts((prevContacts) => [...prevContacts, response.data]); // Add the new contact to the list
      setNewContact({ name: '', email: '', phone: '' }); // Clear the form
      setSuccess('Contact added successfully!');
    } catch (err) {
      console.error('Error adding contact:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to add contact: ${err.response.data.message}`);
      } else {
        setError('Failed to add contact. Please try again.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Contact Information
      </Typography>

      {/* Messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Add New Contact
            </Typography>
            <form onSubmit={handleAddContact}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="name"
                value={newContact.name}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                name="email"
                value={newContact.email}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                margin="normal"
                name="phone"
                value={newContact.phone}
                onChange={handleInputChange}
                required
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Add Contact
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Existing Contacts
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : contacts.length === 0 ? (
              <Typography variant="body1">No contact information available.</Typography>
            ) : (
              <List>
                {contacts.map((contact) => (
                  <ListItem key={contact.id} divider>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {contact.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Email: {contact.email}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Phone: {contact.phone}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactUs;