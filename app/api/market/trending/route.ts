import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTokens } from '@/lib/coingecko-api';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const trending = await getTrendingTokens();

    // Filter for Solana tokens
    const solanaTokens = trending.coins.filter((coin: unknown) => {
      try {
        if (coin.item.platforms && coin.item.platforms.solana) return true;
        return false;
      } catch (error) {
        return false;
      }
    });

    // Format the response
    const formattedTokens = solanaTokens.map((coin: unknown) => ({
      id: coin.item.id,
      symbol: coin.item.symbol.toUpperCase(),
      name: coin.item.name,
      thumb: coin.item.thumb,
      market_cap_rank: coin.item.market_cap_rank,
    }));

    // Add a timestamp to the response
    const response = {
      tokens: formattedTokens,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko Pro API',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logger.error('Error fetching trending tokens:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch trending tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
