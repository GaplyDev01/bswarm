// @ts-nocheck
/**
 * Solana Web3.js v2-compatible APIs
 *
 * This provides v2-like functionality without causing dependency conflicts
 * with wallet adapter packages that require v1.
 */

import { createSolanaRpc } from './rpc';
import { logger } from '../../logger';

// Re-export the main RPC creation function
export { createSolanaRpc } from './rpc';
export type { SolanaRpcApi } from './rpc';

// Common token program ID
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

// Common constants
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Utility functions for common operations
export async function getLatestBlockhash(endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getLatestBlockhash().send();
  } catch (error) {
    logger.error('Error getting latest blockhash:', error);
    throw error;
  }
}

export async function getBlockHeight(endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getBlockHeight().send();
  } catch (error) {
    logger.error('Error getting block height:', error);
    throw error;
  }
}

export async function getBalance(address: string, endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    const lamports = await rpc.getBalance(address).send();
    return lamports / LAMPORTS_PER_SOL; // Return in SOL
  } catch (error) {
    logger.error('Error getting balance:', error);
    throw error;
  }
}

export async function getHealth(endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getHealth().send();
  } catch (error) {
    logger.error('Error getting health:', error);
    return 'unhealthy';
  }
}

export async function getTokenAccountsByOwner(
  owner: string, 
  options: { mint?: string; programId?: string } = { programId: TOKEN_PROGRAM_ID },
  endpoint?: string
) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getTokenAccountsByOwner(owner, options).send();
  } catch (error) {
    logger.error('Error getting token accounts:', error);
    throw error;
  }
}

export async function getTransaction(signature: string, endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getTransaction(signature, { maxSupportedTransactionVersion: 0 }).send();
  } catch (error) {
    logger.error('Error getting transaction:', error);
    throw error;
  }
}

export async function getTransactionHistory(address: string, limit = 20, endpoint?: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    const signatures = await rpc.getSignaturesForAddress(address, { limit }).send();
    
    if (!signatures || signatures.length === 0) {
      return [];
    }
    
    // Map to a nicer format
    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot,
      timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : undefined,
      success: !sig.err,
      error: sig.err,
    }));
  } catch (error) {
    logger.error('Error getting transaction history:', error);
    throw error;
  }
}

// QuickNode specific functions
export async function estimatePriorityFees(
  params: {
    last_n_blocks?: number;
    account?: string;
  } = { last_n_blocks: 20 },
  endpoint?: string
) {
  try {
    const rpc = createSolanaRpc(endpoint);
    // @ts-ignore - QuickNode specific method
    return await rpc.qn_estimatePriorityFees(params).send();
  } catch (error) {
    logger.error('Error estimating priority fees:', error);
    // Return a default estimation
    return {
      priorityFeeLevels: {
        low: 1000,
        medium: 10000,
        high: 1000000,
        very_high: 1500000,
      }
    };
  }
}