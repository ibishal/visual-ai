import React, { useRef, useEffect } from 'react';
import { X, Activity, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

const ExecutionPanel = ({ logs, results, isExecuting, onClose }) => {
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getLogBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Activity size={20} />
              <span>Workflow Execution</span>
              {isExecuting && (
                <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time execution logs and results
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-96">
          {/* Logs Panel */}
          <div className="flex-1 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <Activity size={16} />
                <span>Execution Logs</span>
                {isExecuting && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Running
                  </span>
                )}
              </h3>
            </div>
            
            <div className="p-4 h-full overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <Activity size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No execution logs yet</p>
                  <p className="text-sm">Logs will appear when you run a workflow</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border ${getLogBgColor(log.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Node Results</span>
              </h3>
            </div>
            
            <div className="p-4 h-full overflow-y-auto custom-scrollbar">
              {Object.keys(results).length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No results yet</p>
                  <p className="text-sm">Results will appear after execution</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(results).map(([nodeId, result]) => (
                    <div
                      key={nodeId}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          Node: {nodeId.split('-')[0]}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            result.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : result.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      
                      {result.error ? (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                          {result.error}
                        </div>
                      ) : result.result ? (
                        <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                          {typeof result.result === 'string' 
                            ? result.result 
                            : JSON.stringify(result.result, null, 2)
                          }
                        </div>
                      ) : null}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(result.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {logs.length} log entries • {Object.keys(results).length} results
          </div>
          <div className="flex items-center space-x-2">
            {isExecuting && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Executing workflow...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionPanel;