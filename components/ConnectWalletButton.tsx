// @ts-nocheck
'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/context/WalletContext';
import { logger } from '@/lib/logger';

interface ConnectWalletButtonProps {
  variant?: 'default' | 'outline' | 'agent' | 'secondary';
  fullWidth?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function ConnectWalletButton({
  variant = 'agent',
  fullWidth = false,
  size = 'default',
  className = '',
}: ConnectWalletButtonProps) {
  const { connect, disconnect, isConnected, isConnecting, walletAddress } = useWalletContext();

  // CSS classes based on variant
  const getButtonClasses = () => {
    if (variant === 'agent') {
      return 'bg-gradient-to-r from-[rgb(var(--agent-primary))]/80 to-[rgb(var(--agent-primary))]/60 text-black font-medium hover:opacity-90';
    }
    return '';
  };

  const handleClick = () => {
    logger.log('ConnectWalletButton: Button clicked');
    logger.log('ConnectWalletButton: Current state -', {
      isConnected,
      isConnecting,
      walletAddress,
    });

    if (isConnected) {
      logger.log('ConnectWalletButton: Attempting to disconnect wallet');
      disconnect();
    } else {
      logger.log('ConnectWalletButton: Attempting to connect wallet');
      connect().catch(error => {
        logger.error('ConnectWalletButton: Error connecting wallet:', error);
      });
    }
  };

  return (
    <Button
      variant={variant !== 'agent' ? variant : 'default'}
      size={size}
      onClick={handleClick}
      disabled={isConnecting}
      className={`${getButtonClasses()} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <Wallet className={`${size !== 'icon' ? 'mr-2' : ''} h-4 w-4`} />
      {size !== 'icon' &&
        (isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect Wallet')}
    </Button>
  );
}
