import { NextResponse } from 'next/server';
import { PostgresDB } from '@/lib/postgres-db';
import { RedisCache } from '@/lib/redis-cache';
import { logger } from '@/lib/logger';

// Fake token data for demo purposes
const tokens = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    current_price: 139.27,
    market_cap: 62318824232,
    volume_24h: 2745782348,
    circulating_supply: 446596578,
    price_change_percentage_24h: 2.34,
  },
  {
    id: 'bonk',
    symbol: 'BONK',
    name: 'Bonk',
    current_price: 0.0000278,
    market_cap: 1650583923,
    volume_24h: 203456789,
    circulating_supply: 59432423987654,
    price_change_percentage_24h: -3.21,
  },
];

export async function GET(request: Request) {
  try {
    // In a real application, fetch from CoinGecko or similar API
    for (const token of tokens) {
      // Update price with random variation
      token.current_price *= 1 + (Math.random() * 0.02 - 0.01); // +/- 1%
      token.price_change_percentage_24h = Math.random() * 10 - 5; // -5% to +5%

      // Store in database
      await PostgresDB.upsertToken(token.id, token.symbol, token.name, token);

      // Invalidate cache
      await RedisCache.delete(`token:${token.id}`);

      // Store historical price
      await PostgresDB.addTokenPriceHistory(
        token.id,
        token.current_price,
        token.market_cap,
        token.volume_24h
      );
    }

    return NextResponse.json({ success: true, updated: tokens.length });
  } catch (error) {
    logger.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update tokens' }, { status: 500 });
  }
}
