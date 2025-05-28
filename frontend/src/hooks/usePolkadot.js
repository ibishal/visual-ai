import { useState, useEffect, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

const NETWORKS = {
  polkadot: { 
    name: 'Polkadot', 
    rpc: process.env.REACT_APP_POLKADOT_RPC,
    symbol: 'DOT',
    decimals: 10
  },
  kusama: { 
    name: 'Kusama', 
    rpc: process.env.REACT_APP_KUSAMA_RPC,
    symbol: 'KSM',
    decimals: 12
  },
  acala: { 
    name: 'Acala', 
    rpc: process.env.REACT_APP_ACALA_RPC,
    symbol: 'ACA',
    decimals: 12
  },
  moonbeam: { 
    name: 'Moonbeam', 
    rpc: process.env.REACT_APP_MOONBEAM_RPC,
    symbol: 'GLMR',
    decimals: 18
  },
  astar: { 
    name: 'Astar', 
    rpc: process.env.REACT_APP_ASTAR_RPC,
    symbol: 'ASTR',
    decimals: 18
  },
};

export const usePolkadot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [apis, setApis] = useState({});
  const [currentNetwork, setCurrentNetwork] = useState('polkadot');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize APIs for different networks
  useEffect(() => {
    const initApis = async () => {
      const newApis = {};
      
      try {
        for (const [networkKey, network] of Object.entries(NETWORKS)) {
          if (network.rpc) {
            const provider = new WsProvider(network.rpc);
            const api = await ApiPromise.create({ provider });
            newApis[networkKey] = api;
          }
        }
        setApis(newApis);
      } catch (error) {
        console.error('Failed to initialize APIs:', error);
        setError('Failed to connect to networks');
      }
    };

    initApis();

    // Cleanup
    return () => {
      Object.values(apis).forEach(api => {
        if (api?.disconnect) {
          api.disconnect();
        }
      });
    };
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable extension
      const extensions = await web3Enable('Polkadot Agent Builder');
      
      if (extensions.length === 0) {
        throw new Error('No wallet extension found. Please install Polkadot.js extension.');
      }

      // Get accounts
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet.');
      }

      setAccounts(allAccounts);
      setAccount(allAccounts[0]); // Use first account by default
      setIsConnected(true);

      // Store connection state
      localStorage.setItem('polkadot-connected', 'true');
      localStorage.setItem('polkadot-account', JSON.stringify(allAccounts[0]));
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setAccounts([]);
    localStorage.removeItem('polkadot-connected');
    localStorage.removeItem('polkadot-account');
  }, []);

  const switchAccount = useCallback((accountIndex) => {
    if (accounts[accountIndex]) {
      setAccount(accounts[accountIndex]);
      localStorage.setItem('polkadot-account', JSON.stringify(accounts[accountIndex]));
    }
  }, [accounts]);

  const switchNetwork = useCallback((networkKey) => {
    if (NETWORKS[networkKey]) {
      setCurrentNetwork(networkKey);
    }
  }, []);

  const getBalance = useCallback(async (networkKey, address) => {
    const api = apis[networkKey];
    if (!api || !address) return null;

    try {
      const { data: balance } = await api.query.system.account(address);
      const network = NETWORKS[networkKey];
      
      return {
        free: balance.free.toString(),
        reserved: balance.reserved.toString(),
        frozen: balance.frozen.toString(),
        symbol: network.symbol,
        decimals: network.decimals,
      };
    } catch (error) {
      console.error(`Failed to get balance for ${networkKey}:`, error);
      return null;
    }
  }, [apis]);

  const getTokenInfo = useCallback(async (networkKey, tokenSymbol) => {
    const api = apis[networkKey];
    if (!api) return null;

    try {
      // Get token info from chain metadata
      const metadata = api.registry.getChainProperties();
      return {
        symbol: tokenSymbol,
        decimals: metadata?.tokenDecimals?.[0] || NETWORKS[networkKey].decimals,
        name: metadata?.tokenSymbol?.[0] || tokenSymbol,
      };
    } catch (error) {
      console.error(`Failed to get token info:`, error);
      return null;
    }
  }, [apis]);

  const submitTransaction = useCallback(async (networkKey, extrinsic, accountAddress) => {
    const api = apis[networkKey];
    if (!api || !account) return null;

    try {
      const injector = await web3FromAddress(accountAddress);
      
      return new Promise((resolve, reject) => {
        extrinsic.signAndSend(accountAddress, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve({
              blockHash: result.status.asInBlock.toString(),
              txHash: extrinsic.hash.toString(),
            });
          } else if (result.status.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });
    } catch (error) {
      console.error('Transaction submission failed:', error);
      throw error;
    }
  }, [apis, account]);

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('polkadot-connected');
    const savedAccount = localStorage.getItem('polkadot-account');
    
    if (wasConnected && savedAccount) {
      connectWallet();
    }
  }, [connectWallet]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    account,
    accounts,
    error,
    
    // APIs and networks
    apis,
    currentNetwork,
    networks: NETWORKS,
    
    // Actions
    connectWallet,
    disconnect,
    switchAccount,
    switchNetwork,
    
    // Blockchain operations
    getBalance,
    getTokenInfo,
    submitTransaction,
  };
};