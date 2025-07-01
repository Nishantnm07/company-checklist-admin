// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Your main layout component

// Import all your page components
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Properties from "./pages/Properties";
import ContactUs from "./pages/ContactUs"; // Correct PascalCase naming for the component

const App = () => (
  <Router>
    <Routes>
      {/* Public Route: Login Page (no layout) */}
      <Route path="/" element={<Login />} />

      {/* Protected Routes: Pages that use the Layout */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      <Route
        path="/users"
        element={
          <Layout>
            <Users />
          </Layout>
        }
      />

      <Route
        path="/properties"
        element={
          <Layout>
            <Properties />
          </Layout>
        }
      />

      <Route
        path="/contacts" // Consistent lowercase path
        element={
          <Layout>
            <ContactUs /> {/* Use the PascalCase component name */}
          </Layout>
        }
      />

      {/* You can add a 404 Not Found page if needed */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  </Router>
);

export default App;