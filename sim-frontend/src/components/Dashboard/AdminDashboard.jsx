import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [simulations, setSimulations] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch simulations
  const fetchSimulations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/simulations', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setSimulations(res.data);
    } catch (err) {
      console.error('Error fetching simulations:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Delete a simulation
  const deleteSimulation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/simulations/${id}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      fetchSimulations();
    } catch (err) {
      console.error('Failed to delete simulation:', err);
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  useEffect(() => {
    fetchSimulations();
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Simulations Management */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Manage Simulations</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Threat Type</th>
              <th className="border p-2">Region</th>
              <th className="border p-2">Severity</th>
              <th className="border p-2">Launched By</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((sim) => (
              <tr key={sim.id}>
                <td className="border p-2">{sim.id}</td>
                <td className="border p-2">{sim.config?.threatType}</td>
                <td className="border p-2">{sim.config?.cloudRegion}</td>
                <td className="border p-2">{sim.config?.severity}</td>
                <td className="border p-2">{sim.Launcher?.name || sim.launchedBy}</td>
                <td className="border p-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => deleteSimulation(sim.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Users Management */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">User ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2 capitalize">{user.role}</td>
                <td className="border p-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => deleteUser(user.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
