import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  MiniMap,
} from '@xyflow/react';
import { Play, Save, Upload, Settings, Wallet, Zap, Activity } from 'lucide-react';

import Sidebar from './Sidebar';
import CustomNode from './nodes/CustomNode';
import ConfigModal from './ConfigModal';
import WalletPanel from './WalletPanel';
import ExecutionPanel from './ExecutionPanel';
import { useStore } from '../store/useStore';
import { executeWorkflow } from '../utils/workflowExecutor';
import { usePolkadot } from '../hooks/usePolkadot';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const VisualAgentBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState({});
  const [executionLogs, setExecutionLogs] = useState([]);
  
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const { addNode, updateNodeData } = useStore();
  const { isConnected, account, connectWallet, disconnect } = usePolkadot();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          nodeType: type,
          config: getDefaultConfig(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      addNode(newNode);
    },
    [screenToFlowPosition, setNodes, addNode]
  );

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'input':
        return { text: '', placeholder: 'Enter input text...' };
      case 'llm':
        return {
          provider: process.env.REACT_APP_DEFAULT_PROVIDER || 'openai',
          model: process.env.REACT_APP_DEFAULT_MODEL || 'gpt-4-turbo',
          temperature: 0.7,
          systemPrompt: 'You are a helpful assistant for Polkadot ecosystem analysis.',
          maxTokens: 1000,
        };
      case 'tool':
        return { toolType: 'web-search', query: '' };
      case 'wallet':
        return { action: 'connect', network: 'polkadot' };
      case 'token':
        return { 
          action: 'balance', 
          network: 'polkadot', 
          token: 'DOT',
          address: ''
        };
      case 'swap':
        return {
          network: 'acala',
          fromToken: 'DOT',
          toToken: 'ACA',
          amount: '1',
          slippage: '0.5'
        };
      case 'staking':
        return {
          action: 'nominate',
          network: 'polkadot',
          amount: '10',
          validators: []
        };
      case 'governance':
        return {
          action: 'list-referenda',
          network: 'polkadot'
        };
      case 'xcm':
        return {
          fromChain: 'polkadot',
          toChain: 'acala',
          asset: 'DOT',
          amount: '1'
        };
      case 'nft':
        return {
          action: 'mint',
          network: 'unique',
          collection: '',
          metadata: {}
        };
      case 'output':
        return { text: '', format: 'text' };
      default:
        return {};
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConfigModal(true);
  }, []);

  const handleConfigSave = (nodeId, config) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
    updateNodeData(nodeId, config);
    setShowConfigModal(false);
    setSelectedNode(null);
  };

  const addLogEntry = (message, type = 'info') => {
    const entry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    setExecutionLogs(prev => [...prev, entry]);
  };

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to execute the workflow');
      return;
    }

    setIsExecuting(true);
    setExecutionResults({});
    setExecutionLogs([]);
    setShowExecutionPanel(true);

    addLogEntry('Starting workflow execution...', 'info');

    try {
      const results = await executeWorkflow(nodes, edges, { 
        account, 
        isConnected,
        onLog: addLogEntry 
      });
      setExecutionResults(results);

      // Update nodes with execution results
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            result: results[node.id]?.result,
            status: results[node.id]?.status,
          },
        }))
      );

      addLogEntry('Workflow execution completed successfully!', 'success');
    } catch (error) {
      console.error('Workflow execution failed:', error);
      addLogEntry(`Workflow execution failed: ${error.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      version: '2.0',
    };
    localStorage.setItem('polkadot-workflow', JSON.stringify(workflow));
    alert('Workflow saved successfully!');
  };

  const handleLoadWorkflow = () => {
    const saved = localStorage.getItem('polkadot-workflow');
    if (saved) {
      const workflow = JSON.parse(saved);
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      alert('Workflow loaded successfully!');
    } else {
      alert('No saved workflow found');
    }
  };

  const handleExportWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      version: '2.0',
    };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `polkadot-workflow-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span className="text-pink-500">●</span>
                <span>Polkadot Agent Builder</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Build AI-powered workflows for the Polkadot ecosystem
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Wallet Status */}
              <button
                onClick={() => setShowWalletPanel(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isConnected 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wallet size={16} />
                <span>{isConnected ? `${account?.address?.slice(0, 6)}...` : 'Connect'}</span>
              </button>

              {/* Execution Panel */}
              <button
                onClick={() => setShowExecutionPanel(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <Activity size={16} />
                <span>Logs</span>
              </button>
              
              <button
                onClick={handleLoadWorkflow}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>Load</span>
              </button>
              
              <button
                onClick={handleSaveWorkflow}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>

              <button
                onClick={handleExportWorkflow}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="flex items-center space-x-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-lg transition-colors"
              >
                <Play size={16} />
                <span>{isExecuting ? 'Running...' : 'Run Workflow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <Background color="#e5e7eb" gap={20} />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedNode && (
        <ConfigModal
          node={selectedNode}
          onSave={handleConfigSave}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedNode(null);
          }}
        />
      )}

      {/* Wallet Panel */}
      {showWalletPanel && (
        <WalletPanel onClose={() => setShowWalletPanel(false)} />
      )}

      {/* Execution Panel */}
      {showExecutionPanel && (
        <ExecutionPanel 
          logs={executionLogs}
          results={executionResults}
          isExecuting={isExecuting}
          onClose={() => setShowExecutionPanel(false)}
        />
      )}
    </div>
  );
};

export default VisualAgentBuilder;