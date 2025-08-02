import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SimulationForm() {
  const [simulationName, setSimulationName] = useState('');
  const [simulationType, setSimulationType] = useState('DDoS');
  const [config, setConfig] = useState({
    threatType: 'DDoS',
    cloudRegion: 'us-east-1',
    severity: 'medium'
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Authentication token is missing. Please log in again.');
      return;
    }

    if (!simulationName.trim()) {
      setMessage('Simulation name is required.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/simulations',
        {
          simulationName: simulationName.trim(),
          simulationType,
          config
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      setMessage('Simulation launched successfully! It will run in the background.');
      setSimulationName('');
      setSimulationType('DDoS');
      setConfig({});
      
      // Optionally navigate to simulations list after a delay
      setTimeout(() => {
        navigate('/dashboard/simulations');
      }, 2000);
      
    } catch (error) {
      console.error('Simulation launch error:', error);
      
      if (error.response?.data?.message) {
        setMessage(`Error: ${error.response.data.message}`);
      } else if (error.response?.status === 401) {
        setMessage('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setMessage('Access denied. You do not have permission to launch simulations.');
      } else {
        setMessage('Failed to launch simulation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const simulationDescriptions = {
    'DDoS': 'Distributed Denial of Service attack simulation - tests system resilience under high traffic load',
    'Malware': 'Malware detection simulation - tests antivirus and security monitoring systems',
    'Phishing': 'Phishing attack simulation - tests user awareness and email security filters',
    'Ransomware': 'Ransomware attack simulation - tests backup systems and recovery procedures',
    'SQL Injection': 'SQL injection attack simulation - tests database security and input validation'
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 border rounded-lg shadow-lg mt-8 space-y-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-800">Launch Cybersecurity Simulation</h2>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div>
        <label className="block mb-2 font-medium text-gray-700">Simulation Name</label>
        <input
          type="text"
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={simulationName}
          onChange={e => setSimulationName(e.target.value)}
          placeholder="e.g., Cloud DDoS Test - Production Environment"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Simulation Type</label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={simulationType}
          onChange={e => {
            setSimulationType(e.target.value);
            setConfig(prev => ({ ...prev, threatType: e.target.value }));
          }}
          disabled={isLoading}
        >
          <option value="DDoS">DDoS Attack</option>
          <option value="Malware">Malware Detection</option>
          <option value="Phishing">Phishing Campaign</option>
          <option value="Ransomware">Ransomware Attack</option>
          <option value="SQL Injection">SQL Injection</option>
        </select>
        <p className="text-sm text-gray-600 mt-1">
          {simulationDescriptions[simulationType]}
        </p>
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Cloud Region</label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={config.cloudRegion}
          onChange={e => setConfig(prev => ({ ...prev, cloudRegion: e.target.value }))}
          disabled={isLoading}
        >
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-west-2">US West (Oregon)</option>
          <option value="eu-west-1">Europe (Ireland)</option>
          <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Severity Level</label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={config.severity}
          onChange={e => setConfig(prev => ({ ...prev, severity: e.target.value }))}
          disabled={isLoading}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Simulation Details</h3>
        <p className="text-sm text-gray-600">
          • This simulation will run in the background<br/>
          • Results will be available in the simulations dashboard<br/>
          • Execution time: 2-5 seconds<br/>
          • Status updates in real-time
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          disabled={isLoading}
        >
          Back
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={isLoading}
        >
          {isLoading ? 'Launching...' : 'Launch Simulation'}
        </button>
      </div>
    </form>
  );
}
