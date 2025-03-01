import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { TokenInfo, WalletBalance } from './index';

export interface SolanaService {
  connectWallet(publicKey?: string): Promise<{ success: boolean; address: string | null }>;
  disconnectWallet(): Promise<boolean>;
  getTokenList(): Promise<TokenInfo[]>;
  getWalletBalances(): Promise<WalletBalance[]>;
  executeTrade(
    token: string,
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<{ success: boolean; trade: unknown }>;
  getTransactionHistory(): Promise<unknown[]>;
  setEndpoint?(endpoint: string): void;
}

export interface TokenAccount {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
}

export interface TransactionDetails {
  id: string;
  type: string;
  timestamp: number;
  status: 'confirmed' | 'failed' | 'processing' | 'error';
  [key: string]: unknown;
}

export interface TradeDetails {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
  simulation?: boolean;
  [key: string]: unknown;
}

// Type for SolanaRpc client
export interface SolanaRpcClient {
  getLatestBlockhash(commitment?: string): Promise<unknown>;
  getBlockHeight(commitment?: string): Promise<number>;
  getBalance(address: string, commitment?: string): Promise<number>;
  getHealth(): Promise<string>;
  getTokenAccountsByOwner(owner: string, options: {
    mint?: string;
    programId?: string;
  }, commitment?: string): Promise<any>;
  getTransaction(signature: string, options: any): Promise<unknown>;
  subscribeToAccount(publicKey: string, callback: (accountInfo: any) => void, commitment?: string): Promise<number>;
  subscribeToProgramAccounts(programId: string, callback: (accountInfo: any, context: any) => void, options?: any): Promise<number>;
  unsubscribe(subscriptionId: number): Promise<boolean>;
  getConnection(): Connection;
  getEndpoint(): string;
}