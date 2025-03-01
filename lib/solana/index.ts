// @ts-nocheck
/**
 * Solana Service Entry Point
 * 
 * This module serves as the main entry point for Solana functionality across the application.
 * It provides shared interfaces and a factory function to get the appropriate implementation.
 */

import { logger } from '../logger';
import type { SolanaService } from './types';
import { solanaRpc } from './solanaV2';

// Shared interfaces
export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  supply: number;
}

export interface WalletBalance {
  token: string;
  symbol: string;
  amount: number;
  valueUsd: number;
}

// Export core RPC client for direct access
export { solanaRpc, createSolanaRpc } from './solanaV2';

// Export v2 utilities
export * from './v2';

// Lazy load service implementations to avoid import overhead
let solanaServiceInstance: SolanaService | null = null;

/**
 * Factory function to get the appropriate Solana service implementation
 * based on environment configuration.
 */
export async function getSolanaService(): Promise<SolanaService> {
  // Check if we already have an instance
  if (solanaServiceInstance) {
    return solanaServiceInstance;
  }

  // Determine which implementation to use
  const useRealImplementation = process.env.NEXT_PUBLIC_USE_REAL_SOLANA === 'true';

  try {
    if (useRealImplementation) {
      logger.info('Using real Solana service implementation');
      const { default: RealSolanaService } = await import('./realSolanaService');
      solanaServiceInstance = RealSolanaService;
    } else {
      logger.info('Using mock Solana service implementation');
      const { default: MockSolanaService } = await import('./mockSolanaService');
      solanaServiceInstance = MockSolanaService;
    }
  } catch (error) {
    logger.error('Failed to load Solana service, using fallback mock:', error);
    // Load mock as fallback
    const { createMockSolanaService } = await import('./mockSolanaService');
    solanaServiceInstance = createMockSolanaService();
  }

  return solanaServiceInstance;
}