// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LiveWalletBalance } from './WalletComponents';
import { logger } from '@/lib/logger';
import { TOKEN_PROGRAM_ID, getTransactionHistory } from '@/lib/solana/v2';
import { solanaRpc as solanaRpcService } from '@/lib/solana/solanaV2';

interface TokenAccountDisplay {
  mint: string;
  amount: number;
  decimals: number;
  displayMint: string;
}

interface TransactionDisplay {
  signature: string;
  timestamp?: string;
  success: boolean;
  shortId: string;
}

export function WalletDashboard() {
  const { publicKey, connected } = useWallet();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccountDisplay[]>([]);
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenAccounts();
      fetchTransactionHistory();
    } else {
      setTokenAccounts([]);
      setTransactions([]);
    }
  }, [connected, publicKey]);

  const fetchTokenAccounts = async () => {
    if (!publicKey) return;
    
    setIsLoadingTokens(true);
    setError(null);
    
    try {
      // Get token accounts using SolanaRpc service
      const accounts = await solanaRpcService.getTokenAccountsByOwner(
        publicKey.toString(),
        { programId: TOKEN_PROGRAM_ID }
      );
      
      // Process and filter token accounts (only show non-zero balances)
      const processedAccounts = accounts.value
        .filter(account => {
          const info = account.account.data.parsed.info;
          return info.tokenAmount.uiAmount > 0;
        })
        .map(account => {
          const info = account.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount,
            decimals: info.tokenAmount.decimals,
            // Add a short ID for display purposes
            displayMint: `${info.mint.slice(0, 4)}...${info.mint.slice(-4)}`
          };
        });
      
      setTokenAccounts(processedAccounts);
      logger.info(`Found ${processedAccounts.length} token accounts with balances`);
    } catch (err) {
      logger.error('Error fetching token accounts:', err);
      setError('Failed to load token accounts');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!publicKey) return;
    
    setIsLoadingTxs(true);
    
    try {
      // Get transaction history using v2 utility function
      const txHistory = await getTransactionHistory(publicKey.toString(), 5);
      
      // Format for display
      const formattedTxs = txHistory.map(tx => ({
        signature: tx.signature,
        timestamp: tx.timestamp,
        success: tx.success,
        shortId: `${tx.signature.slice(0, 4)}...${tx.signature.slice(-4)}`
      }));
      
      setTransactions(formattedTxs);
      logger.info(`Found ${formattedTxs.length} recent transactions`);
    } catch (err) {
      logger.error('Error fetching transaction history:', err);
      // Don't show error for transactions as it's less critical
    } finally {
      setIsLoadingTxs(false);
    }
  };

  if (!connected) {
    return (
      <div className="p-4 border border-emerald-400/20 rounded bg-sapphire-900/50 backdrop-blur">
        <h2 className="text-lg font-cyber text-emerald-400 mb-4">Wallet Dashboard</h2>
        <p className="text-emerald-400/70">Connect your wallet to view your balances and tokens</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-emerald-400/20 rounded bg-sapphire-900/50 backdrop-blur">
      <h2 className="text-lg font-cyber text-emerald-400 mb-4">Wallet Dashboard</h2>
      
      <div className="mb-4">
        <div className="text-emerald-400/70 mb-1">Connected Address</div>
        <div className="text-emerald-400 font-mono text-sm break-all">
          {publicKey?.toString()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-emerald-400/70 mb-1">SOL Balance (Live)</div>
        <LiveWalletBalance />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-emerald-400/70">Token Balances</div>
          <button 
            onClick={fetchTokenAccounts}
            disabled={isLoadingTokens}
            className="text-xs bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded"
          >
            {isLoadingTokens ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm mb-2">{error}</div>
        )}
        
        {tokenAccounts.length === 0 ? (
          <div className="text-emerald-400/50 text-sm">No tokens found</div>
        ) : (
          <div className="space-y-2">
            {tokenAccounts.map((token, index) => (
              <div key={index} className="flex justify-between py-1 border-b border-emerald-400/10">
                <span className="text-emerald-400/70">{token.displayMint}</span>
                <span className="text-emerald-400">{token.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-emerald-400/70">Recent Transactions</div>
          <button 
            onClick={fetchTransactionHistory}
            disabled={isLoadingTxs}
            className="text-xs bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded"
          >
            {isLoadingTxs ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-emerald-400/50 text-sm">No recent transactions</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <div key={index} className="flex justify-between py-1 border-b border-emerald-400/10">
                <span className="text-emerald-400/70">{tx.shortId}</span>
                <span className={tx.success ? "text-green-400" : "text-red-400"}>
                  {tx.success ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}