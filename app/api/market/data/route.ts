// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getMarkets } from '@/lib/coingecko-api';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters with defaults
    const url = new URL(request.url);
    const vsCurrency = url.searchParams.get('vs_currency') || 'usd';
    const category = url.searchParams.get('category') || 'solana-ecosystem';
    const order = url.searchParams.get('order') || 'market_cap_desc';
    const perPage = parseInt(url.searchParams.get('per_page') || '50', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const sparkline = url.searchParams.get('sparkline') !== 'false';
    const priceChangePercentage = url.searchParams.get('price_change_percentage') || '24h';

    // Fetch market data
    const marketData = await getMarkets({
      vsCurrency,
      category,
      order,
      perPage,
      page,
      sparkline,
      priceChangePercentage,
    });

    // Extract important market metrics
    const marketMetrics = calculateMarketMetrics(marketData);

    // Format the response
    const response = {
      data: marketData,
      metrics: marketMetrics,
      params: {
        vs_currency: vsCurrency,
        category,
        order,
        per_page: perPage,
        page,
        sparkline,
        price_change_percentage: priceChangePercentage,
      },
      timestamp: new Date().toISOString(),
      source: 'CoinGecko Pro API',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
      },
    });
  } catch (error) {
    logger.error('Error fetching market data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Calculate additional market metrics from the data
function calculateMarketMetrics(marketData: Record<string, unknown>[]) {
  // Check if market data is valid
  if (!Array.isArray(marketData) || marketData.length === 0) {
    return {
      total_market_cap: 0,
      total_volume_24h: 0,
      positive_performers_24h: 0,
      negative_performers_24h: 0,
      best_performer: null,
      worst_performer: null,
    };
  }

  // Calculate metrics
  let totalMarketCap = 0;
  let totalVolume24h = 0;
  let positivePerformers = 0;
  let negativePerformers = 0;

  // Define a more complete type for performers
  type Performer = {
    symbol: string;
    change: number;
    name?: string;
    price?: number;
    id?: string;
    image?: string;
  };

  let bestPerformer: Performer = { symbol: '', change: -Infinity };
  let worstPerformer: Performer = { symbol: '', change: Infinity };

  marketData.forEach(token => {
// @ts-ignore
    totalMarketCap += token.market_cap || 0;
// @ts-ignore
    totalVolume24h += token.total_volume || 0;

    const change = token.price_change_percentage_24h || 0;

// @ts-ignore
    if (change > 0) positivePerformers++;
// @ts-ignore
    if (change < 0) negativePerformers++;

// @ts-ignore
    if (change > bestPerformer.change) {
      bestPerformer = {
// @ts-ignore
        symbol: token.symbol,
// @ts-ignore
        change,
// @ts-ignore
        name: token.name,
// @ts-ignore
        price: token.current_price,
// @ts-ignore
        id: token.id,
// @ts-ignore
        image: token.image,
      };
    }

// @ts-ignore
    if (change < worstPerformer.change) {
      worstPerformer = {
// @ts-ignore
        symbol: token.symbol,
// @ts-ignore
        change,
// @ts-ignore
        name: token.name,
// @ts-ignore
        price: token.current_price,
// @ts-ignore
        id: token.id,
// @ts-ignore
        image: token.image,
      };
    }
  });

  return {
    total_market_cap: totalMarketCap,
    total_volume_24h: totalVolume24h,
    positive_performers_24h: positivePerformers,
    negative_performers_24h: negativePerformers,
    best_performer: bestPerformer.symbol ? bestPerformer : null,
    worst_performer: worstPerformer.symbol ? worstPerformer : null,
  };
}
