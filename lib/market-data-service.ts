import axios from 'axios';
import { RedisCache } from './redis-cache';
import { PostgresDB } from './postgres-db';
import { logger } from '@/lib/logger';

// Define types for market data
export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
}

export interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  sol_dominance: number;
  last_updated: string;
}

// Service to handle market data from multiple sources
export class MarketDataService {
  private static instance: MarketDataService;

  // API keys - would ideally come from environment variables
  private apiKeys = {
    coingecko: process.env.COINGECKO_API_KEY || '',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || '',
    // Additional API keys here
  };

  // Multiple data sources with priorities
  private dataSources = [
    // Primary sources
    { name: 'jupiter', isAvailable: true, baseUrl: 'https://price.jup.ag/v4' },
    { name: 'pyth', isAvailable: false, baseUrl: 'https://api.pyth.network' },
    // Fallback sources
    {
      name: 'coingecko',
      isAvailable: !!this.apiKeys.coingecko,
      baseUrl: 'https://pro-api.coingecko.com/api/v3',
    },
    {
      name: 'coinmarketcap',
      isAvailable: !!this.apiKeys.coinmarketcap,
      baseUrl: 'https://pro-api.coinmarketcap.com/v1',
    },
  ];

  // Cache TTLs for different data types (in seconds)
  private cacheTTLs = {
    price: 60, // 1 minute
    marketData: 300, // 5 minutes
    tokenInfo: 1800, // 30 minutes
    trending: 600, // 10 minutes
  };

  // Token symbol to CoinGecko ID mapping
  private tokenIdMap: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    JUP: 'jupiter',
    BONK: 'bonk',
    JTO: 'jito-dao',
    USDC: 'usd-coin',
    USDT: 'tether',
  };

  // Use singleton pattern
  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  // Allow direct instantiation for testing and integration with AI services
  constructor() {
    // Initialize data sources
    this.initializeDataSources();
  }

  private async initializeDataSources() {
    try {
      // Check which data sources are available
      const availableSources = this.dataSources.filter(source => source.isAvailable);
      logger.log(
        `Initialized market data service with ${availableSources.length} available sources: ${availableSources.map(s => s.name).join(', ')}`
      );

      // Test connectivity to each source
      // In production, we would test each source and update isAvailable accordingly
    } catch (error) {
      logger.error('Error initializing market data service:', error);
    }
  }

  // Get market data from cache first, then sources
  private async getFromCacheOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await RedisCache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch fresh data
      const data = await fetchFn();

      // Cache the result
      await RedisCache.set(cacheKey, data, ttl);

      return data;
    } catch (error) {
      logger.error(`Error fetching data for ${cacheKey}:`, error);
      return null;
    }
  }

  // Get token price from multiple sources with fallback
  async getTokenPrice(tokenIdOrSymbol: string): Promise<number | null> {
    const tokenId = this.tokenIdMap[tokenIdOrSymbol.toUpperCase()] || tokenIdOrSymbol;
    const cacheKey = `price:${tokenId}`;

    return this.getFromCacheOrFetch<number>(
      cacheKey,
      async () => {
        // Try each data source in order of priority
        for (const source of this.dataSources.filter(s => s.isAvailable)) {
          try {
            let price: number | null = null;

            if (source.name === 'jupiter') {
              price = await this.getJupiterPrice(tokenId);
            } else if (source.name === 'pyth') {
              price = await this.getPythPrice(tokenId);
            } else if (source.name === 'coingecko') {
              price = await this.getCoingeckoPrice(tokenId);
            } else if (source.name === 'coinmarketcap') {
              price = await this.getCoinMarketCapPrice(tokenId);
            }

            if (price !== null) {
              logger.log(`Got price for ${tokenId} from ${source.name}: ${price}`);
              return price;
            }
          } catch (error) {
            logger.error(`Error fetching price from ${source.name}:`, error);
            // Continue to next source
          }
        }

        // If all sources fail, use dummy data for now
        logger.warn(`All sources failed for ${tokenId}, using mock data`);
        return this.getMockPrice(tokenId);
      },
      this.cacheTTLs.price
    );
  }

  // Get detailed token info from multiple sources
  async getTokenInfo(tokenIdOrSymbol: string): Promise<TokenPrice | null> {
    const tokenId = this.tokenIdMap[tokenIdOrSymbol.toUpperCase()] || tokenIdOrSymbol;
    const cacheKey = `token:${tokenId}`;

    return this.getFromCacheOrFetch<TokenPrice>(
      cacheKey,
      async () => {
        // Try each data source in order of priority
        for (const source of this.dataSources.filter(s => s.isAvailable)) {
          try {
            let tokenInfo: TokenPrice | null = null;

            if (source.name === 'coingecko') {
              tokenInfo = await this.getCoingeckoTokenInfo(tokenId);
            } else if (source.name === 'coinmarketcap') {
              tokenInfo = await this.getCoinMarketCapTokenInfo(tokenId);
            }

            if (tokenInfo !== null) {
              return tokenInfo;
            }
          } catch (error) {
            logger.error(`Error fetching token info from ${source.name}:`, error);
            // Continue to next source
          }
        }

        // If all sources fail, use dummy data for now
        return this.getMockTokenInfo(tokenId);
      },
      this.cacheTTLs.tokenInfo
    );
  }

  // Get trending tokens from CoinGecko
  async getTrendingTokens(): Promise<TokenPrice[]> {
    const cacheKey = 'trending_tokens';

    const result = await this.getFromCacheOrFetch<TokenPrice[]>(
      cacheKey,
      async () => {
        try {
          // Try to get from CoinGecko first
          if (this.dataSources.find(s => s.name === 'coingecko')?.isAvailable) {
            const response = await axios.get(
              `https://pro-api.coingecko.com/api/v3/search/trending`,
              {
                headers: {
                  'x-cg-pro-api-key': this.apiKeys.coingecko,
                },
              }
            );

            if (response.data?.coins) {
              // Process CoinGecko response
              const trendingIds = response.data.coins.map((coin: unknown) => coin.item.id);

              // Get detailed price data for these tokens
              const prices = await this.getTokenPrices(trendingIds);

              return Object.entries(prices).map(([id, priceData]) => ({
                id,
                symbol: priceData.symbol,
                name: priceData.name,
                current_price: priceData.price,
                price_change_percentage_24h: priceData.price_change_24h,
                market_cap: priceData.market_cap || 0,
                volume_24h: priceData.volume_24h || 0,
                last_updated: new Date().toISOString(),
              }));
            }
          }
        } catch (error) {
          logger.error('Error fetching trending tokens:', error);
        }

        // Fall back to mock data if API fails
        return this.getMockTrendingTokens();
      },
      this.cacheTTLs.trending
    );

    // Ensure we always return an array, never null
    return result || this.getMockTrendingTokens();
  }

  // Get market overview data (total market cap, volume, etc.)
  async getMarketOverview(): Promise<MarketOverview> {
    const cacheKey = 'market_overview';

    const result = await this.getFromCacheOrFetch<MarketOverview>(
      cacheKey,
      async () => {
        // Try each data source in order of priority
        for (const source of this.dataSources.filter(s => s.isAvailable)) {
          try {
            let overview: MarketOverview | null = null;

            if (source.name === 'coingecko') {
              overview = await this.getCoingeckoMarketOverview();
            } else if (source.name === 'coinmarketcap') {
              overview = await this.getCoinMarketCapOverview();
            }

            if (overview !== null) {
              return overview;
            }
          } catch (error) {
            logger.error(`Error fetching market overview from ${source.name}:`, error);
            // Continue to next source
          }
        }

        // If all sources fail, use dummy data for now
        return this.getMockMarketOverview();
      },
      this.cacheTTLs.marketData
    );

    // Ensure we always return a valid market overview, never null
    return result || this.getMockMarketOverview();
  }

  // Get prices for multiple tokens at once
  async getTokenPrices(tokens: string[]): Promise<
    Record<
      string,
      {
        price: number;
        price_change_24h: number;
        market_cap?: number;
        volume_24h?: number;
        symbol: string;
        name: string;
      }
    >
  > {
    const cacheKey = `prices:${tokens.sort().join(',')}`;

    const result = await this.getFromCacheOrFetch<Record<string, any>>(
      cacheKey,
      async () => {
        // Try each data source in order of priority
        for (const source of this.dataSources.filter(s => s.isAvailable)) {
          try {
            let prices: Record<string, any> | null = null;

            if (source.name === 'coingecko') {
              prices = await this.getCoingeckoBulkPrices(tokens);
            } else if (source.name === 'coinmarketcap') {
              prices = await this.getCoinMarketCapBulkPrices(tokens);
            }

            if (prices !== null) {
              return prices;
            }
          } catch (error) {
            logger.error(`Error fetching bulk prices from ${source.name}:`, error);
            // Continue to next source
          }
        }

        // If all sources fail, use dummy data for now
        return this.getMockBulkPrices(tokens);
      },
      this.cacheTTLs.price
    );

    // Ensure we always return a valid result, never null
    return result || this.getMockBulkPrices(tokens);
  }

  // Historical price data for a token
  async getTokenPriceHistory(
    tokenIdOrSymbol: string,
    days: number = 7
  ): Promise<{
    prices: [number, number][];
    market_caps: [number, number][];
    volumes: [number, number][];
  }> {
    const tokenId = this.tokenIdMap[tokenIdOrSymbol.toUpperCase()] || tokenIdOrSymbol;
    const cacheKey = `history:${tokenId}:${days}`;

    return this.getFromCacheOrFetch<unknown>(
      cacheKey,
      async () => {
        // Try CoinGecko first
        if (this.dataSources.find(s => s.name === 'coingecko')?.isAvailable) {
          try {
            const response = await axios.get(
              `https://pro-api.coingecko.com/api/v3/coins/${tokenId}/market_chart`,
              {
                params: {
                  vs_currency: 'usd',
                  days: days,
                },
                headers: {
                  'x-cg-pro-api-key': this.apiKeys.coingecko,
                },
              }
            );

            if (response.data) {
              return {
                prices: response.data.prices,
                market_caps: response.data.market_caps,
                volumes: response.data.total_volumes,
              };
            }
          } catch (error) {
            logger.error('Error fetching price history from CoinGecko:', error);
          }
        }

        // If CoinGecko fails, use mock data
        return this.getMockPriceHistory(tokenId, days);
      },
      days * 60
    ); // Cache based on the number of days requested
  }

  // Implementation for Jupiter API
  private async getJupiterPrice(tokenId: string): Promise<number | null> {
    try {
      const symbol = Object.entries(this.tokenIdMap).find(([_, id]) => id === tokenId)?.[0];
      if (!symbol) return null;

      // Jupiter only supports Solana tokens
      const response = await axios.get(`https://price.jup.ag/v4/price?ids=${symbol}`);

      if (response.data?.data?.[symbol]?.price) {
        return response.data.data[symbol].price;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching price from Jupiter:', error);
      return null;
    }
  }

  // Implementation for Pyth Network
  private async getPythPrice(tokenId: string): Promise<number | null> {
    try {
      // Pyth Network integration would go here in production
      return null;
    } catch (error) {
      logger.error('Error fetching price from Pyth:', error);
      return null;
    }
  }

  // Implementation for CoinGecko
  private async getCoingeckoPrice(tokenId: string): Promise<number | null> {
    try {
      const response = await axios.get(`https://pro-api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
        },
        headers: {
          'x-cg-pro-api-key': this.apiKeys.coingecko,
        },
      });

      if (response.data?.[tokenId]?.usd) {
        return response.data[tokenId].usd;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching price from CoinGecko:', error);
      return null;
    }
  }

  // Implementation for CoinMarketCap
  private async getCoinMarketCapPrice(tokenId: string): Promise<number | null> {
    try {
      // Would be implemented for production
      return null;
    } catch (error) {
      logger.error('Error fetching price from CoinMarketCap:', error);
      return null;
    }
  }

  // Get detailed token info from CoinGecko
  private async getCoingeckoTokenInfo(tokenId: string): Promise<TokenPrice | null> {
    try {
      const response = await axios.get(`https://pro-api.coingecko.com/api/v3/coins/${tokenId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
        headers: {
          'x-cg-pro-api-key': this.apiKeys.coingecko,
        },
      });

      if (response.data?.market_data) {
        const data = response.data;
        return {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          current_price: data.market_data.current_price.usd,
          price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
          market_cap: data.market_data.market_cap.usd,
          volume_24h: data.market_data.total_volume.usd,
          last_updated: data.last_updated,
        };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching token info from CoinGecko:', error);
      return null;
    }
  }

  // Get detailed token info from CoinMarketCap
  private async getCoinMarketCapTokenInfo(tokenId: string): Promise<TokenPrice | null> {
    // Would implement for production
    return null;
  }

  // Get market overview from CoinGecko
  private async getCoingeckoMarketOverview(): Promise<MarketOverview | null> {
    try {
      const response = await axios.get(`https://pro-api.coingecko.com/api/v3/global`, {
        headers: {
          'x-cg-pro-api-key': this.apiKeys.coingecko,
        },
      });

      if (response.data?.data) {
        const data = response.data.data;
        return {
          total_market_cap: data.total_market_cap.usd,
          total_volume_24h: data.total_volume.usd,
          btc_dominance: data.market_cap_percentage.btc,
          eth_dominance: data.market_cap_percentage.eth,
          sol_dominance: data.market_cap_percentage.sol || 0,
          last_updated: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching market overview from CoinGecko:', error);
      return null;
    }
  }

  // Get market overview from CoinMarketCap
  private async getCoinMarketCapOverview(): Promise<MarketOverview | null> {
    // Would implement for production
    return null;
  }

  // Get bulk prices from CoinGecko
  private async getCoingeckoBulkPrices(tokens: string[]): Promise<Record<string, any> | null> {
    try {
      const response = await axios.get(`https://pro-api.coingecko.com/api/v3/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: tokens.join(','),
          price_change_percentage: '24h',
          per_page: 250,
        },
        headers: {
          'x-cg-pro-api-key': this.apiKeys.coingecko,
        },
      });

      if (response.data) {
        const result: Record<string, any> = {};

        response.data.forEach((coin: unknown) => {
          result[coin.id] = {
            price: coin.current_price,
            price_change_24h: coin.price_change_percentage_24h || 0,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            symbol: coin.symbol,
            name: coin.name,
          };
        });

        return result;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching bulk prices from CoinGecko:', error);
      return null;
    }
  }

  // Get bulk prices from CoinMarketCap
  private async getCoinMarketCapBulkPrices(tokens: string[]): Promise<Record<string, any> | null> {
    // Would implement for production
    return null;
  }

  // Utility: Generate mock data for demo purposes
  private getMockPrice(tokenId: string): number {
    // Return reasonable mock prices based on token
    const mockPrices: Record<string, number> = {
      bitcoin: 65000 + (Math.random() * 2000 - 1000),
      ethereum: 3500 + (Math.random() * 200 - 100),
      solana: 145 + (Math.random() * 10 - 5),
      jupiter: 0.85 + (Math.random() * 0.1 - 0.05),
      bonk: 0.00001547 + (Math.random() * 0.000001 - 0.0000005),
      'jito-dao': 2.87 + (Math.random() * 0.2 - 0.1),
      'usd-coin': 1.0,
      tether: 1.0,
    };

    return mockPrices[tokenId] || 1.0;
  }

  private getMockTokenInfo(tokenId: string): TokenPrice {
    const price = this.getMockPrice(tokenId);
    const priceChange = Math.random() * 10 - 5; // -5% to +5%

    return {
      id: tokenId,
      symbol: tokenId.slice(0, 4).toUpperCase(),
      name: tokenId.charAt(0).toUpperCase() + tokenId.slice(1),
      current_price: price,
      price_change_percentage_24h: priceChange,
      market_cap: price * (Math.random() * 1000000000 + 100000000),
      volume_24h: price * (Math.random() * 100000000 + 10000000),
      last_updated: new Date().toISOString(),
    };
  }

  private getMockTrendingTokens(): TokenPrice[] {
    return [
      this.getMockTokenInfo('solana'),
      this.getMockTokenInfo('jupiter'),
      this.getMockTokenInfo('bonk'),
      this.getMockTokenInfo('jito-dao'),
      this.getMockTokenInfo('ethereum'),
    ];
  }

  private getMockMarketOverview(): MarketOverview {
    return {
      total_market_cap: 2500000000000,
      total_volume_24h: 120000000000,
      btc_dominance: 45 + (Math.random() * 5 - 2.5),
      eth_dominance: 15 + (Math.random() * 3 - 1.5),
      sol_dominance: 3 + (Math.random() * 1 - 0.5),
      last_updated: new Date().toISOString(),
    };
  }

  private getMockPriceHistory(
    tokenId: string,
    days: number
  ): {
    prices: [number, number][];
    market_caps: [number, number][];
    volumes: [number, number][];
  } {
    const now = Date.now();
    const basePrice = this.getMockPrice(tokenId);
    const dayMs = 24 * 60 * 60 * 1000;
    const intervals = days * 24; // Hourly data points

    const prices: [number, number][] = [];
    const market_caps: [number, number][] = [];
    const volumes: [number, number][] = [];

    for (let i = 0; i < intervals; i++) {
      const timestamp = now - (intervals - i) * (dayMs / 24);
      const sinFactor = Math.sin(i / (intervals / 6)) * 0.1; // Add some sine wave variance
      const randomFactor = Math.random() * 0.1 - 0.05; // Add some randomness

      const price = basePrice * (1 + sinFactor + randomFactor);
      prices.push([timestamp, price]);

      const marketCap = price * (Math.random() * 1000000000 + 100000000);
      market_caps.push([timestamp, marketCap]);

      const volume = price * (Math.random() * 100000000 + 10000000);
      volumes.push([timestamp, volume]);
    }

    return {
      prices,
      market_caps,
      volumes,
    };
  }

  private getMockBulkPrices(tokens: string[]): Record<
    string,
    {
      price: number;
      price_change_24h: number;
      market_cap?: number;
      volume_24h?: number;
      symbol: string;
      name: string;
    }
  > {
    const result: Record<string, any> = {};

    tokens.forEach(token => {
      const price = this.getMockPrice(token);
      const priceChange = Math.random() * 10 - 5; // -5% to +5%

      result[token] = {
        price,
        price_change_24h: priceChange,
        market_cap: price * (Math.random() * 1000000000 + 100000000),
        volume_24h: price * (Math.random() * 100000000 + 10000000),
        symbol: token.slice(0, 4).toUpperCase(),
        name: token.charAt(0).toUpperCase() + token.slice(1),
      };
    });

    return result;
  }
}

// Export a singleton instance for use across the application
export const marketDataService = MarketDataService.getInstance();
