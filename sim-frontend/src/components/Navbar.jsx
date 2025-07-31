// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white flex gap-4">
      <Link to="/admin">Admin</Link>
      <Link to="/analyst">Analyst</Link>
      <Link to="/viewer">Viewer</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
};

export default Navbar;
