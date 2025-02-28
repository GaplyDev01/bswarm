// @ts-nocheck
// Mock createTool implementation since the actual import doesn't work
// import { createTool } from '@ai-sdk/react';
// TODO: Replace 'any' with a more specific type
// TODO: Replace 'any' with a more specific type
// @ts-ignore
const createTool = ({ name, description, schema, execute }: unknown) => ({
  name,
  description,
  schema,
  execute,
});
import { z } from 'zod';
import { searchTokens, getTokenPrices, cachedCoinGeckoRequest, CACHE_TTLS } from '../coingecko-api';
import { logger } from '@/lib/logger';

// Define the response type for better type safety
export interface TokenPriceResponse {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  change_7d: number;
  volume_24h: number;
  market_cap: number;
  rank: number;
  last_updated: string;
  data_source: string;
  error_info?: string;
}

// Define fallback data
const getFallbackData = (symbol: string): TokenPriceResponse => ({
  symbol,
  price:
    symbol === 'SOL' ? 146.78 : symbol === 'BTC' ? 67582.45 : symbol === 'ETH' ? 3456.32 : 10.0,
  change_24h: symbol === 'SOL' ? 5.2 : symbol === 'BTC' ? -1.3 : symbol === 'ETH' ? 2.7 : 0,
  change_7d: symbol === 'SOL' ? 12.5 : symbol === 'BTC' ? 3.7 : symbol === 'ETH' ? 8.2 : 0.5,
  volume_24h:
    symbol === 'SOL'
      ? 3245000000
      : symbol === 'BTC'
        ? 38760000000
        : symbol === 'ETH'
          ? 15420000000
          : 500000,
  market_cap:
    symbol === 'SOL'
      ? 62450000000
      : symbol === 'BTC'
        ? 1320000000000
        : symbol === 'ETH'
          ? 420000000000
          : 10000000,
  rank: symbol === 'SOL' ? 5 : symbol === 'BTC' ? 1 : symbol === 'ETH' ? 2 : 100,
  name:
    symbol === 'SOL'
      ? 'Solana'
      : symbol === 'BTC'
        ? 'Bitcoin'
        : symbol === 'ETH'
          ? 'Ethereum'
          : symbol,
  last_updated: new Date().toISOString(),
  data_source: 'fallback',
});

interface MarketData {
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  total_volume: { usd: number };
  market_cap: { usd: number };
}

interface CoinGeckoResponse {
  market_data: MarketData;
  market_cap_rank: number;
}

export const tokenPriceTool = createTool({
  name: 'get_token_price',
  description: 'Get the price and market data for a cryptocurrency token',
  schema: z.object({
    symbol: z
      .string()
      .describe('The cryptocurrency symbol to get price information for (e.g., BTC, ETH, SOL)'),
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    logger.log(`Executing tokenPriceTool for symbol: ${symbol}`);

    try {
      // Validate symbol
      if (!symbol) {
        logger.error('No symbol provided for get_token_price');
        throw new Error('No cryptocurrency symbol provided');
      }

      logger.log(`Fetching price data for ${symbol} from CoinGecko`);

      // Search for the token to get the proper ID
      const searchResults = await searchTokens(symbol);

// @ts-ignore
      if (!searchResults || !searchResults.coins || searchResults.coins.length === 0) {
        logger.error(`No search results found for symbol: ${symbol}`);
        throw new Error(`Could not find information for ${symbol}`);
      }

      // Get the coin ID from the first _result
      const coinId = searchResults.coins[0].id;
      const coinName = searchResults.coins[0].name;
      logger.log(`Found coin ID for ${symbol}: ${coinId} (${coinName})`);

      // Fetch price data
      const priceData = await getTokenPrices([coinId], ['usd']);

      if (!priceData || !priceData[coinId]) {
        logger.error(`No price data found for coin ID: ${coinId}`);
        throw new Error(`Could not retrieve price information for ${symbol}`);
      }

      // Get more detailed market data if available
      let marketData: CoinGeckoResponse | null = null;
      try {
// @ts-ignore
        marketData = await cachedCoinGeckoRequest(
          `/coins/${coinId}`,
          { localization: false, tickers: false, community_data: false, developer_data: false },
          CACHE_TTLS.marketData
        );
        logger.log(`Retrieved detailed market data for ${coinId}`);
      } catch (marketError) {
        logger.error(`Error fetching detailed market data for ${coinId}:`, marketError);
        // We'll continue with basic price data
      }

      // Format the response with as much data as we have
      const response: TokenPriceResponse = {
        symbol,
        name: coinName,
        price: priceData[coinId].usd || 0,
        change_24h: marketData?.market_data?.price_change_percentage_24h || 0,
        change_7d: marketData?.market_data?.price_change_percentage_7d || 0,
        volume_24h: marketData?.market_data?.total_volume?.usd || 0,
        market_cap: marketData?.market_data?.market_cap?.usd || 0,
        rank: marketData?.market_cap_rank || 0,
        last_updated: new Date().toISOString(),
        data_source: 'coingecko',
      };

      logger.log(`Successfully retrieved data for ${symbol}:`, response);
      return response;
    } catch (error) {
      logger.error(`Error in tokenPriceTool for ${symbol}:`, error);
      // Fallback to hardcoded data
      const fallbackData = getFallbackData(symbol);
      fallbackData.error_info = `Using fallback data due to error: ${error instanceof Error ? error.message : String(error)}`;
      return fallbackData;
    }
  },
});

export { searchTokens, getTokenPrices, cachedCoinGeckoRequest, CACHE_TTLS } from '../coingecko-api';
