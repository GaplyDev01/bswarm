/**
 * SolanaV2 - Utilities for Solana Web3.js v1.98.0
 *
 * This module provides helper functions for interacting with the Solana blockchain
 * using Web3.js v1 APIs with a v2-like interface for future compatibility.
 */

import { Connection, PublicKey, clusterApiUrl, Commitment } from '@solana/web3.js';
import { logger } from '../logger'; // Update to use our new logger

// Define a basic SolanaConnection class for v1-compatible usage
export class SolanaConnection {
  private connection: Connection;

  constructor(
    endpoint: string = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet')
  ) {
    this.connection = new Connection(endpoint);
  }

  async getLatestBlockhash(commitment?: Commitment) {
    try {
      return await this.connection.getLatestBlockhash(commitment);
    } catch (error) {
      logger.error('Error getting latest blockhash:', error);
      throw error;
    }
  }

  async getBlockHeight(commitment?: Commitment) {
    try {
      return await this.connection.getBlockHeight(commitment);
    } catch (error) {
      logger.error('Error getting block height:', error);
      throw error;
    }
  }

  async getBalance(address: string, commitment?: Commitment) {
    try {
      const pubkey = new PublicKey(address);
      return await this.connection.getBalance(pubkey, commitment);
    } catch (error) {
      logger.error('Error getting balance:', error);
      throw error;
    }
  }

  async getHealth() {
    try {
      // The v1 Connection doesn't have getHealth method - check using getVersion
      await this.connection.getVersion();
      return 'ok';
    } catch (error) {
      logger.error('Error getting health:', error);
      return 'unhealthy';
    }
  }

  async getTokenAccountsByOwner(owner: string, options: Record<string, unknown>[]) {
    try {
      const pubkey = new PublicKey(owner);
      const filter = options.mint
        ? { mint: new PublicKey(options.mint) }
        : { programId: new PublicKey(options.programId) };

      return await this.connection.getTokenAccountsByOwner(pubkey, filter, options.commitment);
    } catch (error) {
      logger.error('Error getting token accounts:', error);
      throw error;
    }
  }

  async getTransaction(signature: string, options: Record<string, unknown>[]) {
    try {
      return await this.connection.getTransaction(signature, options);
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }
}

// Create and export default instance
export const solanaRpc = new SolanaConnection();

// Function to create a custom connection if needed
export function createSolanaConnection(endpoint?: string) {
  return new SolanaConnection(endpoint);
}
