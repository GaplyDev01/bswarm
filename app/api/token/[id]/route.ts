// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getTokenData, getMarketChart } from '@/lib/coingecko-api';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Extract the tokenId from the URL
    const pathname = request.nextUrl.pathname;
    const tokenId = pathname.split('/').pop() || '';

    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    // Fetch token data and market chart in parallel
    const [tokenData, marketChart] = await Promise.all([
      getTokenData(tokenId),
      getMarketChart(tokenId, days),
    ]);

    // If no token data is found, return 404
    if (!tokenData || !tokenData.id) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Token with ID "${tokenId}" not found`,
        },
        { status: 404 }
      );
    }

    // Format the response
    const formattedData = {
      token: {
        id: tokenData.id,
        symbol: tokenData.symbol,
        name: tokenData.name,
// @ts-ignore
        image: tokenData.image?.large,
// @ts-ignore
        description: tokenData.description?.en,
        market_data: {
// @ts-ignore
          current_price: tokenData.market_data?.current_price,
// @ts-ignore
          market_cap: tokenData.market_data?.market_cap,
// @ts-ignore
          total_volume: tokenData.market_data?.total_volume,
// @ts-ignore
          high_24h: tokenData.market_data?.high_24h,
// @ts-ignore
          low_24h: tokenData.market_data?.low_24h,
// @ts-ignore
          price_change_24h: tokenData.market_data?.price_change_24h,
// @ts-ignore
          price_change_percentage_24h: tokenData.market_data?.price_change_percentage_24h,
// @ts-ignore
          market_cap_change_24h: tokenData.market_data?.market_cap_change_24h,
// @ts-ignore
          market_cap_change_percentage_24h: tokenData.market_data?.market_cap_change_percentage_24h,
// @ts-ignore
          circulating_supply: tokenData.market_data?.circulating_supply,
// @ts-ignore
          total_supply: tokenData.market_data?.total_supply,
// @ts-ignore
          max_supply: tokenData.market_data?.max_supply,
// @ts-ignore
          ath: tokenData.market_data?.ath,
// @ts-ignore
          ath_change_percentage: tokenData.market_data?.ath_change_percentage,
// @ts-ignore
          ath_date: tokenData.market_data?.ath_date,
// @ts-ignore
          atl: tokenData.market_data?.atl,
// @ts-ignore
          atl_change_percentage: tokenData.market_data?.atl_change_percentage,
// @ts-ignore
          atl_date: tokenData.market_data?.atl_date,
        },
        community_data: tokenData.community_data,
        developer_data: tokenData.developer_data,
        links: tokenData.links,
      },
      chart: {
        days,
        prices: marketChart.prices,
        market_caps: marketChart.market_caps,
        total_volumes: marketChart.total_volumes,
      },
    };

    return NextResponse.json({
      status: 'success',
      data: formattedData,
    });
  } catch (error) {
    logger.error(`Error fetching token data:`, error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tokenId: request.nextUrl.pathname.split('/').pop() || '',
      },
      { status: 500 }
    );
  }
}
