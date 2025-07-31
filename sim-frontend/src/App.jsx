// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AnalystDashboard from './components/Dashboard/AnalystDashboard';
import ViewerDashboard from './components/Dashboard/ViewerDashboard';
import AuthPage from './components/Auth/AuthPage';
import Navbar from './components/Navbar';

// Wrapper to inject navigation
const LoginWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    // Redirect based on role
    if (role === 'admin') navigate('/admin');
    else if (role === 'analyst') navigate('/analyst');
    else if (role === 'viewer') navigate('/viewer');
    else navigate('/login'); // fallback
  };

  return <Login onLogin={handleLogin} />;
};

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
     <Routes>
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/analyst" element={<AnalystDashboard />} />
  <Route path="/viewer" element={<ViewerDashboard />} />
  <Route path="*" element={<AuthPage />} />
</Routes>
    </Router>
  );
};

export default App;
