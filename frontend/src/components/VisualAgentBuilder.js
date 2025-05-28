import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
} from '@xyflow/react';
import { Play, Save, Upload, Settings } from 'lucide-react';

import Sidebar from './Sidebar';
import CustomNode from './nodes/CustomNode';
import ConfigModal from './ConfigModal';
import { useStore } from '../store/useStore';
import { executeWorkflow } from '../utils/workflowExecutor';

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
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState({});
  
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const { addNode, updateNodeData } = useStore();

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
          model: process.env.REACT_APP_DEFAULT_MODEL || 'gemini-2.0-flash',
          temperature: 0.7,
          systemPrompt: 'You are a helpful assistant.',
          maxTokens: 1000,
        };
      case 'tool':
        return { toolType: 'web-search', query: '' };
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

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to execute the workflow');
      return;
    }

    setIsExecuting(true);
    setExecutionResults({});

    try {
      const results = await executeWorkflow(nodes, edges);
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
    } catch (error) {
      console.error('Workflow execution failed:', error);
      alert('Workflow execution failed: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('workflow', JSON.stringify(workflow));
    alert('Workflow saved successfully!');
  };

  const handleLoadWorkflow = () => {
    const saved = localStorage.getItem('workflow');
    if (saved) {
      const workflow = JSON.parse(saved);
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      alert('Workflow loaded successfully!');
    } else {
      alert('No saved workflow found');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visual Agent Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Drag nodes from the sidebar to build your AI workflow
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
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
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors"
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
    </div>
  );
};

export default VisualAgentBuilder;