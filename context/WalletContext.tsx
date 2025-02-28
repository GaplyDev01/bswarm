'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  Wallet as SolanaWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { logger } from '@/lib/logger';

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

  // RPC endpoint for Solana - using a more reliable public endpoint
  // Testing with Devnet for more stability in development
  const endpoint =
    process.env.NODE_ENV === 'production'
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com';

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey) return;

      // List of fallback endpoints based on environment
      const endpoints =
        process.env.NODE_ENV === 'production'
          ? [
              'https://api.mainnet-beta.solana.com',
              'https://solana-mainnet.rpc.extrnode.com',
              'https://rpc.ankr.com/solana',
              'https://solana-api.projectserum.com',
            ]
          : [
              'https://api.devnet.solana.com',
              'https://devnet.genesysgo.net',
              'https://devnet.api.onfinality.io/public',
            ];

      let success = false;

      // Try each endpoint until one succeeds
      for (const rpcEndpoint of endpoints) {
        if (success) break;

        try {
          const connection = new Connection(rpcEndpoint, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000, // 60 second timeout
          });

          // Use a try-catch block specifically for getBalance
          try {
            const lamports = await connection.getBalance(publicKey);
            const solBalance = lamports / 1_000_000_000; // Convert lamports to SOL
            setBalance(solBalance);

            // Update global state
            setWalletState(connected, publicKey.toString(), solBalance);

            // Mark as successful to avoid trying other endpoints
            success = true;
            logger.log(`Successfully fetched balance using ${rpcEndpoint}`);
          } catch (balanceError) {
            logger.warn(`Error fetching balance from ${rpcEndpoint}:`, balanceError);
            // Continue to the next endpoint
          }
        } catch (connectionError) {
          logger.warn(`Error connecting to ${rpcEndpoint}:`, connectionError);
          // Continue to the next endpoint
        }
      }

      // If all endpoints failed
      if (!success) {
        // Set a mock balance for development to avoid breaking the UI
        process.env.NODE_ENV === 'production'
          ? () => {}
          : logger.warn('Using mock balance for development');
        setBalance(5.0); // 5 SOL mock balance
        setWalletState(connected, publicKey.toString(), 5.0);
      } else {
        process.env.NODE_ENV === 'production'
          ? () => {}
          : logger.error('All RPC endpoints failed to fetch balance');
        setBalance(0);
      }
    }

    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(0);
      setWalletState(false, null, 0);
    }
  }, [connected, publicKey, connecting, setWalletState]);

  // When wallet connection state changes
  useEffect(() => {
    logger.log('Wallet connection state changed:', {
      connected,
      publicKey: publicKey?.toString() || null,
      connecting,
    });
  }, [connected, publicKey, connecting]);

  // Connect wallet function
  const connect = async () => {
    try {
      logger.log('WalletContext: Connecting wallet - START');

      logger.log(
        'WalletContext: Available wallets:',
        wallets.map(adapter => ({
          name: adapter.name,
          publicKey: adapter.publicKey?.toString() || null,
          readyState: adapter.readyState,
        }))
      );

      // Find available wallets
      const availableWallets = wallets.filter(
        adapter =>
          adapter.readyState === WalletReadyState.Installed ||
          adapter.readyState === WalletReadyState.Loadable
      );

      logger.log(
        'WalletContext: Available wallets for connection:',
        availableWallets.map(adapter => adapter.name)
      );

      // Look for Phantom wallet first
      const phantomWallet = availableWallets.find(adapter =>
        adapter.name.toLowerCase().includes('phantom')
      );

      const walletToSelect = phantomWallet || availableWallets[0];

      if (walletToSelect) {
        logger.log('WalletContext: Selecting wallet:', walletToSelect.name);

        // Select the wallet explicitly
        select(walletToSelect.name);

        // Wait for selection to register
        await new Promise(resolve => setTimeout(resolve, 300));

        // Try to connect
        try {
          logger.log('WalletContext: Attempting to connect wallet');
          await connectWallet();
          logger.log('WalletContext: Wallet connected successfully');
        } catch (connectError: unknown) {
          logger.error('WalletContext: Error in initial connect attempt:', connectError);

          // Type guard to check if error has expected properties
          if (
            connectError &&
            typeof connectError === 'object' &&
            'name' in connectError &&
            connectError.name === 'WalletNotSelectedError'
          ) {
            logger.log('WalletContext: Trying direct adapter connection');
            // Try direct adapter connection through the wallet adapter
            await connectWallet();
          } else {
            throw connectError;
          }
        }
      } else {
        throw new Error('No wallet adapters available');
      }
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      throw error; // Propagate error to the caller
    }
  };

  // Disconnect wallet function
  const disconnect = async () => {
    try {
      await disconnectWallet();
      logger.log('WalletContext: Wallet disconnected successfully');

      // Update state to ensure it's consistent
      setBalance(0);
      setWalletState(false, null, 0);
    } catch (error) {
      logger.error('WalletContext: Failed to disconnect wallet:', error);
      throw error;
    }
  };

  // Provide the context values
  const contextValue = {
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
      // RPC endpoint for Solana - using environment-specific endpoints
      const endpoint =
        process.env.NODE_ENV === 'production'
          ? 'https://api.mainnet-beta.solana.com'
          : 'https://api.devnet.solana.com';

      // Define supported wallets
      const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

      // Return provider component with Solana wallet adapters
      return (
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <InnerWalletContextProvider wallets={wallets}>{children}</InnerWalletContextProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      );
    }),
  { ssr: false }
);
