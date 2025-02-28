import { NextRequest, NextResponse } from 'next/server';
import {
  formatErrorResponse,
  withRetry,
  addSecurityHeaders,
  validateParams,
} from '@/lib/api-utils';
import { getEnv, areAISignalsEnabled } from '@/lib/env';
import { marketDataService } from '@/lib/market-data-service';
import { generateAISignal } from '@/lib/ai-trading-service';
import { logger } from '@/lib/logger';

// Types for AI signals
export interface TechnicalIndicator {
  name: string;
  value: string | number;
  signal: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
}

export interface AISignal {
  token: string;
  tokenId: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: 'short' | 'medium' | 'long';
  price: number;
  reasoning: string;
  technicalIndicators: TechnicalIndicator[];
  sentiment: {
    social: number;
    news: number;
    overall: number;
  };
  timestamp: string;
  expiresAt: string;
}

// Default tokens to track if none specified
const DEFAULT_TRACKED_TOKENS = ['solana', 'jupiter', 'bonk', 'jito-dao'];

/**
 * GET /api/trading/signals
 * Query params:
 *  - token: Optional specific token ID to get signal for
 *  - limit: Optional number of signals to return (default 5)
 */
export async function GET(req: NextRequest) {
  try {
    // Validate AI signals are enabled
    if (!areAISignalsEnabled()) {
      return formatErrorResponse(403, 'AI Trading Signals feature is disabled');
    }

    // Parse request parameters
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    if (token) {
      // Get signal for a specific token
      try {
        const signal = await getSignalForToken(token);
        const response = NextResponse.json({
          success: true,
          signal,
        });

        return addSecurityHeaders(response);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error generating signal';
        return formatErrorResponse(500, errorMessage);
      }
    } else {
      // Get signals for tracked tokens
      try {
        const signals = await getSignalsForTokens(DEFAULT_TRACKED_TOKENS, limit);
        const response = NextResponse.json({
          success: true,
          signals,
        });

        return addSecurityHeaders(response);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error generating signals';
        return formatErrorResponse(500, errorMessage);
      }
    }
  } catch (error) {
    logger.error('Error in trading signals API:', error);
    return formatErrorResponse(500, 'Failed to process trading signals request');
  }
}

/**
 * Generate signal for a specific token
 */
async function getSignalForToken(tokenId: string): Promise<AISignal> {
  // Get token info and price data first
  const tokenInfo = await withRetry(
    async () => {
      return await marketDataService.getTokenInfo(tokenId);
    },
    {
      retries: 2,
      backoff: 300,
    }
  );

  if (!tokenInfo) {
    throw new Error(`Token not found: ${tokenId}`);
  }

  // Get market data
  const marketData = await withRetry(
    async () => {
      return await marketDataService.getTokenPriceHistory(tokenId, 30); // 30 days history
    },
    {
      retries: 2,
    }
  );

  // Get real AI analysis
  // This leverages our AI models to generate the signal
  const signal = await generateAISignal(tokenId, {
    tokenInfo,
    priceHistory: marketData,
    technicalIndicators: true,
    sentiment: true,
  });

  return {
    ...signal,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
  };
}

/**
 * Generate signals for multiple tokens
 */
async function getSignalsForTokens(tokenIds: string[], limit: number = 5): Promise<AISignal[]> {
  // Process tokens in parallel with concurrency limit
  const signals: AISignal[] = [];
  const concurrencyLimit = 3; // Process 3 tokens at a time

  // Split tokens into chunks for concurrent processing
  for (let i = 0; i < tokenIds.length; i += concurrencyLimit) {
    const chunk = tokenIds.slice(i, i + concurrencyLimit);

    // Process this chunk concurrently
    const chunkSignals = await Promise.all(
      chunk.map(async tokenId => {
        try {
          return await getSignalForToken(tokenId);
        } catch (error) {
          logger.error(`Error generating signal for ${tokenId}:`, error);
          return null;
        }
      })
    );

    // Add successful signals to the result
    signals.push(...(chunkSignals.filter(Boolean) as AISignal[]));

    // Respect rate limits - wait briefly between chunks
    if (i + concurrencyLimit < tokenIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Sort by confidence descending and take requested limit
  return signals.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}
