import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles'; // REMOVED 'styled'
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";

// 1. Define a custom Material-UI theme for a classic look
const theme = createTheme({
  palette: {
    primary: {
      main: '#607d8b', // A sophisticated grey-blue
    },
    secondary: {
      main: '#a1887f', // A warm, muted brown
    },
    success: {
      main: '#4caf50', // Standard green for active
    },
    warning: {
      main: '#ff9800', // Standard orange for blocked
    },
    error: {
      main: '#f44336', // Standard red for error
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff', // White paper elements
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Standard Material-UI font
    h4: {
      fontWeight: 600, // Slightly bolder title
      color: '#424242', // Darker grey for headings
    },
    body2: { // For smaller text like dates
      color: '#757575',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#eeeeee', // Light grey header background
          color: '#424242', // Darker text for headers
          fontWeight: 600, // Make headers bolder
          borderBottom: '2px solid #bdbdbd', // Thicker bottom border for headers
        },
        body: {
          color: '#424242', // Standard text color for body
          fontSize: '0.875rem', // Slightly smaller font for table content
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#fafafa', // Subtle stripe effect
          },
          '&:hover': {
            backgroundColor: '#e0e0e0', // Light hover effect
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderRadius: 4, // Slightly rounded corners for buttons
          borderColor: '#bdbdbd', // Muted border color
          '&:hover': {
            borderColor: '#9e9e9e', // Darker border on hover
            backgroundColor: 'rgba(0, 0, 0, 0.04)', // Subtle background on hover
          },
        },
        sizeSmall: {
          padding: '4px 10px', // Adjust padding for small buttons
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500, // Make chip text a bit bolder
        },
      },
    },
  },
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBlock = async (id) => {
    try {
      const response = await axios.post("http://localhost:3000/api/user/block", { id });
      alert(response.data.message); // Consider using a Material-UI Dialog for a better UX
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, status: user.status === "Active" ? "Blocked" : "Active" } : user
        )
      );
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      alert("Failed to block/unblock user. Please try again."); // Consider using a Material-UI Dialog for a better UX
    }
  };

  const handleRemove = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/user/${id}`);
      alert(response.data.message); // Consider using a Material-UI Dialog for a better UX
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Failed to remove user. Please try again."); // Consider using a Material-UI Dialog for a better UX
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8} minHeight="200px" alignItems="center"> {/* Added minHeight and alignItems */}
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box mt={8} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h5" align="center" color="textSecondary"> {/* Muted color for "No users found" */}
          No users found.
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}> {/* Wrap your component with ThemeProvider */}
      <Box sx={{ mt: 6, mx: "auto", maxWidth: 1100, p: 3 }}> {/* Increased maxWidth, added padding */}
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          User Management Dashboard
        </Typography>
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}> {/* Higher elevation, rounded corners, hide overflow */}
          <Table stickyHeader aria-label="user management table"> {/* Added stickyHeader and aria-label */}
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Occupation</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>{user.occupation || 'N/A'}</TableCell>
                  <TableCell>{user.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === "Active" ? "success" : "warning"}
                      size="small"
                      sx={{ minWidth: 80 }} // Ensure consistent chip width
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.status === "Active" ? "Block User" : "Unblock User"}>
                      <Button
                        variant="outlined"
                        color={user.status === "Active" ? "warning" : "success"}
                        size="small"
                        onClick={() => handleBlock(user.id)}
                        startIcon={user.status === "Active" ? <BlockIcon /> : <CheckCircleIcon />}
                        sx={{ textTransform: 'none' }} // Prevent uppercase text
                      >
                        {user.status === "Active" ? "Block" : "Unblock"}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Remove User">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ ml: 1, textTransform: 'none' }} // Prevent uppercase text
                        onClick={() => handleRemove(user.id)}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  );
};

export default Users;