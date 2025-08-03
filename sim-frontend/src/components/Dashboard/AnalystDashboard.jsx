import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import SimulationForm from '../SimulationForm';
import SimulationResultsModal from '../SimulationResultsModal';

export default function AnalystDashboard() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSimulations = useCallback(async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        return;
      }

      const res = await axios.get('http://localhost:5000/api/simulations', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });

      setSimulations(res.data);
    } catch (err) {
      console.error('Error fetching simulations:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        // Could redirect to login here
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view simulations.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (!navigator.onLine) {
        setError('You appear to be offline. Please check your internet connection.');
      } else {
        setError('Failed to load simulations. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulations();
    
    // Auto-refresh every 5 seconds to show real-time updates
    const interval = setInterval(() => fetchSimulations(true), 5000);
    
    return () => clearInterval(interval);
  }, [fetchSimulations]);

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'running': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
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
      if (parsed.success !== undefined) {
        return parsed.success ? '✅ Success' : '❌ Failed';
      }
      return '📊 Completed';
    } catch {
      return result.length > 50 ? result.substring(0, 50) + '...' : result;
    }
  };

  const formatDuration = (createdAt, updatedAt, status) => {
    if (status === 'pending' || status === 'running') {
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

  const stats = useMemo(() => {
    const baseStats = {
      total: simulations.length,
      running: simulations.filter(s => s.status === 'running').length,
      completed: simulations.filter(s => s.status === 'completed').length,
      failed: simulations.filter(s => s.status === 'failed').length,
      pending: simulations.filter(s => s.status === 'pending').length
    };

    const typeStats = simulations.reduce((acc, sim) => {
      acc[sim.simulationType] = (acc[sim.simulationType] || 0) + 1;
      return acc;
    }, {});

    return { ...baseStats, typeStats };
  }, [simulations]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Analyst Dashboard</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">Total Simulations</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.completed}</div>
          <div className="text-sm opacity-90">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.running}</div>
          <div className="text-sm opacity-90">Running</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.failed}</div>
          <div className="text-sm opacity-90">Failed</div>
        </div>
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-sm opacity-90">Pending</div>
        </div>
      </div>

      {/* Simulation Types Distribution */}
      {Object.keys(stats.typeStats).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3">📊 Simulation Types Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(stats.typeStats).map(([type, count]) => (
              <div key={type} className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-lg">{count}</div>
                <div className="text-xs text-gray-600">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <SimulationForm />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">🧪 Simulation History</h2>
              <p className="text-gray-600 text-sm mt-1">Auto-refreshes every 5 seconds</p>
            </div>
            {isRefreshing && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading && simulations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Loading simulations...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-lg font-medium">{error}</p>
              </div>
              <button
                onClick={fetchSimulations}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Try Again
              </button>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(sim.status)}
                        {sim.status === 'running' && (
                          <div className="flex items-center space-x-1">
                            <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="text-xs text-blue-600">Processing...</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatResult(sim.result)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <span>{formatDuration(sim.createdAt, sim.updatedAt, sim.status)}</span>
                        {sim.status === 'running' && (
                          <div className="w-12 bg-gray-200 rounded-full h-1.5 ml-2">
                            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{new Date(sim.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {sim.result && (
                        <button 
                          onClick={() => {
                            setSelectedSimulation(sim);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {simulations.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-gray-500">
                      No simulations found. Launch your first simulation above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Simulation Results Modal */}
      <SimulationResultsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSimulation(null);
        }}
        simulation={selectedSimulation}
      />
    </div>
  );
}
