import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimulationForm from '../SimulationForm';

export default function AnalystDashboard() {
  const [simulations, setSimulations] = useState([]);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/simulations', {
  headers: { Authorization: 'Bearer ' + token }
});


        setSimulations(res.data);
      } catch (err) {
        console.error('Error fetching simulations:', err);
      }
    };

    fetchSimulations();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Analyst Dashboard</h1>

      <div className="bg-white p-4 rounded shadow-md mb-8">
        <SimulationForm />
      </div>

      <h2 className="text-2xl font-semibold mb-4">🧪 Simulation History</h2>
      <div className="overflow-auto">
        <table className="w-full border-collapse border text-sm text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Threat Type</th>
              <th className="border px-3 py-2">Region</th>
              <th className="border px-3 py-2">Severity</th>
              <th className="border px-3 py-2">Duration</th>
              <th className="border px-3 py-2">Provider</th>
              <th className="border px-3 py-2">Service</th>
              <th className="border px-3 py-2">Access Level</th>
              <th className="border px-3 py-2">Result</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((sim, index) => (
              <tr key={sim.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">{sim.config?.threatType}</td>
                <td className="border px-3 py-2">{sim.config?.cloudRegion}</td>
                <td className="border px-3 py-2">{sim.config?.severity}</td>
                <td className="border px-3 py-2">{sim.config?.duration}</td>
                <td className="border px-3 py-2">{sim.config?.provider}</td>
                <td className="border px-3 py-2">{sim.config?.service}</td>
                <td className="border px-3 py-2">{sim.config?.accessLevel}</td>
                <td className="border px-3 py-2">{sim.result}</td>
                <td className="border px-3 py-2">{sim.status}</td>
                <td className="border px-3 py-2">{new Date(sim.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {simulations.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  No simulations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
