// src/components/Layout.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  CssBaseline // Recommended for Material-UI to reset browser styles
} from '@mui/material';
import { Dashboard, Group, Home, ListAlt, AccountCircle } from '@mui/icons-material'; // Added AccountCircle for Login if needed
import { Link, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // For default theme

// Define a simple Material-UI theme if not already defined globally
const theme = createTheme();

const drawerWidth = 233;

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard' },
    { text: 'Users', icon: <Group />, link: '/users' },
    { text: 'Properties', icon: <Home />, link: '/properties' },
    { text: 'Contact us', icon: <ListAlt />, link: '/contacts' }, // Corrected: Path matches App.js route
  ];

  const handleLogout = () => {
    // In a real application, you'd send a request to your backend to invalidate the session/token
    localStorage.removeItem('token'); // Clear token or any auth data from localStorage
    navigate('/'); // Redirect to the login page (root path)
  };

  return (
    <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
      <Box sx={{ display: 'flex' }}>
        <CssBaseline /> {/* Standard Material-UI style reset */}
        {/* AppBar (Header) */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <Box>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer (Sidebar) */}
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          variant="permanent"
          anchor="left"
        >
          {/* Toolbar is added here to push content below the AppBar, matching its height */}
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.link}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }} // Padding and width calculation
        >
          {/* Another Toolbar to push the main content below the fixed AppBar */}
          <Toolbar />
          {children} {/* This is where your page components (Dashboard, ContactUs, etc.) will render */}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;