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

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async (type) => {
    try {
      setDownloadLoading(true);
      setDownloadError('');
      
      const res = await axios.get(`http://localhost:5000/reports/download/${type}`, {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `simulation-report-${new Date().toISOString().split('T')[0]}.${type === 'xlsx' ? 'csv' : type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadError(`Failed to download ${type.toUpperCase()} report. Please try again.`);
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getResultSummary = (simulation) => {
    if (simulation.status !== 'completed' || !simulation.result) {
      return '-';
    }

    try {
      const result = JSON.parse(simulation.result);
      return (
        <span className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? 'Success' : 'Failed'}
        </span>
      );
    } catch {
      return 'N/A';
    }
  };

  const getSeverityBadge = (severity) => {
    const severityClasses = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityClasses[severity] || severityClasses.medium}`}>
        {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Medium'}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Viewer Dashboard</h1>
      <p className="mb-4">You have read-only access to simulation data.</p>

      {/* Download Buttons */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => handleDownload('pdf')}
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              'Download PDF Report'
            )}
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => handleDownload('xlsx')}
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              'Download Excel Report'
            )}
          </button>
        </div>
        
        {downloadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {downloadError}
          </div>
        )}
      </div>

      {/* Simulations Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-left font-medium">#</th>
              <th className="border p-3 text-left font-medium">Simulation Name</th>
              <th className="border p-3 text-left font-medium">Threat Type</th>
              <th className="border p-3 text-left font-medium">Status</th>
              <th className="border p-3 text-left font-medium">Severity</th>
              <th className="border p-3 text-left font-medium">Cloud Region</th>
              <th className="border p-3 text-left font-medium">Result</th>
              <th className="border p-3 text-left font-medium">Launched By</th>
              <th className="border p-3 text-left font-medium">Created</th>
              <th className="border p-3 text-left font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {simulations.length > 0 ? (
              simulations.map((sim, index) => (
                <tr key={sim.id} className="hover:bg-gray-50">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3 font-medium">{sim.simulationName || 'Unnamed Simulation'}</td>
                  <td className="border p-3">{sim.config?.threatType || sim.simulationType}</td>
                  <td className="border p-3">{getStatusBadge(sim.status)}</td>
                  <td className="border p-3">{getSeverityBadge(sim.config?.severity)}</td>
                  <td className="border p-3">{sim.config?.cloudRegion || 'N/A'}</td>
                  <td className="border p-3">{getResultSummary(sim)}</td>
                  <td className="border p-3">{sim.Launcher?.username || `User ${sim.launchedBy}`}</td>
                  <td className="border p-3 text-xs">{formatDate(sim.createdAt)}</td>
                  <td className="border p-3 text-xs">{formatDate(sim.updatedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="border p-6 text-center text-gray-500">
                  No simulations found. Simulations launched by analysts and admins will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {simulations.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {simulations.length} simulation{simulations.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
