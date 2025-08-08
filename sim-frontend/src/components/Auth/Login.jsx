import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      const { token, role, name, user } = res.data;

      if (!user || !user.id) {
        throw new Error('User info is missing in the response.');
      }

      // ✅ Store user info securely in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('role', role);
      localStorage.setItem('username', user.username || username); // fallback

      // ✅ Navigate based on user role
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'analyst':
          navigate('/analyst');
          break;
        case 'viewer':
          navigate('/viewer');
          break;
        default:
          setError('Unknown role received from server.');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
       <h1 className="mb-5 mt-5 flex justify-center items-center text-2xl font-bold">
        <FaShieldAlt className="mr-2" />
        SimulateSec
      </h1>
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
