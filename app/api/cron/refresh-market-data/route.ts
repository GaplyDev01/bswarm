import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis-cache';
import { logger } from '@/lib/logger';

// Market data structure
interface MarketData {
  market_cap: number;
  volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  sol_dominance: number;
  top_gainers: Array<{ id: string; symbol: string; price_change_24h: number }>;
  top_losers: Array<{ id: string; symbol: string; price_change_24h: number }>;
}

export async function GET(request: Request) {
  try {
    // Get current timestamp
    const timestamp = new Date().toISOString();

    // In a production app, this would fetch real market data from an API
    // For demo purposes, we'll generate random data
    const _marketData: MarketData = {
      market_cap: 2.7e12 + Math.random() * 0.1e12,
      volume_24h: 1.2e11 + Math.random() * 0.2e11,
      btc_dominance: 45 + (Math.random() * 2 - 1),
      eth_dominance: 18 + (Math.random() * 1.5 - 0.75),
      sol_dominance: 3 + (Math.random() * 0.5 - 0.25),
      top_gainers: [
        { id: 'sol', symbol: 'SOL', price_change_24h: 5 + Math.random() * 10 },
        { id: 'inj', symbol: 'INJ', price_change_24h: 4 + Math.random() * 8 },
        { id: 'jup', symbol: 'JUP', price_change_24h: 3 + Math.random() * 7 },
      ],
      top_losers: [
        { id: 'bonk', symbol: 'BONK', price_change_24h: -3 - Math.random() * 5 },
        { id: 'pepe', symbol: 'PEPE', price_change_24h: -2 - Math.random() * 4 },
        { id: 'shib', symbol: 'SHIB', price_change_24h: -1 - Math.random() * 3 },
      ],
    };

    // Store in cache with 15-minute expiration (matching cron schedule)
    await RedisCache.set(
      'market:global:data',
      JSON.stringify({
        data: marketData,
        timestamp,
        updated_at: timestamp,
      }),
      900
    ); // 15 minutes in seconds

    return NextResponse.json({
      success: true,
      message: 'Market data refreshed successfully',
      timestamp,
    });
  } catch (error) {
    logger.error('Market data refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh market data' },
      { status: 500 }
    );
  }
}
