// @ts-nocheck
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

export function ConnectWalletButton() {
  const {
    wallets,
    select,
    connected,
    publicKey,
    connecting: adapterConnecting,
    wallet,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [selectedWalletName, setSelectedWalletName] = useState<WalletName | null>(null);

  // When component mounts, try to select Phantom wallet first
  useEffect(() => {
    // Only run on first load and if no wallet is selected yet
    if (!wallet && wallets.length > 0 && !selectedWalletName) {
      // Find all available wallets (ready to use)
      const availableWallets = wallets.filter(
        w =>
          w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
      );

      if (availableWallets.length > 0) {
        // Try to find Phantom first, fall back to first available
        const phantomWallet = availableWallets.find(w =>
          w.adapter.name.toLowerCase().includes('phantom')
        );

        const walletToSelect = phantomWallet || availableWallets[0];
        logger.log('Auto-selecting wallet:', walletToSelect.adapter.name);

        // Store the selected wallet name
        setSelectedWalletName(walletToSelect.adapter.name);
        // Select the wallet
        select(walletToSelect.adapter.name);
      }
    }
  }, [wallets, wallet, select, selectedWalletName]);

  const handleConnect = useCallback(async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      logger.log('Button: Connect button clicked');

      // Use the wallet adapter directly
      await connectWallet();

      logger.log('Button: Wallet connected successfully via adapter');
// @ts-ignore
    } catch (error: Event) {
      logger.error('Button: Failed to connect wallet:', error);

      // Check if wallet extension is actually installed
      if (
        error.name === 'WalletNotFoundError' ||
        (error.message && error.message.includes('not found'))
      ) {
        alert('Wallet extension not found. Please install Phantom or Solflare extension.');
      } else if (error.name === 'WalletNotSelectedError') {
        alert(
          'Unable to select wallet. Please make sure your Phantom or Solflare extension is working properly.'
        );
      } else {
        alert(`Error connecting wallet: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setConnecting(false);
    }
  }, [connecting, connectWallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      logger.log('Button: Disconnect button clicked');
      await disconnectWallet();
      logger.log('Button: Wallet disconnected successfully');
    } catch (error) {
      logger.error('Button: Failed to disconnect wallet:', error);
    }
  }, [disconnectWallet]);

  // If connected, show the connected state
  if (connected && publicKey) {
    return (
      <div className="relative group">
        <button className="px-4 py-2 text-sm bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 font-cyber uppercase tracking-wide hover:bg-emerald-400/30 transition">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </button>

        <div className="absolute right-0 mt-2 w-56 p-2 bg-sapphire-800 backdrop-blur-md shadow-xl border border-emerald-400/20 z-10 hidden group-hover:block">
          <div className="p-3 text-xs text-emerald-400/70">
            <p className="font-cyber text-emerald-400 mb-2 uppercase tracking-wide">
              Connected Wallet
            </p>
            <p className="break-all mb-3 font-mono">{publicKey.toString()}</p>
            <button
              onClick={handleDisconnect}
              className="w-full text-center px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition text-xs font-cyber uppercase tracking-wide"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`px-4 py-2 text-sm border border-emerald-400/30 font-cyber uppercase tracking-wide transition ${
        connecting
          ? 'bg-emerald-400/5 text-emerald-400/50 cursor-not-allowed'
          : 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
      }`}
      onClick={handleConnect}
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
