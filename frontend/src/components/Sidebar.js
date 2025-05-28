import React from 'react';
import { 
  MessageSquare, 
  Brain, 
  Wrench, 
  Monitor,
  Wallet,
  Coins,
  ArrowLeftRight,
  Shield,
  Vote,
  Shuffle,
  Image
} from 'lucide-react';

const nodeCategories = [
  {
    name: 'Core Nodes',
    nodes: [
      {
        type: 'input',
        label: 'Input',
        icon: MessageSquare,
        description: 'Text input for queries and data',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
      },
      {
        type: 'llm',
        label: 'AI Model',
        icon: Brain,
        description: 'OpenAI, Anthropic, Gemini models',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
      },
      {
        type: 'tool',
        label: 'Tool',
        icon: Wrench,
        description: 'Web search, calculator, APIs',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
      },
      {
        type: 'output',
        label: 'Output',
        icon: Monitor,
        description: 'Display results and data',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
      },
    ]
  },
  {
    name: 'Polkadot Ecosystem',
    nodes: [
      {
        type: 'wallet',
        label: 'Wallet',
        icon: Wallet,
        description: 'Connect wallets, check balances',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50 border-pink-200',
      },
      {
        type: 'token',
        label: 'Token',
        icon: Coins,
        description: 'DOT, KSM, parachain tokens',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
      },
      {
        type: 'swap',
        label: 'Swap',
        icon: ArrowLeftRight,
        description: 'DEX swaps on Acala, Stellaswap',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
      },
      {
        type: 'staking',
        label: 'Staking',
        icon: Shield,
        description: 'Nominate validators, manage stakes',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200',
      },
      {
        type: 'governance',
        label: 'Governance',
        icon: Vote,
        description: 'Referenda, treasury, council',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 border-teal-200',
      },
      {
        type: 'xcm',
        label: 'Cross-Chain',
        icon: Shuffle,
        description: 'XCM transfers between parachains',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 border-cyan-200',
      },
      {
        type: 'nft',
        label: 'NFT',
        icon: Image,
        description: 'Unique Network, RMRK operations',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50 border-rose-200',
      },
    ]
  }
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
          Drag nodes to build AI + Polkadot workflows
        </p>
      </div>

      {nodeCategories.map((category) => (
        <div key={category.name} className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            {category.name}
          </h3>
          <div className="space-y-3">
            {category.nodes.map((nodeType) => {
              const IconComponent = nodeType.icon;
              return (
                <div
                  key={nodeType.type}
                  className={`${nodeType.bgColor} border-2 rounded-lg p-3 cursor-grab hover:shadow-md transition-all hover:scale-105 draggable-node`}
                  draggable
                  onDragStart={(event) => onDragStart(event, nodeType.type)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${nodeType.color} p-1.5 rounded-lg bg-white shadow-sm`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {nodeType.label}
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug">
                        {nodeType.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center">
          <span className="text-pink-500 mr-2">●</span>
          Quick Start
        </h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Connect your Polkadot wallet</li>
          <li>2. Drag nodes to build workflows</li>
          <li>3. Configure AI models & Web3 actions</li>
          <li>4. Connect nodes and run workflow</li>
          <li>5. View results and on-chain data</li>
        </ol>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          🌟 Example Workflows
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• AI Token Analysis → Auto Swap</li>
          <li>• Governance AI → Voting Decisions</li>
          <li>• Staking Optimizer → Auto Nominate</li>
          <li>• NFT Generator → Mint on Unique</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;