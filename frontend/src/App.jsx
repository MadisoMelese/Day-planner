import React from 'react'
import { gql, useQuery } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';
import WorkspaceDetail from './pages/WorkspaceDetail';

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
      <div className="text-white min-h-screen bg-gray-900">
        <nav className="p-4 flex justify-center gap-6 bg-gray-800">
          <Link to="/login" className="hover:text-blue-400">Login</Link>
          <Link to="/register" className="hover:text-green-400">Register</Link>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
<Route path="/workspace/:id" element={<WorkspaceDetail />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App

