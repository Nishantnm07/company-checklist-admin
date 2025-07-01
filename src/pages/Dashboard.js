import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Paper, // Using Paper for the summary cards
  Button, // For potential logout or other actions
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BlockIcon from "@mui/icons-material/Block";
import LogoutIcon from "@mui/icons-material/Logout"; // For a logout button example

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]); // New state for properties
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true); // New loading state

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Users
      try {
        const usersResponse = await axios.get("http://localhost:3000/api/user");
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }

      // Fetch Properties
      try {
        const propertiesResponse = await axios.get("http://localhost:3000/api/properties"); // Assuming this endpoint gives all properties
        setProperties(propertiesResponse.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Derived states (counts)
  const totalUsers = users.length;
  const blockedUsers = users.filter(user => user.status === 'Blocked').length;
  const totalProperties = properties.length;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Box>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {loadingUsers ? <CircularProgress size={24} color="inherit" /> : totalUsers}
              </Typography>
            </Box>
            <PersonIcon sx={{ fontSize: 60, opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Total Properties Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px',
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <Box>
              <Typography variant="h6">Total Properties</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {loadingProperties ? <CircularProgress size={24} color="inherit" /> : totalProperties}
              </Typography>
            </Box>
            <HomeWorkIcon sx={{ fontSize: 60, opacity: 0.8 }} />
          </Paper>
        </Grid>

        {/* Blocked Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <Box>
              <Typography variant="h6">Blocked Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {loadingUsers ? <CircularProgress size={24} color="inherit" /> : blockedUsers}
              </Typography>
            </Box>
            <BlockIcon sx={{ fontSize: 60, opacity: 0.8 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Users Management Section */}
      <Grid item xs={12}>
        <Card elevation={4} sx={{ borderRadius: "12px", overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="h5" component="div" sx={{ marginBottom: "20px", fontWeight: 'bold', color: 'text.primary' }}>
              User Management
            </Typography>
            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading Users...</Typography>
              </Box>
            ) : (
              <Table sx={{ minWidth: 650 }} aria-label="users table">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ width: "10%", fontWeight: "bold", color: 'text.secondary' }}>ID</TableCell>
                    <TableCell sx={{ width: "20%", fontWeight: "bold", color: 'text.secondary' }}>Name</TableCell>
                    <TableCell sx={{ width: "30%", fontWeight: "bold", color: 'text.secondary' }}>Email</TableCell>
                    <TableCell sx={{ width: "15%", fontWeight: "bold", color: 'text.secondary' }}>Phone</TableCell>
                    <TableCell sx={{ width: "15%", fontWeight: "bold", color: 'text.secondary' }}>Status</TableCell>
                    <TableCell sx={{ width: "10%", fontWeight: "bold", color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell component="th" scope="row">
                        {user.id}
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: user.status === 'Blocked' ? 'error.main' : 'success.main',
                            fontWeight: 'bold',
                          }}
                        >
                          {user.status || 'Active'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {/* Placeholder for Block/Unblock and Delete actions */}
                        <Button
                          size="small"
                          variant="outlined"
                          color={user.status === 'Blocked' ? 'success' : 'warning'}
                          sx={{ mr: 1 }}
                          onClick={() => console.log(`Toggle status for ${user.id}`)} // Add actual API call here
                        >
                          {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => console.log(`Delete user ${user.id}`)} // Add actual API call here
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && !loadingUsers && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          No users found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Example Logout Button (can be placed elsewhere as needed) */}
      <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: '8px', p: 1.5 }}
          onClick={() => console.log("Logout action")}
        >
          Logout
        </Button>
      </Grid>
    </Box>
  );
};

export default Dashboard;