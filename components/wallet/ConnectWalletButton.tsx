'use client';

import React, { useState } from 'react';
import { useWalletContext } from '@/context/WalletContext';
import { useAppStore } from '@/lib/store';
import { logger } from '@/lib/logger';

export function ConnectWalletButton() {
  const { isConnected, isConnecting, walletAddress, connect, disconnect, balance } = useWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Connect using WalletContext adapter first
      await connect();
      logger.info('Wallet connected successfully');
    } catch (err: any) {
      logger.error('Failed to connect wallet:', err);
      setError('Could not connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await disconnect();
      logger.info('Wallet disconnected successfully');
    } catch (err: any) {
      logger.error('Failed to disconnect wallet:', err);
      setError('Could not disconnect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : '';
  
  const displayBalance = balance.toFixed(2);

  // Show loading state
  if (isConnecting || isLoading) {
    return (
      <button disabled className="px-4 py-2 rounded bg-emerald-700/50 text-emerald-100 cursor-wait">
        <span className="animate-pulse">Connecting...</span>
      </button>
    );
  }

  // When connected, show address and balance
  if (isConnected && walletAddress) {
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
          <span className="text-sm text-emerald-300">{displayAddress}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-emerald-400 mr-2">{displayBalance} SOL</span>
          <button 
            onClick={handleDisconnect}
            className="text-xs px-2 py-1 rounded bg-red-900/30 hover:bg-red-800/50 text-red-300 transition"
          >
            Disconnect
          </button>
        </div>
        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      </div>
    );
  }

  // Default: Show connect button
  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 rounded bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 font-cyber transition"
    >
      Connect Wallet
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </button>
  );
}