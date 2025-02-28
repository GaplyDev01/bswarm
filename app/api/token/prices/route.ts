import { NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/market-data-service';
import { RedisCache } from '@/lib/redis-cache';
import { formatErrorResponse } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/token/prices?ids=bitcoin,ethereum,solana
 *
 * Gets prices for multiple tokens at once
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return formatErrorResponse(400, 'Missing required query parameter: ids');
    }

    // Split the comma-separated list
    const ids = idsParam
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return formatErrorResponse(400, 'Empty ids parameter');
    }

    // Check cache first
    const cacheKey = `prices:${ids.sort().join(',')}`;
    const cached = await RedisCache.get<Record<string, number>>(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        prices: cached,
      });
    }

    // Fetch prices
    const marketDataService = MarketDataService.getInstance();

    const prices: Record<string, number> = {};

    // Fetch prices for each token
    await Promise.all(
      ids.map(async id => {
        try {
          const price = await marketDataService.getTokenPrice(id);
          if (price !== null) {
            prices[id] = price;
          }
        } catch (error) {
          logger.error(`Error fetching price for ${id}:`, error);
          // Continue with other tokens
        }
      })
    );

    // Cache the result
    await RedisCache.set(cacheKey, prices, 60); // 60 seconds cache

    return NextResponse.json({
      success: true,
      prices,
    });
  } catch (error) {
    logger.error('Error fetching token prices:', error);
    return formatErrorResponse(500, 'Failed to fetch token prices');
  }
}
