/**
 * Solana Web3.js v2-compatible APIs
 *
 * This provides v2-like functionality without causing dependency conflicts
 * with wallet adapter packages that require v1.
 */

import { createSolanaRpc, SolanaRpcApi } from './rpc';
import { logger } from '../../utils';

// Export the main RPC creation function
export { createSolanaRpc } from './rpc';

// Utility functions for common operations
export async function getLatestBlockhash(endpoint: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getLatestBlockhash().send();
  } catch (error) {
    logger.error('Error getting latest blockhash:', error);
    throw error;
  }
}

export async function getBlockHeight(endpoint: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getBlockHeight().send();
  } catch (error) {
    logger.error('Error getting block height:', error);
    throw error;
  }
}

export async function getBalance(endpoint: string, address: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getBalance(address).send();
  } catch (error) {
    logger.error('Error getting balance:', error);
    throw error;
  }
}

export async function getHealth(endpoint: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getHealth().send();
  } catch (error) {
    logger.error('Error getting health:', error);
    throw error;
  }
}

export async function getTokenAccountsByOwner(endpoint: string, owner: string, programId: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getTokenAccountsByOwner(owner, { programId }).send();
  } catch (error) {
    logger.error('Error getting token accounts:', error);
    throw error;
  }
}

export async function getTransaction(endpoint: string, signature: string) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.getTransaction(signature, { maxSupportedTransactionVersion: 0 }).send();
  } catch (error) {
    logger.error('Error getting transaction:', error);
    throw error;
  }
}

// QuickNode specific functions
export async function estimatePriorityFees(
  endpoint: string,
  params: {
    last_n_blocks?: number;
    account?: string;
    api_version?: number;
  }
) {
  try {
    const rpc = createSolanaRpc(endpoint);
    return await rpc.qn_estimatePriorityFees(params).send();
  } catch (error) {
    logger.error('Error estimating priority fees:', error);
    throw error;
  }
}
