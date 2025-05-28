import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Brain, Wrench, Monitor, Settings, CheckCircle, XCircle, Clock } from 'lucide-react';

const nodeIcons = {
  input: MessageSquare,
  llm: Brain,
  tool: Wrench,
  output: Monitor,
};

const nodeColors = {
  input: 'node-input',
  llm: 'node-llm',
  tool: 'node-tool',
  output: 'node-output',
};

const CustomNode = ({ data, id, selected }) => {
  const IconComponent = nodeIcons[data.nodeType] || MessageSquare;
  const nodeColorClass = nodeColors[data.nodeType] || '';

  const getStatusIcon = () => {
    if (data.status === 'running') {
      return <Clock size={16} className="text-blue-500 animate-spin" />;
    } else if (data.status === 'completed') {
      return <CheckCircle size={16} className="text-green-500" />;
    } else if (data.status === 'error') {
      return <XCircle size={16} className="text-red-500" />;
    }
    return null;
  };

  const getNodeContent = () => {
    switch (data.nodeType) {
      case 'input':
        return (
          <div className="text-xs text-gray-600 mt-1">
            {data.config?.text || 'No input set'}
          </div>
        );
      case 'llm':
        return (
          <div className="text-xs text-gray-600 mt-1">
            Model: {data.config?.model || 'Not configured'}
          </div>
        );
      case 'tool':
        return (
          <div className="text-xs text-gray-600 mt-1">
            Type: {data.config?.toolType || 'Not configured'}
          </div>
        );
      case 'output':
        return (
          <div className="text-xs text-gray-600 mt-1">
            {data.result ? 'Result ready' : 'Waiting for input'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`custom-node ${nodeColorClass} ${selected ? 'selected' : ''} ${data.status === 'running' ? 'execution-running' : ''}`}>
      {/* Top Handle - Input (except for input nodes) */}
      {data.nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Top}
          className="react-flow__handle-top"
          style={{ background: '#6366f1' }}
        />
      )}

      {/* Node Content */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <IconComponent size={16} className="text-gray-700" />
          <span className="font-medium text-gray-900">{data.label}</span>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <Settings size={12} className="text-gray-400" />
        </div>
      </div>

      {getNodeContent()}

      {/* Result Display */}
      {data.result && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium text-gray-700 mb-1">Result:</div>
          <div className="text-gray-600 max-h-20 overflow-y-auto custom-scrollbar">
            {typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2)}
          </div>
        </div>
      )}

      {/* Bottom Handle - Output (except for output nodes) */}
      {data.nodeType !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="react-flow__handle-bottom"
          style={{ background: '#6366f1' }}
        />
      )}
    </div>
  );
};

export default CustomNode;