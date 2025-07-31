// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'viewer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('User registered successfully');
      setError('');
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'viewer',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSuccess('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
      {success && <p className="text-green-600 mb-2 text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="border px-3 py-2 rounded"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="border px-3 py-2 rounded"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
