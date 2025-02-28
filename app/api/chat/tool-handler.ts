/**
 * Tool handler for BlockSwarms
 * This file handles function calling for AI models
 */

// Fix import path
import {
  getTokenPrices,
  searchTokens,
  getTokenData,
  getMarketChart,
} from '../../../lib/coingecko-api';
import { logger } from '../../../lib/logger';

/**
 * Handle tool calls from AI models
 * @param toolName Name of the tool being called
 * @param args Arguments for the tool
 * @returns Result of the tool call
 */
export async function handleToolCall(toolName: string, args: unknown) {
  logger.log(`Handling tool call: ${toolName} with args:`, args);

  // Provide default args if they're missing or if symbol is missing
  if (!args || Object.keys(args).length === 0 || !(args as any).symbol) {
    logger.log('Tool call missing args or symbol, defaulting to SOL');
    
    // Set default tools that require a symbol
    const toolsRequiringSymbol = [
      'get_token_price',
      'get_token_market_chart',
      'get_token_details',
    ];
    
    // If this is a tool that requires a symbol, add a default one
    if (toolsRequiringSymbol.includes(toolName)) {
      // Safely add default symbol
      args = { ...(args as object || {}), symbol: 'SOL' };
    }
  }

  // Get token price and market data
  if (toolName === 'get_token_price' && (args as any).symbol) {
    const symbol = ((args as any).symbol as string).toUpperCase();
    logger.log(`Getting price for token: ${symbol}`);
    
    try {
      // First search for the token to get its CoinGecko ID
      const searchResults = await searchTokens(symbol);
      logger.log(`Search results:`, (searchResults as any)?.coins?.slice(0, 2));
      
      // Check if we found the token
      if ((searchResults as any)?.coins && (searchResults as any).coins.length > 0) {
        // Find the matching coin by symbol or name
        const matchingCoin = (searchResults as any).coins.find(
          (coin: any) => 
            coin.symbol.toLowerCase() === symbol.toLowerCase() ||
            coin.name.toLowerCase().includes(symbol.toLowerCase())
        );

        if (matchingCoin) {
          logger.log(`Found matching coin:`, matchingCoin);
          const tokenId = (matchingCoin as any).id;
          
          // Get detailed token data
          const tokenData = await getTokenData(tokenId);
          
          // Extract current price and other market data
          const result = {
            symbol: symbol,
            id: tokenId,
            price: {
              current_price: (tokenData as any).market_data?.current_price?.usd || 0,
              price_change_24h: (tokenData as any).market_data?.price_change_percentage_24h || 0,
              price_change_7d: (tokenData as any).market_data?.price_change_percentage_7d || 0,
              market_cap: (tokenData as any).market_data?.market_cap?.usd || 0,
              volume_24h: (tokenData as any).market_data?.total_volume?.usd || 0,
            },
            timestamp: new Date().toISOString(),
          };

          return result;
        }
      }

      // Fallback to simulated data if no real data found
      return generateSimulatedTokenPrice(symbol);
    } catch (error) {
      logger.error(`Error getting token price for ${symbol}:`, error);
      // Provide simulated data as fallback
      return generateSimulatedTokenPrice(symbol);
    }
  }

  // Handle market chart data
  if (toolName === 'get_token_market_chart') {
    const symbol = ((args as any).symbol || 'SOL') as string;
    const days = ((args as any).days || 7) as number;
    
    try {
      // Search for the token first to get its ID
      const searchResults = await searchTokens(symbol);
      
      if ((searchResults as any)?.coins && (searchResults as any).coins.length > 0) {
        // Find the matching coin
        const matchingCoin = (searchResults as any).coins.find(
          (coin: any) => 
            coin.symbol.toLowerCase() === symbol.toLowerCase() ||
            coin.name.toLowerCase().includes(symbol.toLowerCase())
        );
        
        if (matchingCoin) {
          const tokenId = (matchingCoin as any).id;
          
          // Get chart data
          const chartData = await getMarketChart(tokenId, days);
          
          // Return formatted chart data
          return {
            symbol: symbol,
            id: tokenId,
            days: days,
            price_chart: (chartData as any)?.prices || [],
            market_cap_chart: (chartData as any)?.market_caps || [],
            volume_chart: (chartData as any)?.total_volumes || [],
            timestamp: new Date().toISOString(),
          };
        }
      }
      
      return {
        error: `Could not find token with symbol: ${symbol}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error getting market chart for ${symbol}:`, error);
      return {
        error: `Failed to retrieve market chart for ${symbol}`,
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Simple token chart data
  else if (toolName === 'get_token_chart_data') {
    const symbol = ((args as any).symbol || 'SOL').toUpperCase();
    // Generate simulated price and volume data for a token
    return {
      symbol,
      data: generateSimulatedPriceData(symbol),
      timestamp: new Date().toISOString()
    };
  }

  // Generate technical indicators
  else if (toolName === 'get_technical_indicators') {
    const symbol = ((args as any).symbol || 'SOL').toUpperCase();
    const timeframe = ((args as any).timeframe || '1d') as string;
    
    return generateSimulatedTechnicalIndicators(symbol, timeframe);
  }

  // Generate market sentiment
  else if (toolName === 'get_market_sentiment') {
    const symbol = ((args as any).symbol || 'SOL').toUpperCase();
    return generateSimulatedMarketSentiment(symbol);
  }

  // Portfolio analysis
  else if (toolName === 'analyze_portfolio') {
    // Extract portfolio from args or use default empty array if not provided
    const portfolio = ((args as any).portfolio || []) as any[];
    
    // Analyze the portfolio with a risk profile (default to balanced)
    return analyzePortfolio(portfolio, ((args as any).riskProfile || 'balanced') as string);
  }

  // Fallback
  return {
    message: `Tool '${toolName}' execution completed, but no specific data handler was found.`,
    args: args,
  };
}

// Helper function to generate simulated token price data
function generateSimulatedTokenPrice(symbol: string) {
  // Base prices for common tokens to make the simulation more realistic
  const basePrices: Record<string, number> = {
    SOL: 143.27,
    BTC: 62892.45,
    ETH: 3376.81,
    DEFAULT: 3.75,
  };

  const price = basePrices[symbol] || basePrices.DEFAULT;
  const randomChange = Math.random() * 10 - 5; // Random between -5% and +5%

  return {
    symbol: symbol,
    name: getTokenName(symbol),
    current_price: price,
    price_change_24h: randomChange,
    price_change_7d: randomChange * 1.5,
    market_cap: price * getRandomNumber(1000000, 10000000000),
    volume_24h: price * getRandomNumber(100000, 1000000000),
    circulating_supply: getRandomNumber(10000000, 1000000000),
    total_supply: getRandomNumber(10000000, 2000000000),
    all_time_high: price * (1 + getRandomNumber(0.2, 2)),
    ath_date: '2021-11-10T14:24:11.849Z',
    ath_change_percentage: -1 * getRandomNumber(10, 50),
  };
}

// Helper function to generate simulated technical indicators
function generateSimulatedTechnicalIndicators(symbol: string, timeframe: string) {
  return {
    symbol: symbol,
    timeframe: timeframe,
    updated_at: new Date().toISOString(),
    indicators: {
      rsi: getRandomNumber(30, 70),
      macd: {
        value: getRandomNumber(-10, 10),
        signal: getRandomNumber(-8, 8),
        histogram: getRandomNumber(-5, 5),
      },
      moving_averages: {
        sma_20: getRandomNumber(50, 500),
        sma_50: getRandomNumber(50, 500),
        sma_200: getRandomNumber(50, 500),
        ema_12: getRandomNumber(50, 500),
        ema_26: getRandomNumber(50, 500),
      },
      bollinger_bands: {
        upper: getRandomNumber(100, 1000),
        middle: getRandomNumber(80, 900),
        lower: getRandomNumber(60, 800),
      },
      support_resistance: {
        support_levels: [
          getRandomNumber(40, 400),
          getRandomNumber(30, 390),
          getRandomNumber(20, 380),
        ],
        resistance_levels: [
          getRandomNumber(410, 600),
          getRandomNumber(610, 800),
          getRandomNumber(810, 1000),
        ],
      },
    },
    trend: randomChoice(['bullish', 'bearish', 'neutral']),
    signals: {
      buy_signals: getRandomNumber(0, 5),
      sell_signals: getRandomNumber(0, 5),
      strength: randomChoice(['strong', 'moderate', 'weak']),
    },
  };
}

// Helper function to generate simulated market sentiment
function generateSimulatedMarketSentiment(symbol: string) {
  return {
    symbol: symbol,
    updated_at: new Date().toISOString(),
    social_sentiment: {
      twitter: {
        sentiment_score: getRandomNumber(-100, 100),
        volume: getRandomNumber(1000, 100000),
        bullish_percentage: getRandomNumber(30, 80),
      },
      reddit: {
        sentiment_score: getRandomNumber(-100, 100),
        mentions: getRandomNumber(50, 5000),
        bullish_percentage: getRandomNumber(30, 80),
      },
      telegram: {
        sentiment_score: getRandomNumber(-100, 100),
        active_channels: getRandomNumber(5, 100),
        user_activity: getRandomNumber(500, 50000),
      },
    },
    news_sentiment: {
      recent_articles: getRandomNumber(5, 100),
      average_sentiment: getRandomNumber(-100, 100),
      major_events: randomChoice([
        'Partnership announcement',
        'Protocol upgrade',
        'Security audit',
        'Exchange listing',
        'None',
      ]),
    },
    market_sentiment: {
      fear_greed_index: getRandomNumber(0, 100),
      long_short_ratio: getRandomNumber(0.5, 2),
      trader_sentiment: randomChoice(['bullish', 'bearish', 'neutral']),
    },
    institutional_activity: {
      whales: {
        accumulation: randomChoice(['increasing', 'decreasing', 'stable']),
        large_transactions: getRandomNumber(5, 50),
      },
      exchange_flows: {
        net_flow: getRandomNumber(-10000, 10000),
        inflow: getRandomNumber(5000, 50000),
        outflow: getRandomNumber(5000, 50000),
      },
    },
  };
}

/**
 * Analyze a portfolio of tokens and provide recommendations
 * @param tokens Array of tokens with allocations
 * @param riskProfile Risk profile of the user (conservative, balanced, aggressive)
 * @returns Analysis and recommendations
 */
function analyzePortfolio(tokens: { symbol: string; allocation: number }[], riskProfile: string) {
  // Calculate diversification score
  const diversificationScore = calculateDiversificationScore(tokens);

  // Calculate total value
  const totalValue = calculateTotalValue(tokens);

  // Generate target allocations based on risk profile
  const targetAllocations = generateTargetAllocations(tokens, riskProfile);

  // Calculate rebalancing recommendations
  const rebalancingRecommendations = [];

  // Normalize current allocations to percentages
  const totalAllocation = tokens.reduce((sum, token) => sum + token.allocation, 0);
  const normalizedAllocations = tokens.map(token => ({
    symbol: token.symbol,
    current_percentage: (token.allocation / totalAllocation) * 100,
    target_percentage: targetAllocations[token.symbol] || 0,
  }));

  // Generate rebalancing recommendations
  for (const token of normalizedAllocations) {
    const difference = token.target_percentage - token.current_percentage;

    if (Math.abs(difference) > 2) {
      rebalancingRecommendations.push({
        symbol: token.symbol,
        action: difference > 0 ? 'buy' : 'sell',
        current_percentage: token.current_percentage.toFixed(2) + '%',
        target_percentage: token.target_percentage.toFixed(2) + '%',
        difference: Math.abs(difference).toFixed(2) + '%',
      });
    }
  }

  return {
    portfolio_value: totalValue,
    diversification_score: diversificationScore,
    risk_assessment: riskProfile,
    portfolio_health:
      diversificationScore > 70
        ? 'good'
        : diversificationScore > 50
          ? 'moderate'
          : 'needs improvement',
    rebalancing_recommendations: rebalancingRecommendations,
    asset_allocation: {
      current: normalizedAllocations.map(token => ({
        symbol: token.symbol,
        percentage: token.current_percentage.toFixed(2) + '%',
      })),
      target: Object.entries(targetAllocations).map(([symbol, percentage]) => ({
        symbol,
        percentage: percentage.toFixed(2) + '%',
      })),
    },
  };
}

// Helper functions for portfolio analysis
function calculateDiversificationScore(tokens: { symbol: string; allocation: number }[]): number {
  if (tokens.length <= 1) return 30;
  if (tokens.length <= 3) return 50;
  if (tokens.length <= 5) return 70;
  return 85;
}

function calculateTotalValue(tokens: { symbol: string; allocation: number }[]): number {
  // Base prices for common tokens to make the simulation more realistic
  const prices: Record<string, number> = {
    SOL: 143.27,
    BTC: 62974.38,
    ETH: 3352.05,
    DEFAULT: 100, // Default price for unknown tokens
  };

  return tokens.reduce((total: number, token) => {
    const price = prices[token.symbol] || prices.DEFAULT;
    return total + token.allocation * price;
  }, 0);
}

function generateTargetAllocations(tokens: { symbol: string; allocation: number }[], riskProfile: string): Record<string, number> {
  // Default allocation templates based on risk profiles
  const baseAllocations = {
    conservative: {
      BTC: 15,
      ETH: 10,
      SOL: 5,
      USDC: 60,
      Other: 10,
    },
    balanced: {
      BTC: 25,
      ETH: 20,
      SOL: 15,
      'Other L1s': 10,
      DeFi: 15,
      USDC: 15,
    },
    growth: {
      BTC: 30,
      ETH: 25,
      SOL: 20,
      DeFi: 10,
      'NFT/Gaming': 10,
      'Small caps': 5,
    },
    aggressive: {
      BTC: 20,
      ETH: 20,
      SOL: 25,
      DeFi: 15,
      'NFT/Gaming': 15,
      'Small caps': 5,
    },
  };

  return baseAllocations[riskProfile as keyof typeof baseAllocations] || baseAllocations.balanced;
}

// Utility functions
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function getTokenName(symbol: string): string {
  const tokenNames: Record<string, string> = {
    SOL: 'Solana',
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    AVAX: 'Avalanche',
    DOT: 'Polkadot',
    DOGE: 'Dogecoin',
    USDC: 'USD Coin',
    USDT: 'Tether',
    MATIC: 'Polygon',
    ADA: 'Cardano',
    LINK: 'Chainlink',
    XRP: 'Ripple',
    UNI: 'Uniswap',
    SHIB: 'Shiba Inu',
    LTC: 'Litecoin',
    ATOM: 'Cosmos',
    ALGO: 'Algorand',
    FIL: 'Filecoin',
    XLM: 'Stellar',
    XMR: 'Monero',
  };

  return tokenNames[symbol] || `${symbol} Token`;
}

function generateSimulatedPriceData(symbol: string) {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const price = getRandomNumber(50, 500);
    data.push({
      date: date.toISOString(),
      price,
      volume: getRandomNumber(1000, 100000),
    });
  }
  return data;
}
