import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimulationResults from '../SimulationResults';

export default function AdminDashboard() {
  const [simulations, setSimulations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">👑 Admin Dashboard</h1>
        <p className="text-gray-600">Manage all simulations and users across the platform</p>
      </div>

      {/* Simulations Management */}
      <section className="mb-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span>🧪</span> Manage Simulations
            </h2>
            <p className="text-gray-600 text-sm mt-1">View and manage all simulations across users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead>
                 <tr className="bg-gray-50 border-b">
                   <th className="px-4 py-3 text-left font-medium text-gray-900">ID</th>
                   <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                   <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                   <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                   <th className="px-4 py-3 text-left font-medium text-gray-900">Launched By</th>
                   <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {simulations.map((sim) => (
                   <tr key={sim.id} className="border-b hover:bg-gray-50">
                     <td className="px-4 py-3">{sim.id}</td>
                     <td className="px-4 py-3 font-medium">{sim.simulationName}</td>
                     <td className="px-4 py-3">
                       <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                         {sim.simulationType}
                       </span>
                     </td>
                     <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         sim.status === 'completed' ? 'bg-green-100 text-green-800' :
                         sim.status === 'running' ? 'bg-blue-100 text-blue-800' :
                         sim.status === 'failed' ? 'bg-red-100 text-red-800' :
                         'bg-yellow-100 text-yellow-800'
                       }`}>
                         {sim.status}
                       </span>
                     </td>
                     <td className="px-4 py-3">{sim.Launcher?.name || sim.launchedBy}</td>
                     <td className="px-4 py-3 space-x-2">
                       <button
                         onClick={() => setSelectedSimulation(sim)}
                         className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                       >
                         📊 View
                       </button>
                       <button
                         className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs transition-colors"
                         onClick={() => deleteSimulation(sim.id)}
                       >
                         🗑️ Delete
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       </section>

      {/* Users Management */}
      <section>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span>👥</span> Manage Users
            </h2>
            <p className="text-gray-600 text-sm mt-1">View and manage all user accounts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-gray-900">User ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Username</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'analyst' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs transition-colors"
                        onClick={() => deleteUser(user.id)}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Simulation Results Modal */}
      {selectedSimulation && (
        <SimulationResults 
          simulation={selectedSimulation} 
          onClose={() => setSelectedSimulation(null)} 
        />
      )}
    </div>
  );
}
