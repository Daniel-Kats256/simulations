import React from 'react';

export default function SimulationResultsModal({ isOpen, onClose, simulation }) {
  if (!isOpen || !simulation) return null;

  let parsedResult = null;
  try {
    parsedResult = typeof simulation.result === 'string' 
      ? JSON.parse(simulation.result) 
      : simulation.result;
  } catch (error) {
    console.error('Failed to parse simulation result:', error);
  }

  const getMetricsDisplay = (metrics, simulationType) => {
    if (!metrics) return null;

    const metricLabels = {
      'DDoS': {
        requestsPerSecond: 'Requests/Second',
        targetResponseTime: 'Response Time (ms)',
        successfulBlocks: 'Successful Blocks (%)',
        duration: 'Duration (seconds)'
      },
      'Malware': {
        detectionRate: 'Detection Rate (%)',
        filesScanned: 'Files Scanned',
        threatsFound: 'Threats Found',
        quarantined: 'Files Quarantined'
      },
      'Phishing': {
        emailsSent: 'Emails Sent',
        clickRate: 'Click Rate (%)',
        credentialsHarvested: 'Credentials Harvested',
        detected: 'Detected by Security'
      },
      'Ransomware': {
        filesEncrypted: 'Files Encrypted',
        encryptionTime: 'Encryption Time (min)',
        detectionTime: 'Detection Time (min)',
        recoveryPossible: 'Recovery Possible'
      },
      'SQL Injection': {
        queriesAttempted: 'Queries Attempted',
        successful: 'Successful Attacks',
        dataExfiltrated: 'Data Exfiltrated (MB)',
        blocked: 'Attack Blocked'
      }
    };

    const labels = metricLabels[simulationType] || {};

    return Object.entries(metrics).map(([key, value]) => (
      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600 font-medium">
          {labels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:
        </span>
        <span className="font-semibold text-gray-900">
          {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}
        </span>
      </div>
    ));
  };

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const getStatusText = (success) => {
    return success ? 'Success' : 'Failed';
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            🧪 Simulation Results
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{simulation.simulationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {simulation.simulationType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">
                  {new Date(simulation.createdAt).toLocaleString()}
                </span>
              </div>
              {simulation.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">
                    {new Date(simulation.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {parsedResult ? (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Result:</span>
                    <span className={`font-bold text-lg ${getStatusColor(parsedResult.success)}`}>
                      {getStatusIcon(parsedResult.success)} {getStatusText(parsedResult.success)}
                    </span>
                  </div>
                  {parsedResult.message && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-blue-800 text-sm">{parsedResult.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {parsedResult.metrics && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Metrics</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {getMetricsDisplay(parsedResult.metrics, simulation.simulationType)}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {parsedResult.timestamp && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Timeline</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Execution Time:</span>
                      <span className="font-medium">
                        {new Date(parsedResult.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Raw Results</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {simulation.result || 'No results available yet.'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}