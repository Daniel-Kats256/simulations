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
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!simulationName.trim()) {
      errors.simulationName = 'Simulation name is required';
    } else if (simulationName.trim().length < 3) {
      errors.simulationName = 'Simulation name must be at least 3 characters';
    }
    
    if (!config.cloudRegion) {
      errors.cloudRegion = 'Cloud region is required';
    }
    
    if (!config.severity) {
      errors.severity = 'Severity level is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      showMessage('Please fix the form errors before submitting.', 'error');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      showMessage('Authentication token is missing. Please log in again.', 'error');
      return;
    }

    setIsLoading(true);
    clearMessage();

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
      
      showMessage('Simulation launched successfully! It will run in the background.', 'success');
      setSimulationName('');
      setSimulationType('DDoS');
      setConfig({
        threatType: 'DDoS',
        cloudRegion: 'us-east-1',
        severity: 'medium'
      });
      setFormErrors({});
      
      // Optionally navigate to simulations list after a delay
      setTimeout(() => {
        navigate('/dashboard/simulations');
      }, 2000);
      
    } catch (error) {
      console.error('Simulation launch error:', error);
      
      if (error.response?.data?.message) {
        showMessage(`Error: ${error.response.data.message}`, 'error');
      } else if (error.response?.status === 401) {
        showMessage('Authentication failed. Please log in again.', 'error');
      } else if (error.response?.status === 403) {
        showMessage('Access denied. You do not have permission to launch simulations.', 'error');
      } else if (error.code === 'NETWORK_ERROR') {
        showMessage('Network error. Please check your connection and try again.', 'error');
      } else {
        showMessage('Failed to launch simulation. Please try again.', 'error');
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 border rounded-xl shadow-xl mt-8 space-y-6 bg-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🛡️ Launch Cybersecurity Simulation</h2>
        <p className="text-gray-600">Configure and launch a realistic attack simulation</p>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          messageType === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="text-xl">
            {messageType === 'error' ? '❌' : messageType === 'success' ? '✅' : 'ℹ️'}
          </span>
          <span className="flex-1">{message}</span>
          <button 
            onClick={clearMessage}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <label className="block mb-2 font-medium text-gray-700">Simulation Name</label>
        <input
          type="text"
          className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            formErrors.simulationName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          value={simulationName}
          onChange={e => {
            setSimulationName(e.target.value);
            if (formErrors.simulationName) {
              setFormErrors(prev => ({ ...prev, simulationName: '' }));
            }
          }}
          placeholder="e.g., Cloud DDoS Test - Production Environment"
          required
          disabled={isLoading}
        />
        {formErrors.simulationName && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <span>⚠️</span> {formErrors.simulationName}
          </p>
        )}
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

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <span>📋</span> Simulation Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <span>⚡</span> Runs in background
          </div>
          <div className="flex items-center gap-2">
            <span>📊</span> Real-time dashboard updates
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span> 2-5 second execution
          </div>
          <div className="flex items-center gap-2">
            <span>🔄</span> Auto-refreshing results
          </div>
        </div>
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
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isLoading ? 'Launching Simulation...' : '🚀 Launch Simulation'}
        </button>
      </div>
    </form>
  );
}
