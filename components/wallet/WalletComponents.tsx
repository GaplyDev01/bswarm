'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { Wallet as WalletIcon } from 'lucide-react';
import { logger } from '@/lib/logger';

// Enhanced connect wallet button with styling
export const EnhancedConnectWalletButton = () => {
  const { publicKey } = useWallet();

  // Logs for debugging
  logger.log('EnhancedConnectWalletButton: Rendering with wallet info:', {
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

// Create a default export as required by Next.js dynamic import
export default {
  EnhancedConnectWalletButton,
};
