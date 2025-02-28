import { _OpenAI } from 'openai';
import { StreamingTextResponse, _Message, _AIStream } from 'ai';
import { _RedisCache } from '@/lib/redis-cache';
import { _PostgresDB } from '@/lib/postgres-db';
import { generateTradesXBTSystemPrompt } from '@/lib/tradesxbt-prompt';
import { tokenPriceTool } from '@/lib/tools';
import { anthropic } from '@ai-sdk/anthropic';
import { _getAnthropicApiKey, _getGroqApiKey } from '@/lib/env';
import { _handleClaudeChat } from './claude-handler';
import { _handleLlamaChat } from './llama-handler';
import { _handleGroqChat, handleGroqChatStream } from './groq-handler';
import { _createOpenAI as createGroq } from '@ai-sdk/openai';

// Remove the runtime export for Next.js 15 compatibility
// export const _runtime = 'edge';

// Define advanced tools for the AI to provide comprehensive trading insights
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_token_price',
      description:
        'Get the current price and 24h change of a cryptocurrency token with additional market data',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_technical_indicators',
      description:
        'Get detailed technical indicators for a token including RSI, MACD, Moving Averages, and support/resistance levels',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
          timeframe: {
            type: 'string',
            description: 'Timeframe for analysis (1h, 4h, 1d, 1w)',
            enum: ['1h', '4h', '1d', '1w'],
          },
        },
        required: ['symbol', 'timeframe'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_token_chart_data',
      description: 'Get historical price data, volume, and market cap for a cryptocurrency token',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
          days: {
            type: 'number',
            description: 'Number of days of historical data to retrieve (1, 7, 30, 90)',
            enum: [1, 7, 30, 90],
          },
          interval: {
            type: 'string',
            description: 'Data interval (hourly, daily)',
            enum: ['hourly', 'daily'],
          },
        },
        required: ['symbol', 'days'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_sentiment',
      description:
        'Get comprehensive market sentiment analysis including social metrics, Fear & Greed index, and whale movements',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_on_chain_metrics',
      description:
        'Get on-chain metrics for a token including active addresses, transaction volume, network growth, and token distribution',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
          metrics: {
            type: 'array',
            description: 'Specific metrics to retrieve',
            items: {
              type: 'string',
              enum: [
                'active_addresses',
                'transaction_volume',
                'token_velocity',
                'whale_transactions',
                'supply_distribution',
              ],
            },
          },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_trading_signals',
      description:
        'Get actionable trading signals based on technical analysis, on-chain metrics, and sentiment',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
          timeframe: {
            type: 'string',
            description: 'Timeframe for signals (short_term, medium_term, long_term)',
            enum: ['short_term', 'medium_term', 'long_term'],
          },
          risk_level: {
            type: 'string',
            description: 'Risk tolerance level for signals',
            enum: ['conservative', 'moderate', 'aggressive'],
          },
        },
        required: ['symbol', 'timeframe'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_token_ecosystem',
      description:
        "Get information about a token's ecosystem, partnerships, upcoming events, and development activity",
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The symbol of the token (e.g., SOL, BTC, ETH)',
          },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_portfolio',
      description:
        'Analyze a portfolio of tokens and provide allocation recommendations and risk assessment',
      parameters: {
        type: 'object',
        properties: {
          tokens: {
            type: 'array',
            description: 'List of tokens in the portfolio with their allocations',
            items: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Token symbol',
                },
                allocation: {
                  type: 'number',
                  description: 'Percentage allocation (0-100)',
                },
              },
              required: ['symbol', 'allocation'],
            },
          },
          risk_profile: {
            type: 'string',
            description: 'Risk profile for recommendations',
            enum: ['conservative', 'balanced', 'growth', 'aggressive'],
          },
        },
        required: ['tokens'],
      },
    },
  },
];

// Import CoinGecko API functions
import { getTokenPrices, searchTokens, _getTokenData, _getMarketChart } from '@/lib/coingecko-api';
import { logger } from '@/lib/logger';

// Function to handle tool calls with comprehensive trading insights
async function handleToolCall(toolName: string, args: unknown) {
  logger.log(`Handling tool call: ${toolName} with args:`, args);

  // If args is empty or missing symbol, and toolName requires a symbol, add default "SOL"
  if (!args || Object.keys(args).length === 0 || !args.symbol) {
    // These tools require a symbol parameter
    const _toolsRequiringSymbol = [
      'get_token_price',
      'get_technical_indicators',
      'get_token_chart_data',
      'get_market_sentiment',
      'get_on_chain_metrics',
      'get_trading_signals',
      'get_token_ecosystem',
    ];

    if (toolsRequiringSymbol.includes(toolName)) {
      logger.log(`No symbol provided for ${toolName}, using default SOL`);
      args = { ...args, symbol: 'SOL' };
    }
  }

  // Try to get real data for token prices and basic information when possible
  try {
    if (toolName === 'get_token_price' && args.symbol) {
      // First try to search for the token to get its CoinGecko ID
      const symbol = args.symbol.toLowerCase();
      logger.log(`Searching for token with symbol: ${symbol}`);

      const searchResults = await searchTokens(symbol);
      logger.log(`Search results:`, searchResults?.coins?.slice(0, 2));

      if (searchResults?.coins && searchResults.coins.length > 0) {
        // Find the most relevant result matching the symbol
        const matchingCoin = searchResults.coins.find(
          (coin: unknown) =>
            coin.symbol.toLowerCase() === symbol.toLowerCase() ||
            coin.name.toLowerCase().includes(symbol.toLowerCase())
        );

        if (matchingCoin) {
          logger.log(`Found matching coin:`, matchingCoin.id);

          // Get token price data
          const priceData = await getTokenPrices([matchingCoin.id], ['usd'], {
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true,
          });

          if (priceData && priceData[matchingCoin.id]) {
            logger.log(`Got real price data for ${matchingCoin.id}`);

            const coinData = priceData[matchingCoin.id];
            return {
              symbol: args.symbol.toUpperCase(),
              name: matchingCoin.name,
              price: coinData.usd || 0,
              change_24h: coinData.usd_24h_change || 0,
              market_cap: coinData.usd_market_cap || 0,
              volume_24h: coinData.usd_24h_vol || 0,
              id: matchingCoin.id,
              last_updated: new Date().toISOString(),
              source: 'CoinGecko API (Live Data)',
            };
          }
        }
      }

      logger.log(`Falling back to mock data for ${args.symbol}`);
    }
  } catch (error) {
    logger.error(`Error fetching real token data:`, error);
    logger.log(`Falling back to mock data for ${toolName}`);
  }

  // Mock data with detailed trading insights for demonstration purposes
  switch (toolName) {
    case 'get_token_price':
      try {
        // Call our typed tool instead
        return await tokenPriceTool.execute({ symbol: args.symbol });
      } catch (error) {
        logger.error(`Error in get_token_price for ${args.symbol}:`, error);
        // Fallback to hardcoded data
        return {
          symbol: args.symbol,
          price:
            args.symbol === 'SOL'
              ? 146.78
              : args.symbol === 'BTC'
                ? 67582.45
                : args.symbol === 'ETH'
                  ? 3456.32
                  : 10.0,
          change_24h:
            args.symbol === 'SOL'
              ? 5.2
              : args.symbol === 'BTC'
                ? -1.3
                : args.symbol === 'ETH'
                  ? 2.7
                  : 0,
          change_7d:
            args.symbol === 'SOL'
              ? 12.5
              : args.symbol === 'BTC'
                ? 3.7
                : args.symbol === 'ETH'
                  ? 8.2
                  : 0.5,
          volume_24h:
            args.symbol === 'SOL'
              ? 3245000000
              : args.symbol === 'BTC'
                ? 38760000000
                : args.symbol === 'ETH'
                  ? 15420000000
                  : 500000,
          market_cap:
            args.symbol === 'SOL'
              ? 62450000000
              : args.symbol === 'BTC'
                ? 1320000000000
                : args.symbol === 'ETH'
                  ? 420000000000
                  : 10000000,
          rank:
            args.symbol === 'SOL' ? 5 : args.symbol === 'BTC' ? 1 : args.symbol === 'ETH' ? 2 : 100,
          last_updated: new Date().toISOString(),
          data_source: 'fallback',
          error_info: `Using fallback data due to error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }

    case 'get_technical_indicators':
      // Detailed technical analysis with actionable signals
      return {
        symbol: args.symbol,
        timeframe: args.timeframe,
        rsi:
          args.symbol === 'SOL'
            ? 62.3
            : args.symbol === 'BTC'
              ? 48.7
              : args.symbol === 'ETH'
                ? 55.4
                : 50,
        rsi_signal:
          args.symbol === 'SOL'
            ? 'neutral with bullish bias'
            : args.symbol === 'BTC'
              ? 'neutral'
              : args.symbol === 'ETH'
                ? 'neutral'
                : 'neutral',
        macd: {
          value:
            args.symbol === 'SOL'
              ? 2.1
              : args.symbol === 'BTC'
                ? -0.5
                : args.symbol === 'ETH'
                  ? 1.2
                  : 0,
          signal:
            args.symbol === 'SOL'
              ? 1.5
              : args.symbol === 'BTC'
                ? 0.2
                : args.symbol === 'ETH'
                  ? 0.8
                  : 0,
          histogram:
            args.symbol === 'SOL'
              ? 0.6
              : args.symbol === 'BTC'
                ? -0.7
                : args.symbol === 'ETH'
                  ? 0.4
                  : 0,
          trend:
            args.symbol === 'SOL'
              ? 'bullish'
              : args.symbol === 'BTC'
                ? 'bearish'
                : args.symbol === 'ETH'
                  ? 'bullish'
                  : 'neutral',
        },
        moving_averages: {
          ma_20:
            args.symbol === 'SOL'
              ? 142.3
              : args.symbol === 'BTC'
                ? 68100.25
                : args.symbol === 'ETH'
                  ? 3410.75
                  : 9.5,
          ma_50:
            args.symbol === 'SOL'
              ? 138.45
              : args.symbol === 'BTC'
                ? 67250.8
                : args.symbol === 'ETH'
                  ? 3380.2
                  : 9.2,
          ma_200:
            args.symbol === 'SOL'
              ? 125.8
              : args.symbol === 'BTC'
                ? 63450.3
                : args.symbol === 'ETH'
                  ? 3150.45
                  : 8.75,
          ema_20:
            args.symbol === 'SOL'
              ? 144.2
              : args.symbol === 'BTC'
                ? 67900.3
                : args.symbol === 'ETH'
                  ? 3425.6
                  : 9.6,
          cross_signals:
            args.symbol === 'SOL'
              ? 'Golden cross forming on daily'
              : args.symbol === 'BTC'
                ? 'Above all major MAs, bullish'
                : args.symbol === 'ETH'
                  ? 'Above all major MAs, bullish'
                  : 'No significant crosses',
        },
        support_resistance: {
          support_levels:
            args.symbol === 'SOL'
              ? [140.5, 135.2, 128.75]
              : args.symbol === 'BTC'
                ? [65000, 62500, 58000]
                : args.symbol === 'ETH'
                  ? [3350, 3200, 3000]
                  : [9.0, 8.5, 8.0],
          resistance_levels:
            args.symbol === 'SOL'
              ? [150.0, 155.75, 162.3]
              : args.symbol === 'BTC'
                ? [69000, 72500, 75000]
                : args.symbol === 'ETH'
                  ? [3500, 3650, 3800]
                  : [10.5, 11.0, 11.5],
          key_level:
            args.symbol === 'SOL'
              ? '150.00 is crucial resistance'
              : args.symbol === 'BTC'
                ? '69000 ATH resistance'
                : args.symbol === 'ETH'
                  ? '3500 psychological resistance'
                  : '10.00 psychological level',
        },
        additional_indicators: {
          stochastic:
            args.symbol === 'SOL'
              ? { value: 75, signal: 'approaching overbought' }
              : args.symbol === 'BTC'
                ? { value: 45, signal: 'neutral' }
                : args.symbol === 'ETH'
                  ? { value: 62, signal: 'neutral with bullish bias' }
                  : { value: 50, signal: 'neutral' },
          bollinger_bands:
            args.symbol === 'SOL'
              ? { width: 8.2, position: 'upper band test' }
              : args.symbol === 'BTC'
                ? { width: 5.5, position: 'middle band' }
                : args.symbol === 'ETH'
                  ? { width: 6.8, position: 'upper half' }
                  : { width: 5.0, position: 'middle band' },
          volume_profile:
            args.symbol === 'SOL'
              ? 'Increasing on uptrends, healthy buying pressure'
              : args.symbol === 'BTC'
                ? 'Decreasing volume on recent moves, caution advised'
                : args.symbol === 'ETH'
                  ? 'Consistent volume, accumulation pattern'
                  : 'Low trading volume',
        },
        analysis_summary:
          args.symbol === 'SOL'
            ? 'Bullish momentum with strong buying pressure. Watch the 150 resistance level for potential breakout.'
            : args.symbol === 'BTC'
              ? 'Consolidation phase with slight bearish bias short-term. Support at 65,000 is crucial.'
              : args.symbol === 'ETH'
                ? 'Momentum building with positive indicators. Needs to clear 3,500 for continued uptrend.'
                : 'Neutral technical outlook with no clear direction',
      };

    case 'get_token_chart_data':
      // Detailed chart data with more granular data points and pattern analysis
      const dataPoints = 20; // Number of data points to generate
      const startTime = Date.now() - 86400000 * (args.days || 7);
      const timeInterval = (Date.now() - startTime) / dataPoints;

      // Generate realistic price movement
      const prices = [];
      const volumes = [];
      const marketCaps = [];

      const basePrice =
        args.symbol === 'SOL'
          ? 135.24
          : args.symbol === 'BTC'
            ? 63000
            : args.symbol === 'ETH'
              ? 3300
              : 9.0;

      const volatility =
        args.symbol === 'SOL'
          ? 0.03
          : args.symbol === 'BTC'
            ? 0.02
            : args.symbol === 'ETH'
              ? 0.025
              : 0.04;

      let currentPrice = basePrice;

      for (let i = 0; i < dataPoints; i++) {
        const change = (Math.random() - 0.45) * volatility * currentPrice; // Slightly biased upward
        currentPrice += change;

        const timestamp = startTime + timeInterval * i;
        const volume =
          (Math.random() * 0.5 + 0.75) *
          (args.symbol === 'SOL'
            ? 2000000000
            : args.symbol === 'BTC'
              ? 25000000000
              : args.symbol === 'ETH'
                ? 10000000000
                : 300000);
        const marketCap =
          currentPrice *
          (args.symbol === 'SOL'
            ? 400000000
            : args.symbol === 'BTC'
              ? 19500000
              : args.symbol === 'ETH'
                ? 120000000
                : 1000000);

        prices.push({ timestamp, price: currentPrice });
        volumes.push({ timestamp, volume });
        marketCaps.push({ timestamp, marketCap });
      }

      return {
        symbol: args.symbol,
        days: args.days || 7,
        interval: args.interval || 'daily',
        price_data: prices,
        volume_data: volumes,
        market_cap_data: marketCaps,
        patterns_detected:
          args.symbol === 'SOL'
            ? ['Cup and handle forming', 'Higher lows established']
            : args.symbol === 'BTC'
              ? ['Descending triangle', 'Support test']
              : args.symbol === 'ETH'
                ? ['Ascending channel', 'Bull flag on 4h']
                : ['No clear patterns'],
        trend_analysis:
          args.symbol === 'SOL'
            ? 'Strong uptrend with accelerating momentum'
            : args.symbol === 'BTC'
              ? 'Consolidation with slight bearish bias short-term'
              : args.symbol === 'ETH'
                ? 'Steady uptrend forming'
                : 'Choppy price action, no clear trend',
      };

    case 'get_market_sentiment':
      // Comprehensive sentiment analysis with social metrics and whale activity
      return {
        symbol: args.symbol,
        overall_sentiment:
          args.symbol === 'SOL'
            ? 'strongly bullish'
            : args.symbol === 'BTC'
              ? 'neutral to slightly bearish'
              : args.symbol === 'ETH'
                ? 'moderately bullish'
                : 'neutral',
        social_metrics: {
          twitter_sentiment:
            args.symbol === 'SOL'
              ? 82
              : args.symbol === 'BTC'
                ? 61
                : args.symbol === 'ETH'
                  ? 75
                  : 50,
          twitter_volume:
            args.symbol === 'SOL'
              ? 'very high'
              : args.symbol === 'BTC'
                ? 'high'
                : args.symbol === 'ETH'
                  ? 'high'
                  : 'low',
          reddit_sentiment:
            args.symbol === 'SOL'
              ? 78
              : args.symbol === 'BTC'
                ? 58
                : args.symbol === 'ETH'
                  ? 72
                  : 50,
          social_dominance:
            args.symbol === 'SOL'
              ? 12.3
              : args.symbol === 'BTC'
                ? 35.7
                : args.symbol === 'ETH'
                  ? 18.5
                  : 0.5,
          trending_topics:
            args.symbol === 'SOL'
              ? ['NFT integration', 'Mainnet upgrade', 'DeFi growth']
              : args.symbol === 'BTC'
                ? ['ETF flows', 'Inflation hedge', 'MicroStrategy']
                : args.symbol === 'ETH'
                  ? [
                      'Layer 2 ecosystem expanding',
                      'Staking yields attractive',
                      'Deflation rate increases',
                    ]
                  : ['No significant trends'],
        },
        fear_and_greed_index: {
          current:
            args.symbol === 'SOL'
              ? 75
              : args.symbol === 'BTC'
                ? 48
                : args.symbol === 'ETH'
                  ? 68
                  : 50,
          yesterday:
            args.symbol === 'SOL'
              ? 72
              : args.symbol === 'BTC'
                ? 52
                : args.symbol === 'ETH'
                  ? 65
                  : 51,
          last_week:
            args.symbol === 'SOL'
              ? 65
              : args.symbol === 'BTC'
                ? 58
                : args.symbol === 'ETH'
                  ? 62
                  : 53,
          interpretation:
            args.symbol === 'SOL'
              ? 'Greed - market may be overheated'
              : args.symbol === 'BTC'
                ? 'Fear - possible accumulation opportunity'
                : args.symbol === 'ETH'
                  ? 'Greed - optimism high'
                  : 'Neutral sentiment',
        },
        whale_activity: {
          large_transactions_24h:
            args.symbol === 'SOL'
              ? 28
              : args.symbol === 'BTC'
                ? 45
                : args.symbol === 'ETH'
                  ? 32
                  : 5,
          whale_accumulation:
            args.symbol === 'SOL'
              ? 'Strong accumulation by whales'
              : args.symbol === 'BTC'
                ? 'Mixed signals, some distribution'
                : args.symbol === 'ETH'
                  ? 'Modest accumulation'
                  : 'No significant activity',
          exchange_inflows:
            args.symbol === 'SOL'
              ? 'Decreasing - bullish signal'
              : args.symbol === 'BTC'
                ? 'Increasing - caution advised'
                : args.symbol === 'ETH'
                  ? 'Stable - neutral signal'
                  : 'No significant change',
          stablecoin_flows:
            args.symbol === 'SOL'
              ? 'Capital flowing in from stables'
              : args.symbol === 'BTC'
                ? 'Stablecoin reserves building on exchanges'
                : args.symbol === 'ETH'
                  ? 'Moderate inflows from stables'
                  : 'No significant flows',
        },
        institutional_sentiment:
          args.symbol === 'SOL'
            ? 'Growing institutional interest with new funds adding exposure'
            : args.symbol === 'BTC'
              ? 'Cautious positioning with some profit-taking'
              : args.symbol === 'ETH'
                ? 'Increasing institutional flows particularly post-ETF approval'
                : 'Limited institutional coverage',
        news_sentiment: {
          recent_news_impact:
            args.symbol === 'SOL'
              ? 'Highly positive'
              : args.symbol === 'BTC'
                ? 'Mixed'
                : args.symbol === 'ETH'
                  ? 'Positive'
                  : 'Neutral',
          key_headlines:
            args.symbol === 'SOL'
              ? [
                  'Major partnership announced',
                  'Network upgrade successful',
                  'DeFi TVL hits new high',
                ]
              : args.symbol === 'BTC'
                ? [
                    'ETF outflows concern traders',
                    'Mining difficulty increases',
                    'Lightning network adoption grows',
                  ]
                : args.symbol === 'ETH'
                  ? [
                      'Layer 2 ecosystem expanding',
                      'Staking yields attractive',
                      'Deflation rate increases',
                    ]
                  : ['No major headlines'],
        },
        analyst_ratings:
          args.symbol === 'SOL'
            ? '9 bullish, 3 neutral, 0 bearish'
            : args.symbol === 'BTC'
              ? '5 bullish, 6 neutral, 3 bearish'
              : args.symbol === 'ETH'
                ? '7 bullish, 4 neutral, 1 bearish'
                : 'No analyst coverage',
      };

    case 'get_on_chain_metrics':
      // Detailed on-chain analytics with actionable insights
      return {
        symbol: args.symbol,
        active_addresses: {
          daily_active:
            args.symbol === 'SOL'
              ? 842560
              : args.symbol === 'BTC'
                ? 1025400
                : args.symbol === 'ETH'
                  ? 940500
                  : 25000,
          change_7d:
            args.symbol === 'SOL'
              ? 12.5
              : args.symbol === 'BTC'
                ? -3.2
                : args.symbol === 'ETH'
                  ? 5.8
                  : 1.0,
          new_addresses_24h:
            args.symbol === 'SOL'
              ? 25800
              : args.symbol === 'BTC'
                ? 18500
                : args.symbol === 'ETH'
                  ? 22300
                  : 1200,
          analysis:
            args.symbol === 'SOL'
              ? 'Strong growth in new users - bullish signal'
              : args.symbol === 'BTC'
                ? 'Slight decline in activity - caution warranted'
                : args.symbol === 'ETH'
                  ? 'Steady growth in network usage'
                  : 'Low but stable activity',
        },
        transaction_volume: {
          daily_volume_usd:
            args.symbol === 'SOL'
              ? 4850000000
              : args.symbol === 'BTC'
                ? 28750000000
                : args.symbol === 'ETH'
                  ? 15620000000
                  : 750000,
          daily_transactions:
            args.symbol === 'SOL'
              ? 1250000
              : args.symbol === 'BTC'
                ? 325000
                : args.symbol === 'ETH'
                  ? 1450000
                  : 35000,
          avg_transaction_value:
            args.symbol === 'SOL'
              ? 3880
              : args.symbol === 'BTC'
                ? 88461
                : args.symbol === 'ETH'
                  ? 10772
                  : 21,
          change_7d:
            args.symbol === 'SOL'
              ? 18.5
              : args.symbol === 'BTC'
                ? -2.8
                : args.symbol === 'ETH'
                  ? 7.2
                  : 0.5,
          analysis:
            args.symbol === 'SOL'
              ? 'Substantial increase in transaction volume signals growing adoption'
              : args.symbol === 'BTC'
                ? 'Volume decline suggests reduced trading activity'
                : args.symbol === 'ETH'
                  ? 'Healthy increase in transaction activity'
                  : 'Low transaction volume',
        },
        supply_distribution: {
          top_10_holders_pct:
            args.symbol === 'SOL'
              ? 22.5
              : args.symbol === 'BTC'
                ? 5.2
                : args.symbol === 'ETH'
                  ? 18.7
                  : 45.2,
          top_100_holders_pct:
            args.symbol === 'SOL'
              ? 42.8
              : args.symbol === 'BTC'
                ? 14.5
                : args.symbol === 'ETH'
                  ? 38.4
                  : 78.5,
          supply_in_profit:
            args.symbol === 'SOL'
              ? 85.2
              : args.symbol === 'BTC'
                ? 76.5
                : args.symbol === 'ETH'
                  ? 78.9
                  : 52.0,
          active_supply_1y:
            args.symbol === 'SOL'
              ? 65.8
              : args.symbol === 'BTC'
                ? 55.4
                : args.symbol === 'ETH'
                  ? 62.7
                  : 35.0,
          analysis:
            args.symbol === 'SOL'
              ? 'Well distributed supply with healthy movement'
              : args.symbol === 'BTC'
                ? 'Excellent distribution, true decentralization'
                : args.symbol === 'ETH'
                  ? 'Good distribution with growing diversification'
                  : 'Concerning concentration among few holders',
        },
        network_health: {
          avg_fee_usd:
            args.symbol === 'SOL'
              ? 0.00025
              : args.symbol === 'BTC'
                ? 2.85
                : args.symbol === 'ETH'
                  ? 3.25
                  : 0.05,
          hash_rate_change:
            args.symbol === 'SOL'
              ? 8.5
              : args.symbol === 'BTC'
                ? 5.2
                : args.symbol === 'ETH'
                  ? 6.8
                  : 1.2,
          developer_activity:
            args.symbol === 'SOL'
              ? 'Very high - 280+ active devs'
              : args.symbol === 'BTC'
                ? 'Steady - 100+ active devs'
                : args.symbol === 'ETH'
                  ? 'Very high - 350+ active devs'
                  : 'Low - fewer than 10 active devs',
          analysis:
            args.symbol === 'SOL'
              ? 'Extremely healthy network with excellent performance metrics'
              : args.symbol === 'BTC'
                ? 'Rock solid security with growing hashrate'
                : args.symbol === 'ETH'
                  ? 'Strong network fundamentals with growing adoption'
                  : 'Limited network activity raises sustainability questions',
        },
      };

    case 'get_trading_signals':
      // Actionable trading signals with clear risk assessment
      return {
        symbol: args.symbol,
        timeframe: args.timeframe || 'short_term',
        risk_level: args.risk_level || 'moderate',
        overall_signal:
          args.symbol === 'SOL'
            ? args.timeframe === 'short_term'
              ? 'Strong Buy'
              : 'Buy'
            : args.symbol === 'BTC'
              ? args.timeframe === 'short_term'
                ? 'Hold'
                : 'Buy'
              : args.symbol === 'ETH'
                ? args.timeframe === 'short_term'
                  ? 'Buy'
                  : 'Buy'
                : 'Hold',
        confidence_score:
          args.symbol === 'SOL' ? 85 : args.symbol === 'BTC' ? 65 : args.symbol === 'ETH' ? 78 : 50,
        technical_signals: {
          trend_strength:
            args.symbol === 'SOL'
              ? 'Strong'
              : args.symbol === 'BTC'
                ? 'Moderate'
                : args.symbol === 'ETH'
                  ? 'Moderate'
                  : 'Weak',
          momentum:
            args.symbol === 'SOL'
              ? 'Bullish'
              : args.symbol === 'BTC'
                ? 'Neutral'
                : args.symbol === 'ETH'
                  ? 'Bullish'
                  : 'Neutral',
          key_levels: {
            entry:
              args.symbol === 'SOL'
                ? 144.8
                : args.symbol === 'BTC'
                  ? 66500
                  : args.symbol === 'ETH'
                    ? 3430
                    : 9.8,
            target_1:
              args.symbol === 'SOL'
                ? 152.5
                : args.symbol === 'BTC'
                  ? 69500
                  : args.symbol === 'ETH'
                    ? 3650
                    : 10.5,
            target_2:
              args.symbol === 'SOL'
                ? 158.75
                : args.symbol === 'BTC'
                  ? 72500
                  : args.symbol === 'ETH'
                    ? 3850
                    : 11.2,
            target_3:
              args.symbol === 'SOL'
                ? 175.0
                : args.symbol === 'BTC'
                  ? 78000
                  : args.symbol === 'ETH'
                    ? 4200
                    : 12.5,
            stop_loss:
              args.symbol === 'SOL'
                ? 138.4
                : args.symbol === 'BTC'
                  ? 62800
                  : args.symbol === 'ETH'
                    ? 3280
                    : 9.1,
          },
          risk_reward_ratio:
            args.symbol === 'SOL'
              ? '3.2:1'
              : args.symbol === 'BTC'
                ? '2.5:1'
                : args.symbol === 'ETH'
                  ? '2.8:1'
                  : '2.0:1',
        },
        on_chain_signals: {
          accumulation:
            args.symbol === 'SOL'
              ? 'Strong'
              : args.symbol === 'BTC'
                ? 'Neutral'
                : args.symbol === 'ETH'
                  ? 'Moderate'
                  : 'Weak',
          exchange_flows:
            args.symbol === 'SOL'
              ? 'Bullish - outflows from exchanges'
              : args.symbol === 'BTC'
                ? 'Cautious - slight inflows to exchanges'
                : args.symbol === 'ETH'
                  ? 'Neutral - balanced flows'
                  : 'Bearish - inflows to exchanges',
          network_growth:
            args.symbol === 'SOL'
              ? 'Excellent'
              : args.symbol === 'BTC'
                ? 'Good'
                : args.symbol === 'ETH'
                  ? 'Very good'
                  : 'Fair',
        },
        sentiment_signals: {
          market_sentiment:
            args.symbol === 'SOL'
              ? 'Bullish'
              : args.symbol === 'BTC'
                ? 'Neutral'
                : args.symbol === 'ETH'
                  ? 'Bullish'
                  : 'Neutral',
          social_sentiment:
            args.symbol === 'SOL'
              ? 'Very bullish'
              : args.symbol === 'BTC'
                ? 'Neutral'
                : args.symbol === 'ETH'
                  ? 'Bullish'
                  : 'Neutral',
          contrarian_indicator:
            args.symbol === 'SOL'
              ? 'Watch for extreme optimism signals'
              : args.symbol === 'BTC'
                ? 'No contrarian signals'
                : args.symbol === 'ETH'
                  ? 'No contrarian signals'
                  : 'No contrarian signals',
        },
        trading_strategy: {
          position_type:
            args.risk_level === 'aggressive'
              ? 'Long with leverage'
              : args.risk_level === 'moderate'
                ? 'Long spot'
                : 'DCA approach',
          entry_strategy:
            args.symbol === 'SOL'
              ? 'Buy breakout above 147.00 or retest of 143.50 support'
              : args.symbol === 'BTC'
                ? 'Buy on dips near 65,000 support'
                : args.symbol === 'ETH'
                  ? 'Buy on break above 3,500 or retest of 3,350 support'
                  : 'Wait for clearer signal',
          exit_strategy:
            'Scale out at each target level. Move stop to breakeven after Target 1 hit.',
          position_sizing:
            args.risk_level === 'aggressive'
              ? '8-10% of portfolio'
              : args.risk_level === 'moderate'
                ? '5-7% of portfolio'
                : '2-4% of portfolio',
        },
        market_conditions: {
          overall_market: 'Mixed conditions with sector-specific strength',
          correlated_assets:
            args.symbol === 'SOL'
              ? 'Watch BTC and ETH for confirmation of overall market direction'
              : args.symbol === 'BTC'
                ? 'Watch traditional markets, particularly NASDAQ and Gold'
                : args.symbol === 'ETH'
                  ? 'Watch broader DeFi sector and BTC'
                  : 'Watch BTC for overall market direction',
          liquidity_assessment:
            args.symbol === 'SOL'
              ? 'Excellent liquidity across major exchanges'
              : args.symbol === 'BTC'
                ? 'Highest liquidity in crypto markets'
                : args.symbol === 'ETH'
                  ? 'Very high liquidity'
                  : 'Moderate liquidity, watch for slippage',
        },
      };

    case 'get_token_ecosystem':
      // Comprehensive ecosystem analysis with key metrics and project insights
      return {
        symbol: args.symbol,
        project_overview: {
          name:
            args.symbol === 'SOL'
              ? 'Solana'
              : args.symbol === 'BTC'
                ? 'Bitcoin'
                : args.symbol === 'ETH'
                  ? 'Ethereum'
                  : args.symbol,
          category:
            args.symbol === 'SOL'
              ? 'Layer 1 / Smart Contract Platform'
              : args.symbol === 'BTC'
                ? 'Store of Value / Currency'
                : args.symbol === 'ETH'
                  ? 'Layer 1 / Smart Contract Platform'
                  : 'Cryptocurrency',
          launch_date:
            args.symbol === 'SOL'
              ? 'March 2020'
              : args.symbol === 'BTC'
                ? 'January 2009'
                : args.symbol === 'ETH'
                  ? 'July 2015'
                  : 'Unknown',
          consensus_mechanism:
            args.symbol === 'SOL'
              ? 'Proof of History + Proof of Stake'
              : args.symbol === 'BTC'
                ? 'Proof of Work'
                : args.symbol === 'ETH'
                  ? 'Proof of Stake'
                  : 'Unknown',
          description:
            args.symbol === 'SOL'
              ? 'High-performance L1 blockchain with low fees and fast transactions'
              : args.symbol === 'BTC'
                ? 'First cryptocurrency and largest by market cap'
                : args.symbol === 'ETH'
                  ? 'Programmable blockchain supporting smart contracts and dApps'
                  : 'Cryptocurrency token',
        },
        ecosystem_metrics: {
          active_developers:
            args.symbol === 'SOL'
              ? 282
              : args.symbol === 'BTC'
                ? 115
                : args.symbol === 'ETH'
                  ? 345
                  : 8,
          total_dapps:
            args.symbol === 'SOL'
              ? 1850
              : args.symbol === 'BTC'
                ? 50
                : args.symbol === 'ETH'
                  ? 4500
                  : 12,
          github_commits_30d:
            args.symbol === 'SOL'
              ? 1240
              : args.symbol === 'BTC'
                ? 380
                : args.symbol === 'ETH'
                  ? 1850
                  : 25,
          tvl_usd:
            args.symbol === 'SOL'
              ? 15800000000
              : args.symbol === 'BTC'
                ? 1200000000
                : args.symbol === 'ETH'
                  ? 58500000000
                  : 5000000,
          top_applications:
            args.symbol === 'SOL'
              ? ['Mango Markets', 'Raydium', 'Serum', 'Solend', 'Orca']
              : args.symbol === 'BTC'
                ? ['Rootstock', 'Lightning Network', 'Liquid Network']
                : args.symbol === 'ETH'
                  ? ['Uniswap', 'Aave', 'Compound', 'Lido', 'MakerDAO']
                  : ['Unknown'],
        },
        upcoming_events: {
          protocol_upgrades:
            args.symbol === 'SOL'
              ? ['Firedancer client Q3 2024', 'State compression improvements']
              : args.symbol === 'BTC'
                ? ['Taproot Assets upgrade deployment']
                : args.symbol === 'ETH'
                  ? ['Verkle Trees', 'EIP-4844 enhancements']
                  : ['No known upgrades'],
          conferences:
            args.symbol === 'SOL'
              ? ['Solana Breakpoint October 2024', 'Solana Hacker House Paris']
              : args.symbol === 'BTC'
                ? ['Bitcoin 2024 Conference', 'Baltic Honeybadger 2024']
                : args.symbol === 'ETH'
                  ? ['Devcon 2024', 'ETHDenver 2025']
                  : ['No known conferences'],
          key_launches:
            args.symbol === 'SOL'
              ? ['Jupiter Exchange token', 'New Solana Saga phone']
              : args.symbol === 'BTC'
                ? ['Lightning Network enhancements']
                : args.symbol === 'ETH'
                  ? ['Layer 2 token launches', 'zkEVM upgrades']
                  : ['No known launches'],
        },
        key_partnerships: {
          corporate:
            args.symbol === 'SOL'
              ? ['Visa', 'Shopify', 'Stripe']
              : args.symbol === 'BTC'
                ? ['Block (Square)', 'MicroStrategy', 'Tesla']
                : args.symbol === 'ETH'
                  ? ['Microsoft', 'EY', 'JPMorgan']
                  : ['None reported'],
          defi_integrations:
            args.symbol === 'SOL'
              ? ['Jupiter', 'Marinade Finance', 'Jito']
              : args.symbol === 'BTC'
                ? ['Lightning Labs', 'Rootstock']
                : args.symbol === 'ETH'
                  ? ['All major DeFi protocols', 'Chainlink', 'Polygon']
                  : ['None reported'],
        },
        developer_resources: {
          documentation:
            args.symbol === 'SOL'
              ? 'Comprehensive guides at docs.solana.com'
              : args.symbol === 'BTC'
                ? 'Bitcoin Core documentation, Bitcoin Improvement Proposals'
                : args.symbol === 'ETH'
                  ? 'Extensive docs at ethereum.org and EIPs'
                  : 'Limited documentation',
          programming_languages:
            args.symbol === 'SOL'
              ? ['Rust', 'C', 'C++', 'JavaScript']
              : args.symbol === 'BTC'
                ? ['C++', 'Python', 'Rust']
                : args.symbol === 'ETH'
                  ? ['Solidity', 'Vyper', 'JavaScript', 'Rust']
                  : ['Unknown'],
          grant_programs:
            args.symbol === 'SOL'
              ? 'Solana Foundation Grants, 20M+ fund'
              : args.symbol === 'BTC'
                ? 'Various grant programs through foundations'
                : args.symbol === 'ETH'
                  ? 'Ethereum Foundation Grants, Protocol Guild'
                  : 'No known grants',
        },
        community_health: {
          governance:
            args.symbol === 'SOL'
              ? 'Foundation-based with increasing decentralization'
              : args.symbol === 'BTC'
                ? 'BIP process with strong miner input'
                : args.symbol === 'ETH'
                  ? 'EIP process with core dev and community input'
                  : 'Unknown',
          social_activity:
            args.symbol === 'SOL'
              ? 'Very high and growing'
              : args.symbol === 'BTC'
                ? 'Extremely high, institutional focus'
                : args.symbol === 'ETH'
                  ? 'Very high with developer emphasis'
                  : 'Low',
          community_initiatives:
            args.symbol === 'SOL'
              ? 'Solana University program, hackathons, Breakpoint conference'
              : args.symbol === 'BTC'
                ? ['Bitcoin educational resources', 'conferences']
                : args.symbol === 'ETH'
                  ? ['DevCon', 'ETHGlobal hackathons', 'research grants']
                  : 'Limited initiatives',
        },
      };

    case 'analyze_portfolio':
      // Portfolio analysis with allocation recommendations
      const tokens = args.tokens || [];
      const riskProfile = args.risk_profile || 'balanced';

      // Calculate current allocation percentages
      const totalAllocation = tokens.reduce(
        (sum: number, token: { allocation: number }) => sum + token.allocation,
        0
      );
      const normalizedAllocations = tokens.map(
        // TODO: Replace 'any' with a more specific type
        // TODO: Replace 'any' with a more specific type
        (token: { allocation: number; [key: string]: unknown }) => ({
          ...token,
          normalizedAllocation: (token.allocation / totalAllocation) * 100,
        })
      );

      // Generate recommendations based on risk profile
      let recommendations: Array<{ action: string; reason: string; impact: string }> = [];
      let riskAssessment = '';

      if (riskProfile === 'conservative') {
        recommendations = [
          {
            action: 'Increase BTC allocation to 40-50%',
            reason: 'Store of value in uncertain markets',
            impact: 'Low risk',
          },
          {
            action: 'Increase ETH allocation to 20-30%',
            reason: 'Established smart contract platform',
            impact: 'Low risk',
          },
          {
            action: 'Limit SOL and other altcoins to 20% total',
            reason: 'Reduce volatility exposure',
            impact: 'Low risk',
          },
          {
            action: 'Add stablecoin position of 10-15%',
            reason: 'Capital preservation and buying opportunity fund',
            impact: 'Low risk',
          },
        ];
        riskAssessment =
          'Low risk profile with focus on established assets. Less upside potential but better capital preservation.';
      } else if (riskProfile === 'balanced') {
        recommendations = [
          {
            action: 'Maintain BTC allocation at 30-40%',
            reason: 'Core holding for stability',
            impact: 'Moderate risk',
          },
          {
            action: 'Maintain ETH allocation at 20-30%',
            reason: 'Established platform with growth potential',
            impact: 'Moderate risk',
          },
          {
            action: 'Allocate 20-30% to mid-cap Layer 1s like SOL',
            reason: 'Growth potential with acceptable risk',
            impact: 'Moderate risk',
          },
          {
            action: 'Consider 5-10% allocation to DeFi blue chips',
            reason: 'Sector exposure with reduced volatility',
            impact: 'Moderate risk',
          },
          {
            action: 'Maintain 5-10% in stablecoins',
            reason: 'Dry powder for opportunities',
            impact: 'Low risk',
          },
        ];
        riskAssessment =
          'Balanced risk profile with good diversification. Moderate upside potential with reasonable downside protection.';
      } else if (riskProfile === 'growth') {
        recommendations = [
          {
            action: 'Reduce BTC allocation to 20-25%',
            reason: 'Maintain some stability but focus on growth',
            impact: 'Moderate risk',
          },
          {
            action: 'Maintain ETH allocation at 15-25%',
            reason: 'Good balance of stability and ecosystem growth',
            impact: 'Moderate risk',
          },
          {
            action: 'Increase SOL and mid-cap L1s to 30-40%',
            reason: 'Higher growth potential',
            impact: 'Higher risk',
          },
          {
            action: 'Add 10-15% allocation to small-cap governance tokens',
            reason: 'High growth potential projects',
            impact: 'Higher risk',
          },
          {
            action: 'Consider 5-10% allocation to select NFT projects',
            reason: 'Uncorrelated alternative investment',
            impact: 'Higher risk',
          },
        ];
        riskAssessment =
          'Growth-oriented portfolio with higher volatility but increased upside potential. Monitor more actively.';
      } else if (riskProfile === 'aggressive') {
        recommendations = [
          {
            action: 'Reduce BTC allocation to 10-15%',
            reason: 'Maintain small base position for safety',
            impact: 'Higher risk',
          },
          {
            action: 'Reduce ETH allocation to 10-15%',
            reason: 'Maintain some established exposure',
            impact: 'Higher risk',
          },
          {
            action: 'Increase allocation to high-potential L1s like SOL to 30-40%',
            reason: 'Capture ecosystem growth',
            impact: 'Higher risk',
          },
          {
            action: 'Add 20-25% allocation to early-stage governance tokens',
            reason: 'High risk/reward opportunities',
            impact: 'Higher risk',
          },
          {
            action: 'Consider 10-15% allocation to new protocols with innovative mechanisms',
            reason: 'Potentially outsized returns',
            impact: 'Higher risk',
          },
        ];
        riskAssessment =
          'High-risk portfolio with substantial volatility. Significant upside potential but material risk of capital loss. Requires active management.';
      }

      return {
        portfolio_overview: {
          tokens: normalizedAllocations,
          risk_profile: riskProfile,
          diversification_score: calculateDiversificationScore(tokens),
          correlation_assessment: 'Moderate correlation between holdings',
          total_value: calculateTotalValue(tokens),
        },
        risk_assessment: {
          overall_risk:
            riskProfile === 'conservative'
              ? 'Low'
              : riskProfile === 'balanced'
                ? 'Medium'
                : riskProfile === 'growth'
                  ? 'Medium-High'
                  : 'High',
          volatility_estimate:
            riskProfile === 'conservative'
              ? '15-25% monthly volatility'
              : riskProfile === 'balanced'
                ? '25-40% monthly volatility'
                : riskProfile === 'growth'
                  ? '40-60% monthly volatility'
                  : '60-100% monthly volatility',
          drawdown_potential:
            riskProfile === 'conservative'
              ? '20-30% max drawdown'
              : riskProfile === 'balanced'
                ? '30-50% max drawdown'
                : riskProfile === 'growth'
                  ? '50-65% max drawdown'
                  : '65-80% max drawdown',
          detailed_assessment: riskAssessment,
        },
        portfolio_recommendations: {
          suggested_actions: recommendations,
          rebalancing_frequency:
            riskProfile === 'conservative'
              ? 'Quarterly'
              : riskProfile === 'balanced'
                ? 'Monthly'
                : riskProfile === 'growth'
                  ? 'Bi-weekly'
                  : 'Weekly',
          target_allocations: generateTargetAllocations(tokens, riskProfile),
        },
        market_outlook: {
          short_term: 'Market showing signs of rotation into altcoins',
          medium_term:
            'Overall bullish bias with potential volatility around regulatory developments',
          sectors_to_watch: [
            'DeFi',
            'Layer 2s',
            'Infrastructure tokens',
            'Real-world asset tokens',
          ],
        },
      };

    default:
      return {
        error: 'Tool not implemented',
        tool: toolName,
      };
  }
}

// Helper functions for portfolio analysis
function calculateDiversificationScore(tokens: unknown[]): number {
  // Simple diversification score based on number of tokens and allocation distribution
  // 0-100 scale, higher is better diversified
  if (!tokens || tokens.length === 0) return 0;

  const numTokens = tokens.length;
  let score = Math.min(numTokens * 10, 60); // Up to 60 points for number of tokens

  // Calculate standard deviation of allocations
  if (numTokens > 1) {
    const avg =
      tokens.reduce((sum: number, token: { allocation: number }) => sum + token.allocation, 0) /
      numTokens;
    const variance =
      tokens.reduce(
        (sum: number, token: { allocation: number }) => sum + Math.pow(token.allocation - avg, 2),
        0
      ) / numTokens;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation means better diversification
    const distributionScore = Math.max(0, 40 - stdDev * 2); // Up to 40 points for even distribution
    score += distributionScore;
  }

  return Math.round(Math.min(score, 100));
}

function calculateTotalValue(tokens: unknown[]): number {
  // Mock function to estimate portfolio value
  // In a real system this would use actual token prices
  const prices = {
    SOL: 146.78,
    BTC: 67582.45,
    ETH: 3456.32,
    // Default price for other tokens
    DEFAULT: 10.0,
  };

  return tokens.reduce((total: number, token: { allocation: number; symbol: string }) => {
    const price = prices[token.symbol as keyof typeof prices] || prices.DEFAULT;
    // Mock calculation - in reality would use actual amounts
    const tokenValue = (token.allocation / 100) * 100000; // Assuming $100k portfolio
    return total + tokenValue;
  }, 0);
}

function generateTargetAllocations(tokens: unknown[], riskProfile: string): Record<string, number> {
  // Generate target allocations based on risk profile
  const baseAllocations = {
    conservative: {
      BTC: 45,
      ETH: 25,
      SOL: 10,
      USDC: 15,
      Other: 5,
    },
    balanced: {
      BTC: 35,
      ETH: 25,
      SOL: 15,
      'Other L1s': 10,
      DeFi: 10,
      USDC: 5,
    },
    growth: {
      BTC: 20,
      ETH: 20,
      SOL: 25,
      'Other L1s': 15,
      DeFi: 10,
      NFTs: 5,
      'Small caps': 5,
    },
    aggressive: {
      BTC: 10,
      ETH: 15,
      SOL: 30,
      DeFi: 15,
      'Small caps': 20,
      'New protocols': 10,
    },
  };

  return baseAllocations[riskProfile as keyof typeof baseAllocations] || baseAllocations.balanced;
}

export async function POST(request: Request) {
  // Extract the request body
  const body = await request.json();
  const {
    messages,
    tokenData,
    userId = 'anonymous',
    traderMode = true,
    model = 'mixtral-8x7b-32768',
  } = body;
  const forceToolCall = body.forceToolCall || false;

  try {
    logger.log(`Processing chat request with Groq model ${model} for user ${userId}`);

    // Create system prompt focused on trading
    const systemPrompt = generateTradesXBTSystemPrompt();

    // Check if context on wallet _info was requested
    let injectWalletContext = false;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
      const content = lastMessage.content.toLowerCase();
      if (content.match(/\b(\/wallet|!wallet|\.wallet)\b/i)) {
        injectWalletContext = true;
      }
    }

    // Use our dedicated Groq handler for streaming chat
    // Pass tools array to the handler to enable function calling
    const stream = await handleGroqChatStream(
      messages,
      systemPrompt,
      userId,
      model,
      tools // Pass the tools array
    );

    // Use the StreamingTextResponse with our ReadableStream
    return new StreamingTextResponse(stream);
  } catch (error) {
    logger.error('Error in chat processing:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
