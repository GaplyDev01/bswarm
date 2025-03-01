// @ts-nocheck
/**
 * A lightweight implementation of Solana Web3.js v2 RPC client
 *
 * This mimics the v2 API without requiring the actual dependency,
 * allowing us to use v2-like syntax without conflicts with wallet adapter
 * packages that require web3.js v1.
 */
import { logger } from '../../logger';

// Define the base types that mimic the v2 API
export type RpcMethod<TParams, TResult> = {
  send: () => Promise<TResult>;
};

export interface SolanaRpcApi {
  getLatestBlockhash(commitment?: string): RpcMethod<void, any>;
  getBlockHeight(commitment?: string): RpcMethod<void, number>;
  getBalance(address: string, commitment?: string): RpcMethod<string, number>;
  getHealth(): RpcMethod<void, string>;
  getTokenAccountsByOwner(
    owner: string, 
    filter: { mint?: string; programId?: string }, 
    commitment?: string
  ): RpcMethod<any, any>;
  getTransaction(signature: string, options: Record<string, unknown>): RpcMethod<any, any>;
  getProgramAccounts(programId: string, options?: any): RpcMethod<any, any>;
  getSignaturesForAddress(address: string, options?: any): RpcMethod<any, any>;
  [key: string]: unknown;
}

/**
 * Solana RPC client implementation that mimics web3.js v2 API style
 * while being compatible with v1 dependencies.
 */
export class SolanaRpcClient implements SolanaRpcApi {
  private endpoint: string;
  private defaultCommitment: string;
  
  constructor(endpoint: string, commitment: string = 'confirmed') {
    this.endpoint = endpoint;
    this.defaultCommitment = commitment;
    logger.info(`SolanaRpcClient initialized with endpoint: ${endpoint}`);
  }

  // Index signature to satisfy TypeScript interface
  [key: string]: unknown;

  /**
   * Creates a method that can be sent to the RPC endpoint
   */
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

  /**
   * Get the latest blockhash
   */
  getLatestBlockhash(commitment?: string) {
    return this.createMethod<void, any>('getLatestBlockhash', [
      { commitment: commitment || this.defaultCommitment }
    ]);
  }

  /**
   * Get the current block height
   */
  getBlockHeight(commitment?: string) {
    return this.createMethod<void, number>('getBlockHeight', [
      { commitment: commitment || this.defaultCommitment }
    ]);
  }

  /**
   * Get the balance of an account
   */
  getBalance(address: string, commitment?: string) {
    return this.createMethod<string, number>('getBalance', [
      address, 
      { commitment: commitment || this.defaultCommitment }
    ]);
  }

  /**
   * Check the health of the RPC endpoint
   */
  getHealth() {
    return this.createMethod<void, string>('getHealth', []);
  }

  /**
   * Get token accounts owned by the given address
   */
  getTokenAccountsByOwner(
    owner: string, 
    filter: { mint?: string; programId?: string },
    commitment?: string
  ) {
    return this.createMethod<any, any>('getTokenAccountsByOwner', [
      owner,
      filter.mint ? { mint: filter.mint } : { programId: filter.programId },
      { encoding: 'jsonParsed', commitment: commitment || this.defaultCommitment },
    ]);
  }

  /**
   * Get transaction details
   */
  getTransaction(signature: string, options: Record<string, unknown> = {}) {
    return this.createMethod<any, any>('getTransaction', [
      signature, 
      { commitment: this.defaultCommitment, ...options }
    ]);
  }
  
  /**
   * Get program accounts
   */
  getProgramAccounts(programId: string, options: any = {}) {
    const params: any[] = [
      programId,
      {
        encoding: options.encoding || 'jsonParsed',
        commitment: options.commitment || this.defaultCommitment,
      },
    ];
    
    if (options.filters) {
      params[1].filters = options.filters;
    }
    
    return this.createMethod<any, any>('getProgramAccounts', params);
  }
  
  /**
   * Get signatures for address
   */
  getSignaturesForAddress(address: string, options: any = {}) {
    return this.createMethod<any, any>('getSignaturesForAddress', [
      address,
      {
        limit: options.limit || 10,
        before: options.before,
        until: options.until,
        commitment: options.commitment || this.defaultCommitment,
      },
    ]);
  }
  
  /**
   * Get account info
   */
  getAccountInfo(address: string, commitment?: string) {
    return this.createMethod<any, any>('getAccountInfo', [
      address,
      { encoding: 'jsonParsed', commitment: commitment || this.defaultCommitment },
    ]);
  }

  /**
   * Get minimum balance for rent exemption
   */
  getMinimumBalanceForRentExemption(size: number) {
    return this.createMethod<any, number>('getMinimumBalanceForRentExemption', [size]);
  }

  /**
   * QuickNode's priority fee estimation
   */
  qn_estimatePriorityFees(params: unknown) {
    return this.createMethod<any, any>('qn_estimatePriorityFees', [params]);
  }
}

/**
 * Create a Solana RPC client
 */
export function createSolanaRpc(
  endpoint: string = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 
  commitment: string = 'confirmed'
): SolanaRpcApi {
  if (!endpoint) {
    throw new Error('Solana RPC URL not configured');
  }

  // Using type assertion to ensure TypeScript is satisfied
  return new SolanaRpcClient(endpoint, commitment) as SolanaRpcApi;
}