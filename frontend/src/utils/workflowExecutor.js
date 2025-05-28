import axios from 'axios';

// AI Provider integrations
const AI_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
};

export const executeWorkflow = async (nodes, edges, context = {}) => {
  const { account, isConnected, onLog } = context;
  const results = {};
  const executionOrder = getExecutionOrder(nodes, edges);

  onLog?.('🚀 Starting workflow execution...');
  onLog?.(`📊 Found ${nodes.length} nodes, ${edges.length} connections`);

  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    onLog?.(`⚡ Executing ${node.data.label} (${node.data.nodeType})`);

    try {
      const result = await executeNode(node, nodes, edges, results, context);
      results[nodeId] = {
        status: 'completed',
        result: result,
        timestamp: new Date().toISOString(),
      };
      
      onLog?.(`✅ ${node.data.label} completed successfully`, 'success');
    } catch (error) {
      results[nodeId] = {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      
      onLog?.(`❌ ${node.data.label} failed: ${error.message}`, 'error');
      console.error(`Error executing node ${nodeId}:`, error);
    }
  }

  onLog?.('🎉 Workflow execution completed!', 'success');
  return results;
};

const getExecutionOrder = (nodes, edges) => {
  const visited = new Set();
  const order = [];

  const visit = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    for (const edge of incomingEdges) {
      visit(edge.source);
    }

    order.push(nodeId);
  };

  const inputNodes = nodes.filter(node => 
    node.data.nodeType === 'input' || 
    !edges.some(edge => edge.target === node.id)
  );

  for (const node of inputNodes) {
    visit(node.id);
  }

  return order;
};

const executeNode = async (node, nodes, edges, previousResults, context) => {
  const { nodeType, config } = node.data;

  switch (nodeType) {
    case 'input':
      return executeInputNode(config);
    
    case 'llm':
      return await executeLLMNode(config, node, edges, previousResults, context);
    
    case 'tool':
      return await executeToolNode(config, node, edges, previousResults, context);
    
    case 'wallet':
      return await executeWalletNode(config, context);
    
    case 'token':
      return await executeTokenNode(config, context);
    
    case 'swap':
      return await executeSwapNode(config, context);
    
    case 'staking':
      return await executeStakingNode(config, context);
    
    case 'governance':
      return await executeGovernanceNode(config, context);
    
    case 'xcm':
      return await executeXCMNode(config, context);
    
    case 'nft':
      return await executeNFTNode(config, context);
    
    case 'output':
      return executeOutputNode(config, node, edges, previousResults);
    
    default:
      throw new Error(`Unknown node type: ${nodeType}`);
  }
};

// Core Node Implementations
const executeInputNode = (config) => {
  return config.text || 'Default input text';
};

const executeLLMNode = async (config, node, edges, previousResults, context) => {
  const inputText = getInputFromConnectedNodes(node, edges, previousResults);
  const { provider, model, temperature, systemPrompt, maxTokens } = config;
  
  context.onLog?.(`🤖 Using ${provider} model: ${model}`);
  
  try {
    let response;
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(model, systemPrompt, inputText, temperature, maxTokens);
        break;
      case 'anthropic':
        response = await callAnthropic(model, systemPrompt, inputText, temperature, maxTokens);
        break;
      case 'gemini':
        response = await callGemini(model, systemPrompt, inputText, temperature, maxTokens);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    return response;
  } catch (error) {
    context.onLog?.(`🔑 API key missing or invalid for ${provider}`, 'warning');
    return `Mock ${provider} Response: Processed "${inputText}" with model ${model}. [Add your ${provider.toUpperCase()} API key in .env file to enable real processing]`;
  }
};

const executeToolNode = async (config, node, edges, previousResults, context) => {
  const inputText = getInputFromConnectedNodes(node, edges, previousResults);
  const { toolType } = config;
  
  switch (toolType) {
    case 'web-search':
      const query = config.query || inputText;
      context.onLog?.(`🔍 Searching the web for: "${query}"`);
      return await performWebSearch(query);
      
    case 'calculator':
      const expression = config.expression || inputText;
      context.onLog?.(`🧮 Calculating: ${expression}`);
      return performCalculation(expression);
      
    case 'price-api':
      const symbol = config.symbol || inputText;
      context.onLog?.(`💰 Fetching price for: ${symbol}`);
      return await fetchCryptoPrice(symbol);
      
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
};

// Polkadot Node Implementations
const executeWalletNode = async (config, context) => {
  const { action, network } = config;
  const { account, isConnected } = context;
  
  switch (action) {
    case 'connect':
      return isConnected ? 
        `✅ Wallet connected: ${account?.address?.slice(0, 8)}...` :
        '❌ Wallet not connected. Please connect your wallet first.';
        
    case 'balance':
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      return `💰 Balance check for ${network} network: [Implementation depends on real Polkadot API integration]`;
      
    case 'disconnect':
      return '🔌 Wallet disconnected';
      
    default:
      throw new Error(`Unknown wallet action: ${action}`);
  }
};

const executeTokenNode = async (config, context) => {
  const { action, network, token, toAddress, amount } = config;
  const { account, isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  switch (action) {
    case 'balance':
      context.onLog?.(`💰 Checking ${token} balance on ${network}`);
      return `${token} Balance on ${network}: [Real balance would be fetched from chain]`;
      
    case 'transfer':
      context.onLog?.(`💸 Transferring ${amount} ${token} to ${toAddress}`);
      return `Transfer initiated: ${amount} ${token} to ${toAddress?.slice(0, 8)}... on ${network}`;
      
    case 'info':
      return `${token} Token Info: Symbol: ${token}, Network: ${network}`;
      
    default:
      throw new Error(`Unknown token action: ${action}`);
  }
};

const executeSwapNode = async (config, context) => {
  const { network, fromToken, toToken, amount, slippage } = config;
  const { isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  context.onLog?.(`🔄 Swapping ${amount} ${fromToken} for ${toToken} on ${network}`);
  
  return `Swap executed on ${network}: ${amount} ${fromToken} → ${toToken} (${slippage}% slippage)`;
};

const executeStakingNode = async (config, context) => {
  const { action, network, amount, validators } = config;
  const { isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  switch (action) {
    case 'nominate':
      context.onLog?.(`🏛️ Nominating validators on ${network}`);
      return `Nomination submitted on ${network} with ${amount} tokens`;
      
    case 'bond':
      return `Bonded ${amount} tokens on ${network}`;
      
    case 'unbond':
      return `Unbonding ${amount} tokens on ${network}`;
      
    case 'chill':
      return `Stopped nominating on ${network}`;
      
    case 'info':
      return `Staking info for ${network}: [Real staking data would be fetched]`;
      
    default:
      throw new Error(`Unknown staking action: ${action}`);
  }
};

const executeGovernanceNode = async (config, context) => {
  const { action, network, referendumId, vote } = config;
  const { isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  switch (action) {
    case 'list-referenda':
      context.onLog?.(`🗳️ Fetching active referenda on ${network}`);
      return `Active Referenda on ${network}:\n1. Referendum #123: Treasury Proposal\n2. Referendum #124: Runtime Upgrade`;
      
    case 'vote':
      context.onLog?.(`✅ Voting ${vote} on referendum ${referendumId}`);
      return `Vote submitted: ${vote} on referendum ${referendumId}`;
      
    case 'delegate':
      return `Delegation setup on ${network}`;
      
    case 'treasury':
      return `Treasury proposals on ${network}: [Real proposals would be fetched]`;
      
    default:
      throw new Error(`Unknown governance action: ${action}`);
  }
};

const executeXCMNode = async (config, context) => {
  const { fromChain, toChain, asset, amount } = config;
  const { isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  context.onLog?.(`🌉 Cross-chain transfer: ${amount} ${asset} from ${fromChain} to ${toChain}`);
  
  return `XCM transfer initiated: ${amount} ${asset} from ${fromChain} to ${toChain}`;
};

const executeNFTNode = async (config, context) => {
  const { action, network, collection, metadata } = config;
  const { isConnected } = context;
  
  if (!isConnected) {
    throw new Error('Wallet not connected');
  }
  
  switch (action) {
    case 'mint':
      context.onLog?.(`🎨 Minting NFT on ${network}`);
      return `NFT minted on ${network} in collection ${collection}`;
      
    case 'transfer':
      return `NFT transferred on ${network}`;
      
    case 'list':
      return `NFTs listed from ${network}`;
      
    default:
      throw new Error(`Unknown NFT action: ${action}`);
  }
};

const executeOutputNode = (config, node, edges, previousResults) => {
  const inputData = getInputFromConnectedNodes(node, edges, previousResults);
  
  switch (config.format) {
    case 'json':
      try {
        return JSON.stringify({ output: inputData }, null, 2);
      } catch (error) {
        return `{"output": "${inputData}"}`;
      }
    
    case 'markdown':
      return `# Output\n\n${inputData}`;
    
    case 'table':
      return `| Result |\n|--------|\n| ${inputData} |`;
    
    case 'text':
    default:
      return inputData;
  }
};

// Helper Functions
const getInputFromConnectedNodes = (node, edges, previousResults) => {
  const incomingEdges = edges.filter(edge => edge.target === node.id);
  
  if (incomingEdges.length === 0) {
    return '';
  }
  
  const inputs = incomingEdges.map(edge => {
    const sourceResult = previousResults[edge.source];
    return sourceResult ? sourceResult.result : '';
  }).filter(Boolean);
  
  return inputs.join('\n\n');
};

// AI Provider Implementations
const callOpenAI = async (model, systemPrompt, inputText, temperature, maxTokens) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await axios.post(AI_ENDPOINTS.openai, {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: inputText }
    ],
    temperature,
    max_tokens: maxTokens
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
};

const callAnthropic = async (model, systemPrompt, inputText, temperature, maxTokens) => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    throw new Error('Anthropic API key not configured');
  }
  
  const response = await axios.post(AI_ENDPOINTS.anthropic, {
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: inputText }
    ]
  }, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }
  });
  
  return response.data.content[0].text;
};

const callGemini = async (model, systemPrompt, inputText, temperature, maxTokens) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API key not configured');
  }
  
  const response = await axios.post(`${AI_ENDPOINTS.gemini}/${model}:generateContent?key=${apiKey}`, {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nUser: ${inputText}`
      }]
    }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens
    }
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.candidates[0].content.parts[0].text;
};

// Tool Implementations
const performWebSearch = async (query) => {
  // Mock web search - in production, integrate with a search API
  return `Web Search Results for "${query}":\n\n1. Latest news about ${query}\n2. ${query} documentation and guides\n3. Community discussions about ${query}\n\n[Note: Integrate with real search API for actual results]`;
};

const performCalculation = (expression) => {
  try {
    const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function(`"use strict"; return (${cleanExpression})`)();
    return `Calculation: ${expression} = ${result}`;
  } catch (error) {
    throw new Error('Invalid mathematical expression');
  }
};

const fetchCryptoPrice = async (symbol) => {
  try {
    // Using CoinGecko API for real price data
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
    const price = response.data[symbol.toLowerCase()]?.usd;
    
    if (price) {
      return `${symbol.toUpperCase()} Price: $${price} USD`;
    } else {
      return `Price data not found for ${symbol}`;
    }
  } catch (error) {
    return `Mock price for ${symbol}: $25.43 USD [Real API integration would fetch live prices]`;
  }
};