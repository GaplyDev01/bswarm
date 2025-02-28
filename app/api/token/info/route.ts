// @ts-nocheck
import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis-cache';
import { PostgresDB } from '@/lib/postgres-db';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  // Parse request parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  try {
    // Try to get from cache first
    const cacheKey = `token:${id}`;

    try {
      const cachedToken = await RedisCache.get(cacheKey);
      if (cachedToken) {
        logger.log(`Cache hit for token ID ${id}`);
        return NextResponse.json(cachedToken);
      }
      logger.log(`Cache miss for token ID ${id}`);
    } catch (error) {
      logger.error('Redis cache error:', error);
    }

    // Not in cache, try database
    try {
      const dbToken = await PostgresDB.getTokenById(id);
      if (dbToken) {
        logger.log(`Found token in database: ${id}`);

        const tokenData = {
          id: dbToken.id,
          symbol: dbToken.symbol,
          name: dbToken.name,
          ...dbToken.data,
        };

        // Cache the result for future requests
        try {
          await RedisCache.set(cacheKey, tokenData, 60 * 30); // Cache for 30 minutes
        } catch (cacheError) {
          logger.error('Error caching token data:', cacheError);
        }

        return NextResponse.json(tokenData);
      }
    } catch (dbError) {
      logger.error('Database error:', dbError);
    }

    // Not in database, fetch from CoinGecko
    logger.log(`Fetching token data from CoinGecko for ID: ${id}`);
    try {
      const detailUrl = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`;
      const response = await fetch(detailUrl, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();

        // Create a standardized token object
        const tokenData = {
          id: data.id,
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          image: data.image?.small || data.image?.thumb,
          current_price: data.market_data?.current_price?.usd || 0,
          market_cap: data.market_data?.market_cap?.usd || 0,
          market_cap_rank: data.market_cap_rank || 999999,
          price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
          price_change_percentage_7d: data.market_data?.price_change_percentage_7d || 0,
          price_change_percentage_30d: data.market_data?.price_change_percentage_30d || 0,
          ath: data.market_data?.ath?.usd || 0,
          ath_date: data.market_data?.ath_date?.usd || '',
          volume_24h: data.market_data?.total_volume?.usd || 0,
          circulating_supply: data.market_data?.circulating_supply || 0,
          total_supply: data.market_data?.total_supply || 0,
          max_supply: data.market_data?.max_supply || null,
          description: data.description?.en || '',
          sentiment:
            data.sentiment_votes_up_percentage > 60
              ? 'Bullish'
              : data.sentiment_votes_up_percentage < 40
                ? 'Bearish'
                : 'Neutral',
          community_score: data.community_data?.community_score || 0,
          developer_score: data.developer_data?.developer_score || 0,
          liquidity_score: data.liquidity_score || 0,
          public_interest_score: data.public_interest_score || 0,
          categories: data.categories || [],
          platforms: data.platforms || {},
          links: data.links || {},

          // Add historical data if available
          historical_prices:
            data.market_data?.sparkline_7d?.price?.map((price: number, index: number) => {
              const date = new Date();
              date.setDate(date.getDate() - (7 - index / 24));
              return {
                date: date.toISOString().split('T')[0],
                price,
              };
            }) || [],

          // Add recent news (placeholder as CoinGecko doesn't provide this)
          recent_news: [],
        };

        // Store in database for future requests
        try {
          await PostgresDB.upsertToken(tokenData.id, tokenData.symbol, tokenData.name, tokenData);
          logger.log(`Stored token in database: ${tokenData.symbol} (${tokenData.name})`);
        } catch (dbError) {
          logger.error(`Error storing token in database: ${dbError}`);
        }

        // Cache the result
        try {
          await RedisCache.set(cacheKey, tokenData, 60 * 30); // Cache for 30 minutes
        } catch (cacheError) {
          logger.error('Error caching token data:', cacheError);
        }

        return NextResponse.json(tokenData);
      } else {
        logger.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }
    } catch (apiError) {
      logger.error('Error fetching from CoinGecko API:', apiError);
      return NextResponse.json({ error: 'Error fetching token data' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error getting token info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
