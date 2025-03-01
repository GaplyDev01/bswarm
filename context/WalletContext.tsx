// @ts-nocheck
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { PublicKey, Commitment } from '@solana/web3.js';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { logger } from '@/lib/logger';
import { solanaRpc as solanaRpcService } from '@/lib/solana/solanaV2';
import { LAMPORTS_PER_SOL } from '@/lib/solana/v2';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Define the proper type for our wallet adapters
type WalletAdapter = PhantomWalletAdapter | SolflareWalletAdapter;

// Create a wallet context interface
interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected?: boolean; // Added for backward compatibility
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isConnecting: false,
  walletAddress: null,
  balance: 0,
  connect: async () => {},
  disconnect: async () => {},
});

// Export context hook
export const useWalletContext = () => useContext(WalletContext);

// Inner wallet provider that uses the adapter
const InnerWalletContextProvider = ({
  children,
  wallets,
}: {
  children: ReactNode;
  wallets: WalletAdapter[];
}) => {
  // Get wallet adapter from Solana
  const {
    select,
    connect: connectWallet,
    disconnect: disconnectWallet,
    connected,
    publicKey,
    connecting,
  } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const { setWalletState } = useAppStore();

  // Use the primary RPC endpoint configured in environment variables
  const primaryRpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://api.mainnet-beta.solana.com' 
      : 'https://api.devnet.solana.com');
      
  // Fetch wallet balance using our SolanaRpc service
  useEffect(() => {
    let isMounted = true;
    let subscriptionId: number | null = null;

    async function fetchBalance() {
      if (!publicKey || !connected) return;

      try {
        // Get initial balance
        const lamports = await solanaRpcService.getBalance(publicKey.toString());
        const solBalance = lamports / LAMPORTS_PER_SOL; // Convert lamports to SOL
        
        if (isMounted) {
          setBalance(solBalance);
          // Update global state
          setWalletState(connected, publicKey.toString(), solBalance);
        }
        
        logger.info(`Fetched balance for ${publicKey.toString().slice(0, 8)}...: ${solBalance} SOL`);
        
        // Set up WebSocket subscription for balance updates
        try {
          subscriptionId = await solanaRpcService.subscribeToAccount(
            publicKey.toString(),
            (accountInfo) => {
              if (!isMounted) return;
              
              const newBalance = accountInfo.lamports / LAMPORTS_PER_SOL;
              setBalance(newBalance);
              setWalletState(connected, publicKey.toString(), newBalance);
              logger.info(`Balance updated to ${newBalance} SOL`);
            }
          );
        } catch (subError) {
          logger.error('Failed to set up balance subscription:', subError);
        }
      } catch (error) {
        logger.error('Error fetching balance:', error);
        
        // Set a fallback balance for development
        if (process.env.NODE_ENV !== 'production' && isMounted) {
          const mockBalance = 5.0;
          setBalance(mockBalance);
          setWalletState(connected, publicKey.toString(), mockBalance);
          logger.warn('Using mock balance for development');
        }
      }
    }

    if (connected && publicKey) {
      fetchBalance();
    } else {
      // Reset balance when disconnected
      setBalance(0);
      setWalletState(false, null, 0);
    }

    // Cleanup subscription on unmount or when wallet changes
    return () => {
      isMounted = false;
      if (subscriptionId !== null) {
        (async () => {
          try {
            await solanaRpcService.unsubscribe(subscriptionId);
            logger.info('Unsubscribed from balance updates');
          } catch (error) {
            logger.error('Error unsubscribing from balance updates:', error);
          }
        })();
      }
    };
  }, [connected, publicKey, setWalletState]);

  // Connect wallet function
  const connect = async () => {
    try {
      logger.info('WalletContext: Connecting wallet');

      // Find available wallets
      const availableWallets = wallets.filter(
        adapter =>
          adapter.readyState === WalletReadyState.Installed ||
          adapter.readyState === WalletReadyState.Loadable
      );

      if (availableWallets.length === 0) {
        throw new Error('No wallet adapters available');
      }

      // Look for Phantom wallet first, then Solflare
      const phantomWallet = availableWallets.find(adapter =>
        adapter.name.toLowerCase().includes('phantom')
      );
      
      const walletToSelect = phantomWallet || availableWallets[0];
      logger.info('WalletContext: Selecting wallet:', walletToSelect.name);

      // Select the wallet
      select(walletToSelect.name);

      // Allow time for selection to register
      await new Promise(resolve => setTimeout(resolve, 300));

      // Connect the wallet
      await connectWallet();
      logger.info('WalletContext: Wallet connected successfully');
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet function
  const disconnect = async () => {
    try {
      await disconnectWallet();
      logger.info('WalletContext: Wallet disconnected');

      // Update state
      setBalance(0);
      setWalletState(false, null, 0);
    } catch (error) {
      logger.error('WalletContext: Failed to disconnect wallet:', error);
      throw error;
    }
  };

  // Provide the context values
  const contextValue: WalletContextType = {
    isConnected: connected,
    isConnecting: connecting,
    walletAddress: publicKey ? publicKey.toString() : null,
    balance,
    connect,
    disconnect,
    connected, // Added for backward compatibility
  };

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};

// Dynamically import the WalletContextProvider with ssr: false to prevent server-side loading
export const WalletContextProvider = dynamic(
  () =>
    Promise.resolve(({ children }: { children: ReactNode }) => {
      // Get RPC endpoint from environment
      const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://api.mainnet-beta.solana.com' 
          : 'https://api.devnet.solana.com');

      // Define supported wallets
      const wallets = useMemo(() => [
        new PhantomWalletAdapter(), 
        new SolflareWalletAdapter()
      ], []);

      // Return provider with Solana wallet adapters
      return (
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <InnerWalletContextProvider wallets={wallets}>
                {children}
              </InnerWalletContextProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      );
    }),
  { ssr: false }
);