import React, { useState, useEffect } from 'react';
import { X, Wallet, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { usePolkadot } from '../hooks/usePolkadot';

const WalletPanel = ({ onClose }) => {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    accounts, 
    error, 
    connectWallet, 
    disconnect, 
    switchAccount,
    switchNetwork,
    currentNetwork,
    networks,
    getBalance 
  } = usePolkadot();
  
  const [balances, setBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const fetchBalances = async () => {
    if (!account?.address) return;
    
    setLoadingBalances(true);
    const newBalances = {};
    
    for (const [networkKey, network] of Object.entries(networks)) {
      try {
        const balance = await getBalance(networkKey, account.address);
        if (balance) {
          newBalances[networkKey] = balance;
        }
      } catch (error) {
        console.error(`Failed to fetch balance for ${networkKey}:`, error);
      }
    }
    
    setBalances(newBalances);
    setLoadingBalances(false);
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchBalances();
    }
  }, [isConnected, account]);

  const formatBalance = (balance, decimals) => {
    if (!balance) return '0';
    const divisor = Math.pow(10, decimals);
    const formatted = (parseInt(balance) / divisor).toFixed(4);
    return parseFloat(formatted).toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Wallet size={20} />
              <span>Wallet Connection</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect to Polkadot ecosystem
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
        <div className="p-6">
          {!isConnected ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} className="text-pink-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 text-sm">
                  Connect your Polkadot.js extension or other compatible wallet to start building workflows.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet size={16} />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500">
                <p>Supported wallets:</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <span>Polkadot.js</span>
                  <span>•</span>
                  <span>Talisman</span>
                  <span>•</span>
                  <span>SubWallet</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Connected Account Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Connected Account</h3>
                  <button
                    onClick={disconnect}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {account?.meta?.name || 'Account'}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      {copiedAddress ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">
                    {account?.address}
                  </p>
                </div>
              </div>

              {/* Account Selector */}
              {accounts.length > 1 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Switch Account
                  </h4>
                  <select 
                    onChange={(e) => switchAccount(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    value={accounts.findIndex(acc => acc.address === account?.address)}
                  >
                    {accounts.map((acc, index) => (
                      <option key={acc.address} value={index}>
                        {acc.meta?.name || `Account ${index + 1}`} - {acc.address.slice(0, 6)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Network Balances */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Balances</h4>
                  <button
                    onClick={fetchBalances}
                    disabled={loadingBalances}
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center space-x-1"
                  >
                    <RefreshCw size={14} className={loadingBalances ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.entries(networks).map(([networkKey, network]) => {
                    const balance = balances[networkKey];
                    return (
                      <div
                        key={networkKey}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{network.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({network.symbol})</span>
                        </div>
                        <div className="text-right">
                          {loadingBalances ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
                          ) : balance ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {formatBalance(balance.free, balance.decimals)} {balance.symbol}
                              </div>
                              {balance.reserved !== '0' && (
                                <div className="text-xs text-gray-500">
                                  Reserved: {formatBalance(balance.reserved, balance.decimals)}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;