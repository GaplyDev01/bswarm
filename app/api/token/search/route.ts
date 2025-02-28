// @ts-nocheck
import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis-cache';
import { PostgresDB } from '@/lib/postgres-db';
import { VectorDB, createEmbedding } from '@/lib/vector-db';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const useVector = searchParams.get('vector') === 'true';

  logger.log(`[Token Search API] Received query: "${query}", useVector: ${useVector}`);

  // Return empty array for empty queries
  if (!query || query.trim() === '') {
    logger.log('Empty query received, returning empty results');
    return NextResponse.json([]);
  }

  try {
    // Try to get results from cache first
    const cacheKey = `search:${query}:${useVector ? 'vector' : 'text'}`;
    let searchResults = [];

    try {
      const cachedResults = await RedisCache.get(cacheKey);
      if (cachedResults) {
        logger.log(`Cache hit for search query "${query}"`);
        return NextResponse.json(cachedResults);
      }
      logger.log(`Redis cache: miss for key ${cacheKey}`);
    } catch (error) {
      logger.error('Redis cache get error:', error);
    }

    logger.log(`Cache miss for search query "${query}", searching...`);

    // Convert to lowercase for comparison
    const queryLower = query.toLowerCase().trim();

    // Try to get from database first
    try {
      const dbResults = await PostgresDB.searchTokens(queryLower);

      if (dbResults && dbResults.length > 0) {
        logger.log(`Found ${dbResults.length} tokens in database matching "${query}"`);
        searchResults = dbResults.map(item => ({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          // Extract relevant fields from the stored data
          ...item.data,
        }));
      }
    } catch (error) {
      logger.error('Database search error:', error);
    }

    // If no results from database, fetch from CoinGecko
    if (searchResults.length === 0) {
      logger.log(`No results in database, fetching from CoinGecko for query: "${query}"`);

      try {
        // Make request to CoinGecko API to search for tokens
        const coinGeckoUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(queryLower)}`;
        logger.log(`Fetching from CoinGecko: ${coinGeckoUrl}`);

        const response = await fetch(coinGeckoUrl, {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();

          if (data && data.coins && data.coins.length > 0) {
            logger.log(`CoinGecko returned ${data.coins.length} coins`);

            // Filter for Solana tokens or all if the query specifically asks for a token
            const solanaTokens = data.coins.filter(
              (coin: unknown) =>
// @ts-ignore
                coin.symbol.toLowerCase() === queryLower || // Exact symbol match
// @ts-ignore
                coin.name.toLowerCase() === queryLower || // Exact name match
// @ts-ignore
                (coin.platforms &&
// @ts-ignore
                  (coin.platforms.solana || Object.keys(coin.platforms).includes('solana'))) // On Solana platform
            );

            // Get detailed info for each token
            const detailedTokens = [];

            for (const coin of solanaTokens.slice(0, 10) as unknown[]) {
              // Limit to 10 to avoid rate limits
              try {
// @ts-ignore
                const detailUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
                const detailResponse = await fetch(detailUrl, {
                  headers: {
                    Accept: 'application/json',
                  },
                  cache: 'no-store',
                });

                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();

                  // Create a standardized token object
                  const tokenData = {
                    id: detailData.id,
                    symbol: detailData.symbol.toUpperCase(),
                    name: detailData.name,
                    image: detailData.image?.small || detailData.image?.thumb,
                    current_price: detailData.market_data?.current_price?.usd || 0,
                    market_cap: detailData.market_data?.market_cap?.usd || 0,
                    market_cap_rank: detailData.market_cap_rank || 999999,
                    price_change_percentage_24h:
                      detailData.market_data?.price_change_percentage_24h || 0,
                    price_change_percentage_7d:
                      detailData.market_data?.price_change_percentage_7d || 0,
                    price_change_percentage_30d:
                      detailData.market_data?.price_change_percentage_30d || 0,
                    ath: detailData.market_data?.ath?.usd || 0,
                    ath_date: detailData.market_data?.ath_date?.usd || '',
                    volume_24h: detailData.market_data?.total_volume?.usd || 0,
                    circulating_supply: detailData.market_data?.circulating_supply || 0,
                    total_supply: detailData.market_data?.total_supply || 0,
                    max_supply: detailData.market_data?.max_supply || null,
                    description: detailData.description?.en?.slice(0, 200) || '',
                    platforms: detailData.platforms || {},
                  };

                  detailedTokens.push(tokenData);

                  // Store in database for future searches
                  try {
                    await PostgresDB.upsertToken(
                      tokenData.id,
                      tokenData.symbol,
                      tokenData.name,
                      tokenData
                    );
                    logger.log(`Stored token in database: ${tokenData.symbol} (${tokenData.name})`);
                  } catch (dbError) {
                    logger.error(`Error storing token in database: ${dbError}`);
                  }
                }
              } catch (detailError) {
// @ts-ignore
                logger.error(`Error fetching details for ${coin.id}:`, detailError);
              }
            }

            if (detailedTokens.length > 0) {
              searchResults = detailedTokens;
              logger.log(`Found ${searchResults.length} detailed tokens from CoinGecko`);
            }
          }
        } else {
          logger.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }
      } catch (apiError) {
        logger.error('Error fetching from CoinGecko API:', apiError);
      }
    }

    // Cache the results
    try {
      await RedisCache.set(cacheKey, searchResults, 60 * 30); // Cache for 30 minutes
      logger.log(`Cached search results for query "${query}"`);
    } catch (cacheError) {
      logger.error('Error caching search results:', cacheError);
    }

    logger.log(`Returning ${searchResults.length} search results`);
    return NextResponse.json(searchResults);
  } catch (error) {
    logger.error('Error searching tokens:', error);

    // Return empty array on error instead of falling back to mock data
    logger.log('Error during search, returning empty array');
    return NextResponse.json([]);
  }
}
