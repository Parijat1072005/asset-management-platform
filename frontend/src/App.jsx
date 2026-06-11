import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Bookings from './pages/Bookings';
import Approvals from './pages/Approvals';
import History from './pages/History';
import Auth from './pages/Auth';
import Users from './pages/Users';

function App() {
  // Check localStorage on initial load to see if a token exists
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If a token exists, load the user details into state
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Auth onLogin={handleLogin} />} />
        </Routes>
      ) : (
        // Replace the authenticated routing section in App.jsx:
        <Layout onLogout={handleLogout} user={user}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory user={user} />} />
            <Route path="/bookings" element={<Bookings user={user} />} />
            <Route path="/approvals" element={
              user?.role === 'admin' ? <Approvals user={user} /> : <Navigate to="/" replace />
            } />
            <Route path="/history" element={<History user={user} />} />

            {/* Admin Only Route */}
            <Route path="/users" element={
              user?.role === 'admin' ? <Users user={user} /> : <Navigate to="/" replace />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;