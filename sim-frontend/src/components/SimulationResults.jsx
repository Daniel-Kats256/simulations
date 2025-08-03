import React from 'react';

export default function SimulationResults({ simulation, onClose }) {
  if (!simulation) return null;

  let parsedResult = null;
  try {
    parsedResult = typeof simulation.result === 'string' 
      ? JSON.parse(simulation.result) 
      : simulation.result;
  } catch (e) {
    console.error('Error parsing simulation result:', e);
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'running': return '⏳';
      case 'pending': return '⌛';
      default: return '❓';
    }
  };

  const getMetricsDisplay = (metrics, simulationType) => {
    if (!metrics) return null;

    const metricsConfig = {
      'DDoS': {
        'requestsPerSecond': { label: 'Requests/Second', unit: ' req/s', icon: '🔥' },
        'targetResponseTime': { label: 'Response Time', unit: 'ms', icon: '⏱️' },
        'successfulBlocks': { label: 'Blocks', unit: '%', icon: '🛡️' },
        'duration': { label: 'Duration', unit: 's', icon: '⏳' }
      },
      'Malware': {
        'detectionRate': { label: 'Detection Rate', unit: '%', icon: '🔍' },
        'filesScanned': { label: 'Files Scanned', unit: ' files', icon: '📁' },
        'threatsFound': { label: 'Threats Found', unit: ' threats', icon: '⚠️' },
        'quarantined': { label: 'Quarantined', unit: ' items', icon: '🔒' }
      },
      'Phishing': {
        'emailsSent': { label: 'Emails Sent', unit: ' emails', icon: '📧' },
        'clickRate': { label: 'Click Rate', unit: '%', icon: '👆' },
        'credentialsHarvested': { label: 'Credentials', unit: ' accounts', icon: '🎣' },
        'detected': { label: 'Detection', unit: '', icon: '🔎' }
      },
      'Ransomware': {
        'filesEncrypted': { label: 'Files Encrypted', unit: ' files', icon: '🔐' },
        'encryptionTime': { label: 'Encryption Time', unit: 's', icon: '⏱️' },
        'detectionTime': { label: 'Detection Time', unit: 's', icon: '🔍' },
        'recoveryPossible': { label: 'Recovery Possible', unit: '', icon: '💾' }
      },
      'SQL Injection': {
        'queriesAttempted': { label: 'Queries Attempted', unit: ' queries', icon: '🗃️' },
        'successful': { label: 'Successful', unit: ' queries', icon: '✅' },
        'dataExfiltrated': { label: 'Data Exfiltrated', unit: ' records', icon: '📊' },
        'blocked': { label: 'Blocked', unit: '', icon: '🚫' }
      }
    };

    const config = metricsConfig[simulationType] || {};

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => {
          const metricConfig = config[key] || { label: key, unit: '', icon: '📊' };
          let displayValue = value;
          
          if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else if (typeof value === 'number' && metricConfig.unit === '%') {
            displayValue = value;
          }

          return (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {metricConfig.icon} {metricConfig.label}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {displayValue}{metricConfig.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getStatusIcon(simulation.status)} Simulation Results
              </h2>
              <p className="text-gray-600">{simulation.simulationName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Simulation Type</div>
              <div className="text-lg font-bold text-blue-900">{simulation.simulationType}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Status</div>
              <div className="text-lg font-bold text-green-900">
                {getStatusIcon(simulation.status)} {simulation.status}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Started</div>
              <div className="text-lg font-bold text-purple-900">
                {new Date(simulation.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Configuration */}
          {simulation.config && Object.keys(simulation.config).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Configuration</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(simulation.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {parsedResult && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Results</h3>
              
              {/* Success/Failure Banner */}
              <div className={`p-4 rounded-lg mb-4 ${
                parsedResult.success 
                  ? 'bg-green-100 border border-green-200' 
                  : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {parsedResult.success ? '✅' : '❌'}
                  </span>
                  <div>
                    <div className={`font-bold ${
                      parsedResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {parsedResult.success ? 'Simulation Successful' : 'Simulation Failed'}
                    </div>
                    <div className={`text-sm ${
                      parsedResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parsedResult.message || 'No additional message'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {parsedResult.metrics && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">📈 Metrics</h4>
                  {getMetricsDisplay(parsedResult.metrics, simulation.simulationType)}
                </div>
              )}

              {/* Timestamp */}
              {parsedResult.timestamp && (
                <div className="mt-4 text-sm text-gray-500">
                  Completed at: {new Date(parsedResult.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Raw Data (for debugging) */}
          {simulation.result && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                🔧 Raw Result Data
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <pre>{JSON.stringify(parsedResult || simulation.result, null, 2)}</pre>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}