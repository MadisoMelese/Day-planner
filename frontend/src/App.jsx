import React from 'react'
import { gql, useQuery } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';
import WorkspaceDetail from './pages/WorkspaceDetail';
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const TEST_QUERY = gql`
  query {
    __typename
  }
`;

const App = () => {
  const { data, loading, error } = useQuery(TEST_QUERY);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
 <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Show Navbar only when user is logged in */}
        {localStorage.getItem("token") && <Navbar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:id"
            element={
              <ProtectedRoute>
                <WorkspaceDetail />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

