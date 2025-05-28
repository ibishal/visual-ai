import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';

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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter placeholder text..."
        />
      </div>
    </div>
  );

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          {...register('model')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="gemini-2.5-flash-preview-04-17">Gemini 2.5 Flash Preview</option>
          <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro Preview</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="You are a helpful assistant..."
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="1000"
        />
      </div>
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="web-search">Web Search</option>
          <option value="calculator">Calculator</option>
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., 2 + 2 * 3"
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="text">Plain Text</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
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
              className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
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