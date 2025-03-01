// @ts-nocheck
/**
 * SolanaRpc - Utilities for Solana Web3.js
 *
 * This module provides helper functions for interacting with the Solana blockchain
 * using a standardized interface compatible with both web3.js v1 and v2 patterns.
 */

import { Connection, PublicKey, clusterApiUrl, Commitment } from '@solana/web3.js';
import { logger } from '../logger';
import { SolanaRpcClient } from './types';
import { createSolanaRpc as createV2RpcClient } from './v2/rpc';

// Implementation of the SolanaRpcClient interface
export class SolanaRpc implements SolanaRpcClient {
  private connection: Connection;
  private v2Client: ReturnType<typeof createV2RpcClient>;
  private endpoint: string;
  private commitment: Commitment;

  constructor(
    endpoint: string = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
    commitment: Commitment = 'confirmed'
  ) {
    this.endpoint = endpoint;
    this.commitment = commitment;
    
    // Initialize connection with web3.js v1
    this.connection = new Connection(endpoint, {
      commitment,
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WSS_URL || undefined
    });
    
    // Initialize v2-compatible RPC client
    this.v2Client = createV2RpcClient(endpoint, commitment);
    
    logger.info(`SolanaRpc initialized with RPC endpoint: ${endpoint}`);
    logger.info(`WebSocket endpoint: ${process.env.NEXT_PUBLIC_SOLANA_WSS_URL || 'Default from RPC'}`);
  }

  async getLatestBlockhash(commitment?: string): Promise<unknown> {
    try {
      // Use v2 client for consistent pattern
      return await this.v2Client.getLatestBlockhash(commitment).send();
    } catch (error) {
      // Fallback to v1 if v2 fails
      logger.warn('Falling back to v1 getLatestBlockhash:', error);
      return await this.connection.getLatestBlockhash(commitment as Commitment);
    }
  }

  async getBlockHeight(commitment?: string): Promise<number> {
    try {
      return await this.v2Client.getBlockHeight(commitment).send();
    } catch (error) {
      logger.warn('Falling back to v1 getBlockHeight:', error);
      return await this.connection.getBlockHeight(commitment as Commitment);
    }
  }

  async getBalance(address: string, commitment?: string): Promise<number> {
    try {
      // First try v2 client
      const balance = await this.v2Client.getBalance(address, commitment).send();
      return balance;
    } catch (error) {
      // Fallback to v1
      logger.warn('Falling back to v1 getBalance:', error);
      const pubkey = new PublicKey(address);
      return await this.connection.getBalance(pubkey, commitment as Commitment);
    }
  }

  async getHealth(): Promise<string> {
    try {
      // Try v2 client
      return await this.v2Client.getHealth().send();
    } catch (error) {
      logger.warn('Falling back to v1 getHealth check:', error);
      // The Connection doesn't have getHealth method - check using getVersion
      try {
        await this.connection.getVersion();
        return 'ok';
      } catch (error) {
        logger.error('Error getting health:', error);
        return 'unhealthy';
      }
    }
  }

  async getTokenAccountsByOwner(
    owner: string, 
    options: { mint?: string; programId?: string },
    commitment?: string
  ): Promise<any> {
    try {
      // Try v2 client first
      return await this.v2Client.getTokenAccountsByOwner(
        owner, 
        options, 
        commitment
      ).send();
    } catch (error) {
      logger.warn('Falling back to v1 getTokenAccountsByOwner:', error);
      
      // Fallback to v1
      try {
        const pubkey = new PublicKey(owner);
        const filter = options.mint
          ? { mint: new PublicKey(options.mint) }
          : { programId: new PublicKey(options.programId!) };

        // Using any type assertion to avoid TypeScript error with encoding
        return await this.connection.getTokenAccountsByOwner(
          pubkey, 
          filter, 
          { commitment: commitment as Commitment } as any
        );
      } catch (fallbackError) {
        logger.error('Error in fallback getTokenAccountsByOwner:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async getTransaction(signature: string, options: any): Promise<unknown> {
    try {
      // Try v2 client first
      return await this.v2Client.getTransaction(signature, options).send();
    } catch (error) {
      logger.warn('Falling back to v1 getTransaction:', error);
      
      // Fallback to v1
      try {
        return await this.connection.getTransaction(signature, options);
      } catch (fallbackError) {
        logger.error('Error in fallback getTransaction:', fallbackError);
        throw fallbackError;
      }
    }
  }
  
  // WebSocket subscription methods - These use v1 Connection only
  async subscribeToAccount(
    publicKey: string, 
    callback: (accountInfo: any) => void,
    commitment?: string
  ): Promise<number> {
    try {
      const accountKey = new PublicKey(publicKey);
      const subscriptionId = this.connection.onAccountChange(
        accountKey,
        (accountInfo) => {
          logger.info(`Account ${publicKey.slice(0, 8)}... changed`);
          callback(accountInfo);
        },
        commitment as Commitment
      );
      logger.info(`Subscribed to account ${publicKey.slice(0, 8)}... changes`);
      return subscriptionId;
    } catch (error) {
      logger.error(`Error subscribing to account ${publicKey}:`, error);
      throw error;
    }
  }
  
  async subscribeToProgramAccounts(
    programId: string, 
    callback: (accountInfo: any, context: any) => void,
    options?: any
  ): Promise<number> {
    try {
      const program = new PublicKey(programId);
      const subscriptionId = this.connection.onProgramAccountChange(
        program,
        (accountInfo, context) => {
          logger.info(`Program ${programId.slice(0, 8)}... account changed`);
          callback(accountInfo, context);
        },
        options?.commitment as Commitment,
        options?.filters
      );
      logger.info(`Subscribed to program ${programId.slice(0, 8)}... account changes`);
      return subscriptionId;
    } catch (error) {
      logger.error(`Error subscribing to program ${programId}:`, error);
      throw error;
    }
  }
  
  async unsubscribe(subscriptionId: number): Promise<boolean> {
    try {
      // The removeAccountChangeListener returns void in most recent versions of web3.js
      // For compatibility return true if no error is thrown
      await this.connection.removeAccountChangeListener(subscriptionId);
      logger.info(`Unsubscribed from subscription ${subscriptionId}`);
      return true;
    } catch (error) {
      logger.error(`Error unsubscribing from ${subscriptionId}:`, error);
      throw error;
    }
  }

  // Get direct access to the connection (v1)
  getConnection(): Connection {
    return this.connection;
  }
  
  // Get access to the v2 RPC client
  getV2Client() {
    return this.v2Client;
  }
  
  // Get endpoint
  getEndpoint(): string {
    return this.endpoint;
  }
}

// Create and export default instance
export const solanaRpc = new SolanaRpc();

// Function to create a custom connection if needed
export function createSolanaRpc(endpoint?: string): SolanaRpcClient {
  return new SolanaRpc(endpoint);
}