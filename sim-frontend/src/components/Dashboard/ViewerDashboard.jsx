import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ViewerDashboard() {
  const [simulations, setSimulations] = useState([]);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/simulations', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setSimulations(res.data);
      } catch (err) {
        console.error('Failed to fetch simulations:', err);
      }
    };
    fetchSimulations();
  }, []);

  const handleDownload = async (type) => {
    try {
      const res = await axios.get(`http://localhost:5000/reports/download/${type}`, {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Viewer Dashboard</h1>
      <p className="mb-4">You have read-only access to simulation data.</p>

      {/* Download Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => handleDownload('pdf')}
        >
          Download PDF Report
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => handleDownload('xlsx')}
        >
          Download Excel Report
        </button>
      </div>

      {/* Simulations Table */}
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Threat Type</th>
            <th className="border p-2">Cloud Region</th>
            <th className="border p-2">Severity</th>
            <th className="border p-2">Launched By</th>
          </tr>
        </thead>
        <tbody>
          {simulations.map((sim, index) => (
            <tr key={sim.id}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{sim.config.threatType}</td>
              <td className="border p-2">{sim.config.cloudRegion}</td>
              <td className="border p-2">{sim.config.severity}</td>
              <td className="border p-2">{sim.launchedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
