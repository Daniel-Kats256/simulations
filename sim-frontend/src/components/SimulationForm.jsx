import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export default function SimulationForm() {
  const [simulationName, setSimulationName] = useState('');
  const [simulationType, setSimulationType] = useState('DDoS');
  const [status, setStatus] = useState('pending');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assuming userId is stored on login

    if (!userId) {
      setMessage('User ID is missing. Please log in again.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/simulations',
        {
          simulationName,
          simulationType,
          launchedBy: parseInt(userId),
          status,
          result,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );
      setMessage('Simulation launched successfully.');
      setSimulationName('');
      setSimulationType('DDoS');
      setStatus('pending');
      setResult('');
    } catch (error) {
      console.error(error);
      setMessage('Failed to launch simulation.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Launch Simulation</h2>
      {message && <p className="text-sm text-red-600">{message}</p>}

      <div>
        <label className="block mb-1 font-medium">Simulation Name</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={simulationName}
          onChange={e => setSimulationName(e.target.value)}
          placeholder="e.g., Cloud DDoS Test"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Simulation Type</label>
        <select
          className="border p-2 rounded w-full"
          value={simulationType}
          onChange={e => setSimulationType(e.target.value)}
        >
          <option value="DDoS">DDoS</option>
          <option value="Malware">Malware</option>
          <option value="Phishing">Phishing</option>
          <option value="Ransomware">Ransomware</option>
          <option value="SQL Injection">SQL Injection</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Status</label>
        <select
          className="border p-2 rounded w-full"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Result (optional)</label>
        <textarea
          className="border p-2 rounded w-full"
          value={result}
          onChange={e => setResult(e.target.value)}
          placeholder="Leave blank if not yet completed"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Launch Simulation
        </button>
      </div>

    </form>
  );
}
