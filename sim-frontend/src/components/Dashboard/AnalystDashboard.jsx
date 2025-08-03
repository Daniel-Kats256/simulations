import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimulationForm from '../SimulationForm';

export default function AnalystDashboard() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchSimulations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/simulations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Fetched simulations:', res.data);
      setSimulations(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ Error fetching simulations:', err);
      setError('Failed to load simulations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
    
    // Auto-refresh every 3 seconds for more frequent updates
    const interval = setInterval(fetchSimulations, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'running': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'initializing': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const formatResult = (result) => {
    if (!result) return 'Pending...';
    
    try {
      const parsed = JSON.parse(result);
      
      if (parsed.error) {
        return `❌ Error: ${parsed.error}`;
      }
      
      if (parsed.success !== undefined) {
        return parsed.success ? '✅ Success' : '❌ Failed';
      }
      
      if (parsed.status === 'initializing') {
        return '🔄 Initializing...';
      }
      
      if (parsed.status === 'no_data') {
        return '📊 No Data';
      }
      
      return '📊 Completed';
    } catch (e) {
      console.error('Error parsing result:', e);
      return result.length > 50 ? result.substring(0, 50) + '...' : result;
    }
  };

  const formatDuration = (createdAt, updatedAt, status) => {
    if (status === 'pending' || status === 'running' || status === 'initializing') {
      const start = new Date(createdAt);
      const now = new Date();
      const diffMs = now - start;
      const seconds = Math.floor(diffMs / 1000);
      return `${seconds}s (running)`;
    }
    
    if (updatedAt && createdAt) {
      const start = new Date(createdAt);
      const end = new Date(updatedAt);
      const diffMs = end - start;
      const seconds = Math.floor(diffMs / 1000);
      return `${seconds}s`;
    }
    
    return 'N/A';
  };

  const getMetricsSummary = (result) => {
    if (!result) return '';
    
    try {
      const parsed = JSON.parse(result);
      
      if (parsed.metrics) {
        const metrics = parsed.metrics;
        
        switch (parsed.simulationType) {
          case 'DDoS':
            return `${metrics.requestsPerSecond?.toLocaleString() || 0} req/s`;
          case 'Malware':
            return `${metrics.detectionRate || 0}% detection`;
          case 'Phishing':
            return `${metrics.clickRate || 0}% click rate`;
          case 'Ransomware':
            return `${metrics.filesEncrypted || 0} files`;
          case 'SQL Injection':
            return `${metrics.queriesAttempted || 0} queries`;
          default:
            return '📊 Metrics available';
        }
      }
      
      return '';
    } catch (e) {
      return '';
    }
  };

  const showDetailedResults = (simulation) => {
    try {
      const parsed = JSON.parse(simulation.result);
      
      let details = `Simulation: ${simulation.simulationName}\n`;
      details += `Type: ${simulation.simulationType}\n`;
      details += `Status: ${simulation.status}\n`;
      details += `Created: ${new Date(simulation.createdAt).toLocaleString()}\n\n`;
      
      if (parsed.error) {
        details += `Error: ${parsed.error}\n`;
        if (parsed.message) details += `Message: ${parsed.message}\n`;
      } else if (parsed.metrics) {
        details += 'Metrics:\n';
        Object.entries(parsed.metrics).forEach(([key, value]) => {
          details += `  ${key}: ${value}\n`;
        });
      }
      
      if (parsed.details?.performance) {
        details += '\nPerformance:\n';
        Object.entries(parsed.details.performance).forEach(([key, value]) => {
          details += `  ${key}: ${value}\n`;
        });
      }
      
      alert(details);
    } catch (e) {
      alert(`Raw result: ${simulation.result}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Analyst Dashboard</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <SimulationForm />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">🧪 Simulation History</h2>
            <p className="text-gray-600 text-sm mt-1">
              Auto-refreshes every 3 seconds • Last refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={fetchSimulations}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading && simulations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Loading simulations...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 font-medium text-gray-900">#</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Result</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Metrics</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Duration</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Created</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map((sim, index) => (
                  <tr key={sim.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{sim.simulationName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {sim.simulationType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(sim.status)}</td>
                    <td className="px-4 py-3">{formatResult(sim.result)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {getMetricsSummary(sim.result)}
                    </td>
                    <td className="px-4 py-3">{formatDuration(sim.createdAt, sim.updatedAt, sim.status)}</td>
                    <td className="px-4 py-3">{new Date(sim.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => showDetailedResults(sim)}
                        className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {simulations.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-gray-500">
                      No simulations found. Launch your first simulation above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
