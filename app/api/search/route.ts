import { NextRequest, NextResponse } from 'next/server';
import { searchTokens, getTokenPrices } from '@/lib/coingecko-api';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get search query
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          error: 'Query must be at least 2 characters long',
          results: [],
        },
        { status: 400 }
      );
    }

    // Search for tokens
    const searchResults = await searchTokens(query);

    // Filter for Solana tokens
    const solanaTokens = searchResults.coins.filter((coin: unknown) => {
      try {
        if (coin.platforms && coin.platforms.solana) return true;
        return false;
      } catch (error) {
        return false;
      }
    });

    // Get coin IDs for the price fetch
    const coinIds = solanaTokens.map((coin: unknown) => coin.id);

    // Only fetch prices if we have coins
    let priceData = {};
    if (coinIds.length > 0) {
      priceData = await getTokenPrices(coinIds, ['usd'], {
        include_24hr_change: true,
        include_24hr_vol: true,
      });
    }

    // Format results with price data
    const formattedResults = solanaTokens.map((coin: unknown) => {
      const price = coin.id && priceData ? (priceData as Record<string, any>)[coin.id] || {} : {};
      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb,
        large: coin.large,
        market_cap_rank: coin.market_cap_rank,
        price: price.usd || 0,
        price_change_24h: price.usd_24h_change || 0,
        volume_24h: price.usd_24h_vol || 0,
      };
    });

    // Return results
    return NextResponse.json(
      {
        query,
        results: formattedResults,
        count: formattedResults.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    logger.error('Search error:', error);

    return NextResponse.json(
      {
        error: 'Failed to search tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
        query: new URL(request.url).searchParams.get('q') || '',
        results: [],
      },
      { status: 500 }
    );
  }
}
