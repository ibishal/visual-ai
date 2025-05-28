import React from 'react';
import { MessageSquare, Brain, Wrench, Monitor } from 'lucide-react';

const nodeTypes = [
  {
    type: 'input',
    label: 'Input',
    icon: MessageSquare,
    description: 'Text input for user queries',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    type: 'llm',
    label: 'LLM',
    icon: Brain,
    description: 'AI language model processing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    type: 'tool',
    label: 'Tool',
    icon: Wrench,
    description: 'Web search or calculator',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  {
    type: 'output',
    label: 'Output',
    icon: Monitor,
    description: 'Display results to user',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
];

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 sidebar custom-scrollbar overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Node Library</h2>
        <p className="text-sm text-gray-600">
          Drag these nodes to the canvas to build your workflow
        </p>
      </div>

      <div className="space-y-4">
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          return (
            <div
              key={nodeType.type}
              className={`${nodeType.bgColor} border-2 rounded-lg p-4 cursor-grab hover:shadow-md transition-all hover:scale-105 draggable-node`}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.type)}
            >
              <div className="flex items-start space-x-3">
                <div className={`${nodeType.color} p-2 rounded-lg bg-white shadow-sm`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {nodeType.label}
                  </h3>
                  <p className="text-sm text-gray-600 leading-snug">
                    {nodeType.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Quick Start</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Drag an Input node to start</li>
          <li>2. Add an LLM node for processing</li>
          <li>3. Connect nodes by dragging handles</li>
          <li>4. Click nodes to configure them</li>
          <li>5. Hit "Run Workflow" to execute</li>
        </ol>
      </div>
    </div>
  );
};

export default Sidebar;