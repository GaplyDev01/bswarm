// @ts-nocheck
/**
 * A lightweight implementation of Solana Web3.js v2 RPC client
 *
 * This mimics the v2 API without requiring the actual dependency,
 * allowing us to use v2-like syntax without conflicts.
 */
import { logger } from '../../utils';

// Define the base types that mimic the v2 API
export type RpcMethod<TParams, TResult> = {
  send: () => Promise<TResult>;
};

export interface SolanaRpcApi {
  getLatestBlockhash(): RpcMethod<void, any>;
  getBlockHeight(): RpcMethod<void, number>;
  getBalance(address: string): RpcMethod<string, number>;
  getHealth(): RpcMethod<void, string>;
  getTokenAccountsByOwner(owner: string, filter: unknown): RpcMethod<any, any>;
  getTransaction(signature: string, options: Record<string, unknown>): RpcMethod<any, any>;
  // TODO: Replace 'any' with a more specific type
  // TODO: Replace 'any' with a more specific type
  [key: string]: unknown;
}

// Create a class that mimics the v2 RPC client
// @ts-ignore
export class SolanaRpcClient implements SolanaRpcApi {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  private createMethod<TParams, TResult>(
    method: string,
    params?: unknown[]
  ): RpcMethod<TParams, TResult> {
    return {
      send: async () => {
        try {
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method,
              params: params || [],
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.message || 'Unknown RPC error');
          }

          return data.result;
        } catch (error) {
          logger.error(`Error in ${method}:`, error);
          throw error;
        }
      },
    };
  }

  getLatestBlockhash() {
    return this.createMethod<void, any>('getLatestBlockhash', [{ commitment: 'confirmed' }]);
  }

  getBlockHeight() {
    return this.createMethod<void, number>('getBlockHeight', [{ commitment: 'confirmed' }]);
  }

  getBalance(address: string) {
    return this.createMethod<string, number>('getBalance', [address, { commitment: 'confirmed' }]);
  }

  getHealth() {
    return this.createMethod<void, string>('getHealth', []);
  }

  getTokenAccountsByOwner(owner: string, filter: unknown) {
    return this.createMethod<any, any>('getTokenAccountsByOwner', [
      owner,
      filter,
      { encoding: 'jsonParsed', commitment: 'confirmed' },
    ]);
  }

  getTransaction(signature: string, options: Record<string, unknown>) {
    return this.createMethod<any, any>('getTransaction', [signature, options]);
  }

  // Add support for QuickNode's custom methods
  qn_estimatePriorityFees(params: unknown) {
    return this.createMethod<any, any>('qn_estimatePriorityFees', [params]);
  }
}

// Function that mimics the v2 createSolanaRpc
export function createSolanaRpc(endpoint: string): SolanaRpcApi {
  if (!endpoint) {
    throw new Error('Solana RPC URL not configured');
  }

// @ts-ignore
  return new SolanaRpcClient(endpoint);
}
