'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { Wallet as WalletIcon, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

// Enhanced connect wallet button with styling
export const EnhancedConnectWalletButton = () => {
  const { publicKey } = useWallet();

  // Logs for debugging
  logger.info('EnhancedConnectWalletButton: Rendering with wallet info:', {
    publicKey: publicKey?.toString() || 'not connected',
  });

  return (
    <div className="flex items-center">
      <div className="mr-2">
        <WalletIcon size={16} className="text-emerald-400" />
      </div>
      <ConnectWalletButton />
    </div>
  );
};

// Live wallet balance component with WebSocket updates
export const LiveWalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    let subscriptionId: number | null = null;
    
    const fetchBalance = async () => {
      if (!connected || !publicKey) {
        setBalance(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Import dynamically to prevent server-side issues
        const { solanaRpc } = await import('@/lib/solana/solanaV2');
        
        // Get initial balance
        const lamports = await solanaRpc.getBalance(publicKey.toString());
        const solBalance = lamports / 1_000_000_000; // Convert lamports to SOL
        setBalance(solBalance);
        
        // Set up subscription for real-time updates
        subscriptionId = await solanaRpc.subscribeToAccount(
          publicKey.toString(),
          (accountInfo) => {
            const newBalance = accountInfo.lamports / 1_000_000_000;
            setBalance(newBalance);
            logger.info(`Balance updated via WebSocket: ${newBalance.toFixed(4)} SOL`);
          }
        );
        
        setSubscriptionActive(true);
        logger.info(`Subscribed to SOL balance changes for ${publicKey.toString().slice(0, 8)}...`);
      } catch (error) {
        logger.error('Error setting up balance subscription:', error);
        // Try a simple balance fetch as fallback
        try {
          const { solanaRpc } = await import('@/lib/solana/solanaV2');
          const lamports = await solanaRpc.getBalance(publicKey.toString());
          const solBalance = lamports / 1_000_000_000;
          setBalance(solBalance);
        } catch (fallbackError) {
          logger.error('Error in fallback balance fetch:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    
    // Cleanup on unmount or when wallet changes
    return () => {
      if (subscriptionId !== null) {
        const cleanup = async () => {
          try {
            const { solanaRpc } = await import('@/lib/solana/solanaV2');
            await solanaRpc.unsubscribe(subscriptionId);
            logger.info('Unsubscribed from balance updates');
          } catch (error) {
            logger.error('Error unsubscribing from balance updates:', error);
          }
        };
        cleanup();
        setSubscriptionActive(false);
      }
    };
  }, [connected, publicKey]);
  
  const handleRefresh = async () => {
    if (!connected || !publicKey) return;
    
    setIsRefreshing(true);
    try {
      const { solanaRpc } = await import('@/lib/solana/solanaV2');
      const lamports = await solanaRpc.getBalance(publicKey.toString());
      const solBalance = lamports / 1_000_000_000;
      setBalance(solBalance);
      logger.info(`Balance refreshed manually: ${solBalance.toFixed(4)} SOL`);
    } catch (error) {
      logger.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (!connected) {
    return <div className="text-gray-400 text-sm">Not connected</div>;
  }
  
  if (isLoading) {
    return <div className="text-emerald-400/70 text-sm">Loading balance...</div>;
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="text-emerald-400 font-mono">
        {balance !== null ? `${balance.toFixed(4)} SOL` : 'Error loading balance'}
      </div>
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="text-emerald-400/70 hover:text-emerald-400 transition-colors"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
      {subscriptionActive && (
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" 
             title="Live updates active" />
      )}
    </div>
  );
};

// Create a default export as required by Next.js dynamic import
export default {
  EnhancedConnectWalletButton,
  LiveWalletBalance
};
