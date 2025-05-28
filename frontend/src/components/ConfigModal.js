import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Info } from 'lucide-react';

const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      'gpt-4-turbo',
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'o1-preview',
      'o1-mini'
    ]
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ]
  }
};

const POLKADOT_NETWORKS = {
  polkadot: 'Polkadot',
  kusama: 'Kusama',
  acala: 'Acala',
  moonbeam: 'Moonbeam',
  astar: 'Astar',
  parallel: 'Parallel',
  centrifuge: 'Centrifuge',
  interlay: 'Interlay',
  unique: 'Unique Network'
};

const TOKENS = {
  DOT: 'Polkadot',
  KSM: 'Kusama',
  ACA: 'Acala',
  GLMR: 'Moonbeam',
  ASTR: 'Astar',
  PARA: 'Parallel',
  CFG: 'Centrifuge',
  INTR: 'Interlay',
  UNQ: 'Unique'
};

const ConfigModal = ({ node, onSave, onClose }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    // Set form values from node config
    if (node.data.config) {
      Object.entries(node.data.config).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [node, setValue]);

  const onSubmit = (data) => {
    onSave(node.id, data);
  };

  const renderInputConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Text
        </label>
        <textarea
          {...register('text')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          rows={4}
          placeholder="Enter your input text here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Placeholder
        </label>
        <input
          {...register('placeholder')}
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter placeholder text..."
        />
      </div>
    </div>
  );

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Provider
        </label>
        <select
          {...register('provider')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
            <option key={key} value={key}>{provider.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          {...register('model')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {AI_PROVIDERS[watch('provider') || 'openai']?.models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature: {watch('temperature') || 0.7}
        </label>
        <input
          {...register('temperature', { valueAsNumber: true })}
          type="range"
          min="0"
          max="2"
          step="0.1"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Focused (0)</span>
          <span>Balanced (1)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <textarea
          {...register('systemPrompt')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          rows={4}
          placeholder="You are a helpful assistant for Polkadot ecosystem analysis..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Tokens
        </label>
        <input
          {...register('maxTokens', { valueAsNumber: true })}
          type="number"
          min="1"
          max="8192"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="1000"
        />
      </div>
    </div>
  );

  const renderWalletConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action
        </label>
        <select
          {...register('action')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="connect">Connect Wallet</option>
          <option value="balance">Check Balance</option>
          <option value="disconnect">Disconnect</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Network
        </label>
        <select
          {...register('network')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {Object.entries(POLKADOT_NETWORKS).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTokenConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action
        </label>
        <select
          {...register('action')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="balance">Check Balance</option>
          <option value="transfer">Transfer</option>
          <option value="info">Token Info</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Network
        </label>
        <select
          {...register('network')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {Object.entries(POLKADOT_NETWORKS).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token
        </label>
        <select
          {...register('token')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {Object.entries(TOKENS).map(([symbol, name]) => (
            <option key={symbol} value={symbol}>{symbol} - {name}</option>
          ))}
        </select>
      </div>

      {watch('action') === 'transfer' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Address
            </label>
            <input
              {...register('toAddress')}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              {...register('amount')}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="1.0"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderSwapConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          DEX Network
        </label>
        <select
          {...register('network')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="acala">Acala DEX</option>
          <option value="stellaswap">Stellaswap (Moonbeam)</option>
          <option value="zenlink">Zenlink (Astar)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Token
          </label>
          <select
            {...register('fromToken')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            {Object.entries(TOKENS).map(([symbol, name]) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Token
          </label>
          <select
            {...register('toToken')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            {Object.entries(TOKENS).map(([symbol, name]) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <input
          {...register('amount')}
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="1.0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slippage Tolerance (%)
        </label>
        <input
          {...register('slippage')}
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="0.5"
        />
      </div>
    </div>
  );

  const renderStakingConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action
        </label>
        <select
          {...register('action')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="nominate">Nominate Validators</option>
          <option value="bond">Bond Tokens</option>
          <option value="unbond">Unbond Tokens</option>
          <option value="chill">Stop Nominating</option>
          <option value="info">Staking Info</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Network
        </label>
        <select
          {...register('network')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="polkadot">Polkadot</option>
          <option value="kusama">Kusama</option>
        </select>
      </div>

      {(watch('action') === 'nominate' || watch('action') === 'bond') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            {...register('amount')}
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="10"
          />
        </div>
      )}

      {watch('action') === 'nominate' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validator Addresses (one per line)
          </label>
          <textarea
            {...register('validators')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            rows={4}
            placeholder="Enter validator addresses..."
          />
        </div>
      )}
    </div>
  );

  const renderGovernanceConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action
        </label>
        <select
          {...register('action')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="list-referenda">List Active Referenda</option>
          <option value="vote">Vote on Referendum</option>
          <option value="delegate">Delegate Voting Power</option>
          <option value="treasury">Treasury Proposals</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Network
        </label>
        <select
          {...register('network')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="polkadot">Polkadot</option>
          <option value="kusama">Kusama</option>
        </select>
      </div>

      {watch('action') === 'vote' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referendum ID
            </label>
            <input
              {...register('referendumId')}
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vote
            </label>
            <select
              {...register('vote')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="aye">Aye (Yes)</option>
              <option value="nay">Nay (No)</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderToolConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tool Type
        </label>
        <select
          {...register('toolType')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="web-search">Web Search</option>
          <option value="calculator">Calculator</option>
          <option value="price-api">Crypto Price API</option>
        </select>
      </div>

      {watch('toolType') === 'web-search' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <input
            {...register('query')}
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Enter search query..."
          />
        </div>
      )}

      {watch('toolType') === 'calculator' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expression
          </label>
          <input
            {...register('expression')}
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="e.g., 2 + 2 * 3"
          />
        </div>
      )}

      {watch('toolType') === 'price-api' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Symbol
          </label>
          <input
            {...register('symbol')}
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="DOT, KSM, ACA..."
          />
        </div>
      )}
    </div>
  );

  const renderOutputConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Format
        </label>
        <select
          {...register('format')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="text">Plain Text</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
          <option value="table">Table</option>
        </select>
      </div>
    </div>
  );

  const getConfigComponent = () => {
    switch (node.data.nodeType) {
      case 'input':
        return renderInputConfig();
      case 'llm':
        return renderLLMConfig();
      case 'wallet':
        return renderWalletConfig();
      case 'token':
        return renderTokenConfig();
      case 'swap':
        return renderSwapConfig();
      case 'staking':
        return renderStakingConfig();
      case 'governance':
        return renderGovernanceConfig();
      case 'tool':
        return renderToolConfig();
      case 'output':
        return renderOutputConfig();
      default:
        return <div>No configuration available for this node type.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configure {node.data.label} Node
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize the behavior and settings for this node
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {getConfigComponent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;