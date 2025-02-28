// @ts-nocheck
import {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Redis } from '@upstash/redis';
import { RedisCache } from './redis-cache';
import { PostgresDB } from './postgres-db';
import { MarketDataService, TokenPrice } from './market-data-service';
import { getEnv, isMockTradingEnabled, isLiveTradingEnabled } from './env';
import { withRetry } from './api-utils';
import { AISignal, TechnicalIndicator } from '@/app/api/trading/signals/route';
import axios from 'axios';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

// Initialize market data service
export const marketDataService = new MarketDataService();

// Initialize Redis for caching
let redis: Redis | null = null;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN || '',
    });
  }
} catch (error) {
  logger.error('Failed to initialize Redis for trading service:', error);
}

// Jupiter trade _result interface
export interface TradeResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  inputAmount?: number;
  outputAmount?: number;
  inputToken?: string;
  outputToken?: string;
  executedAt?: Date;
  slippage?: number;
}

// Interface for trading settings
export interface TradingSettings {
  maxSlippage: number;
  defaultDelegatedAuthority: 'limited' | 'full';
  tradingEnabled: boolean;
  supportedTokens: Record<string, string>; // Symbol to mint address mapping
}

// Trading authority interface
export interface TradingAuthority {
  userId: string;
  publicKey: string;
  privateKeyEncrypted: string;
  permissionLevel: 'limited' | 'full';
  createdAt: Date;
}

// Interface for signals analysis parameters
export interface SignalParams {
  tokenInfo: TokenPrice;
  priceHistory: {
    prices: [number, number][];
    market_caps: [number, number][];
    volumes: [number, number][];
  };
  technicalIndicators: boolean;
  sentiment: boolean;
}

/**
 * Service for AI-powered trading execution
 */
export class AITradingService {
  private static instance: AITradingService;
  private connection: Connection;
  private settings: TradingSettings;
  private delegatedAuthorities: Map<string, TradingAuthority> = new Map();
  private tradeHistory: Map<string, TradeResult[]> = new Map();

  // Singleton pattern
  public static getInstance(): AITradingService {
    if (!AITradingService.instance) {
      AITradingService.instance = new AITradingService();
    }
    return AITradingService.instance;
  }

  private constructor() {
    // Connect to multiple RPC endpoints with failover
    this.connection = this.createConnectionWithFailover();

    // Set trading settings
    this.settings = {
      maxSlippage: 100, // 1%
      defaultDelegatedAuthority: 'limited',
      tradingEnabled: isLiveTradingEnabled(),
      supportedTokens: {
        SOL: 'So11111111111111111111111111111111111111112',
        USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        JTO: 'JitoTokenStRmMGRESzMrWm4suZeWkAdJfYNQJ3sSVcLVF',
      },
    };

    // Initialize trading authorities and history
    this.loadTradingAuthorities();
  }

  /**
   * Create a Solana connection with failover support
   */
  private createConnectionWithFailover(): Connection {
    // List of RPC endpoints to try in order
    const rpcEndpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana',
    ];

    // Try each endpoint
    for (const endpoint of rpcEndpoints) {
      try {
        const connection = new Connection(endpoint, { commitment: 'confirmed' });
        return connection;
      } catch (error) {
        logger.error(`Failed to connect to ${endpoint}:`, error);
      }
    }

    // Default fallback
    return new Connection('https://api.mainnet-beta.solana.com', { commitment: 'confirmed' });
  }

  /**
   * Load trading authorities from database
   */
  private async loadTradingAuthorities() {
    try {
      // Load from database - this would decrypt the stored keys in production
      const authorities = await PostgresDB.getAllTradingAuthorities();

      for (const authority of authorities) {
        this.delegatedAuthorities.set(authority.userId, authority);
      }

      logger.log(`Loaded ${authorities.length} trading authorities`);
    } catch (error) {
      logger.error('Error loading trading authorities:', error);
    }
  }

  /**
   * Check if a user has delegated authority
   */
  async hasDelegatedAuthority(userId: string): Promise<boolean> {
    // Check in-memory cache first
    if (this.delegatedAuthorities.has(userId)) {
      return true;
    }

    // Check database
    try {
      const authority = await PostgresDB.getTradingAuthority(userId);
      if (authority) {
        // Cache the authority
        this.delegatedAuthorities.set(userId, authority);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error checking delegated authority:', error);
      return false;
    }
  }

  /**
   * Create a delegated authority for a user
   */
  async createDelegatedAuthority(
    userId: string,
    permissionLevel: 'limited' | 'full' = 'limited'
  ): Promise<string> {
    try {
      // Generate new keypair
      const tradingKeypair = Keypair.generate();

      // In production, encrypt the private key before storing
      // For demo, we're using a simple encryption - in production use a proper key management system
      const privateKeyEncrypted = this.encryptPrivateKey(
        Buffer.from(tradingKeypair.secretKey).toString('hex'),
        process.env.AUTH_SECRET || 'demo-secret'
      );

      const authority: TradingAuthority = {
        userId,
        publicKey: tradingKeypair.publicKey.toString(),
        privateKeyEncrypted,
        permissionLevel,
        createdAt: new Date(),
      };

      // Store in database
      await PostgresDB.saveTradingAuthority(userId, authority);

      // Cache in memory
      this.delegatedAuthorities.set(userId, authority);

      return tradingKeypair.publicKey.toString();
    } catch (error) {
      logger.error('Error creating delegated authority:', error);
      throw error;
    }
  }

  /**
   * Simple encryption for private keys - in production use a proper KMS
   */
  private encryptPrivateKey(privateKey: string, secret: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.createHash('sha256').update(secret).digest().slice(0, 32);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Error encrypting private key:', error);
      throw error;
    }
  }

  /**
   * Decrypt a private key - in production use a proper KMS
   */
  private decryptPrivateKey(encryptedPrivateKey: string, secret: string): string {
    try {
      const parts = encryptedPrivateKey.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedKey = parts[1];

      const key = crypto.createHash('sha256').update(secret).digest().slice(0, 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Error decrypting private key:', error);
      throw error;
    }
  }

  /**
   * Execute a trade for a user with AI risk management
   */
  async executeTradeForUser(
    userId: string,
    inputToken: string,
    outputToken: string,
    amount: number,
    slippageBps: number = 50, // 0.5% default slippage
    orderType: 'market' | 'limit' = 'market'
  ): Promise<any> {
    try {
      // Validate trading is enabled
      if (!this.settings.tradingEnabled && !isMockTradingEnabled()) {
        throw new Error('Trading is currently disabled');
      }

      // Validate inputs
      if (amount <= 0) {
        throw new Error('Trade amount must be greater than zero');
      }

      // Check slippage doesn't exceed max allowed
      if (slippageBps > this.settings.maxSlippage) {
        slippageBps = this.settings.maxSlippage;
      }

      // Validate token support
      const inputTokenAddress = this.getTokenAddress(inputToken);
      const outputTokenAddress = this.getTokenAddress(outputToken);

      // In mock mode, use simulated trade execution
      if (isMockTradingEnabled()) {
        return this.executeMockTrade(
          userId,
          inputToken,
          outputToken,
          amount,
          slippageBps,
          orderType
        );
      }

      // For real trading:
      // 1. Validate user has delegated authority or create one
      if (!this.delegatedAuthorities.has(userId)) {
        const hasAuthority = await this.hasDelegatedAuthority(userId);
        if (!hasAuthority) {
          await this.createDelegatedAuthority(userId, this.settings.defaultDelegatedAuthority);
        }
      }

      // 2. Get the trading authority
      const authority = this.delegatedAuthorities.get(userId)!;

      // 3. Check user has sufficient balance
      const balance = await this.getUserTokenBalance(userId, inputToken);
      if (balance < amount) {
        throw new Error(
          `Insufficient balance. Available: ${balance} ${inputToken}, Requested: ${amount} ${inputToken}`
        );
      }

      // 4. Execute trade using Jupiter aggregator
      const _result = await this.executeJupiterTrade(
        authority,
        inputTokenAddress,
        outputTokenAddress,
        amount,
        slippageBps
      );

      // 5. Save trade _result to history
      await this.saveTradeResult(userId, _result);

      return _result;
    } catch (error) {
      logger.error('Trade execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error executing trade',
        inputToken,
        outputToken,
        inputAmount: amount,
        executedAt: new Date(),
      };
    }
  }

  /**
   * Get token address from symbol
   */
  private getTokenAddress(symbol: string): string {
    const address = this.settings.supportedTokens[symbol.toUpperCase()];
    if (!address) {
      throw new Error(`Unsupported token: ${symbol}`);
    }
    return address;
  }

  /**
   * Get user token balance
   */
  private async getUserTokenBalance(userId: string, token: string): Promise<number> {
    // In production, this would check actual on-chain balances
    // For demo, return a reasonable value
    return 100.0;
  }

  /**
   * Execute trade using Jupiter Aggregator
   */
  private async executeJupiterTrade(
    authority: TradingAuthority,
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number
  ): Promise<any> {
    // This would be implemented with real Jupiter API integration
    // For now, return a mock successful _result

    const mock = this.executeMockTrade(
      authority.userId,
      inputMint,
      outputMint,
      amount,
      slippageBps,
      'market'
    );

    // Add a mock transaction signature
    mock.txSignature = `mock-tx-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

    return mock;
  }

  /**
   * Save trade _result to database
   */
  private async saveTradeResult(userId: string, _result: any): Promise<void> {
    try {
      // Save to in-memory cache
      if (!this.tradeHistory.has(userId)) {
        this.tradeHistory.set(userId, []);
      }
      this.tradeHistory.get(userId)!.push(_result);

      // Save to database
      await PostgresDB.saveTradeResult(userId, _result);

      // Cache in Redis for quick access
      if (redis) {
        const cacheKey = `trades:${userId}:latest`;
        await redis.set(cacheKey, JSON.stringify(_result), { ex: 3600 }); // 1 hour expiry
      }
    } catch (error) {
      logger.error('Error saving trade _result:', error);
    }
  }

  /**
   * Execute a mock trade for testing and development
   */
  private executeMockTrade(
    userId: string,
    inputToken: string,
    outputToken: string,
    amount: number,
    slippageBps: number,
    orderType: 'market' | 'limit'
  ): any {
    // Create a realistic mock exchange rate
    const exchangeRate = this.getMockExchangeRate(inputToken, outputToken);

    // Calculate output amount with slippage
    const slippageMultiplier = 1 - slippageBps / 10000;
    const idealOutput = amount * exchangeRate;
    const outputWithSlippage = idealOutput * slippageMultiplier;

    // Add randomness to simulate market conditions
    const finalOutput = outputWithSlippage * (0.98 + Math.random() * 0.04);

    // Calculate slippage
    const actualSlippage = ((idealOutput - finalOutput) / idealOutput) * 100;

    // Create _result
    return {
      success: true,
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: finalOutput,
      executedAt: new Date(),
      slippage: actualSlippage,
    };
  }

  /**
   * Get mock exchange rate between tokens
   */
  private getMockExchangeRate(inputToken: string, outputToken: string): number {
    // Use realistic exchange rates
    const rates: Record<string, Record<string, number>> = {
      SOL: {
        USDC: 180,
        BONK: 5_000_000,
        JUP: 100,
        JTO: 60,
      },
      USDC: {
        SOL: 0.0056,
        BONK: 28_000,
        JUP: 0.56,
        JTO: 0.33,
      },
      BONK: {
        SOL: 0.0000002,
        USDC: 0.000036,
        JUP: 0.00002,
        JTO: 0.000012,
      },
      JUP: {
        SOL: 0.01,
        USDC: 1.8,
        BONK: 50_000,
        JTO: 0.6,
      },
      JTO: {
        SOL: 0.017,
        USDC: 3.0,
        BONK: 83_000,
        JUP: 1.67,
      },
    };

    // Add 5% random variation
    const baseRate = rates[inputToken]?.[outputToken] || 1.0;
    return baseRate * (0.95 + Math.random() * 0.1);
  }

  /**
   * Get trade history for a user
   */
  async getTradeHistory(userId: string): Promise<TradeResult[]> {
    try {
      // Check memory cache first
      if (this.tradeHistory.has(userId)) {
        return this.tradeHistory.get(userId) || [];
      }

      // Try Redis cache
      if (redis) {
        const cacheKey = `trades:${userId}`;
        const cached = await redis.get<TradeResult[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Fetch from database
      const history = await PostgresDB.getTradeHistory(userId);

      // Cache for future use
      this.tradeHistory.set(userId, history);

      // Store in Redis with expiry
      if (redis) {
        const cacheKey = `trades:${userId}`;
        await redis.set(cacheKey, history, { ex: 300 }); // 5 minutes
      }

      return history;
    } catch (error) {
      logger.error('Error getting trade history:', error);
      return [];
    }
  }

  /**
   * Calculate portfolio value for a user
   */
  async getPortfolioValue(userId: string): Promise<{
    totalValue: number;
    holdings: Array<{ token: string; amount: number; valueUsd: number }>;
  }> {
    try {
      // Implement real portfolio value calculation based on on-chain data
      // For now, return mock data
      const tokenHoldings = [
        { token: 'SOL', amount: 12.45 },
        { token: 'JUP', amount: 253.71 },
        { token: 'BONK', amount: 15678945.23 },
      ];

      // Get real token prices
      const valuePromises = tokenHoldings.map(async holding => {
        const price = await marketDataService.getTokenPrice(holding.token.toLowerCase());
        return {
          token: holding.token,
          amount: holding.amount,
          valueUsd: holding.amount * (price || 0),
        };
      });

      const holdings = await Promise.all(valuePromises);
      const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

      return {
        totalValue,
        holdings,
      };
    } catch (error) {
      logger.error('Error getting portfolio value:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const aiTradingService = AITradingService.getInstance();

/**
 * Generate AI trading signal for a token
 * This function leverages AI models to analyze token data and generate trading signals
 */
export async function generateAISignal(tokenId: string, params: SignalParams): Promise<AISignal> {
  const env = getEnv();

  try {
    // Check if we should use cached signal
    const cacheKey = `ai:signal:${tokenId}`;
    const cachedSignal = await RedisCache.get<AISignal>(cacheKey);

    if (cachedSignal) {
      // Check expiry
      const expiresAt = new Date(cachedSignal.expiresAt);
      if (expiresAt > new Date()) {
        return cachedSignal;
      }
    }

    // Extract token symbol from tokenInfo
    const symbol = params.tokenInfo.symbol.toUpperCase();
    const name = params.tokenInfo.name;
    const currentPrice = params.tokenInfo.current_price;

    // If we have AI credentials, we can generate real AI-powered signals
    if (env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY) {
      // For production, this should use a proper AI service with retry mechanisms
      const aiProvider = env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai';

      try {
        return await withRetry(
          async () => {
            if (aiProvider === 'anthropic') {
              return await generateAnthropicSignal(tokenId, symbol, name, currentPrice, params);
            } else {
              // Use OpenAI fallback - would implement in production
              return generateMockSignal(tokenId, symbol, name, currentPrice, params);
            }
          },
          {
            retries: 2,
            backoff: 500,
            onRetry: (attempt, error) => {
              logger.warn(`Retry ${attempt} generating AI signal for ${tokenId}: ${error.message}`);
            },
          }
        );
      } catch (error) {
        logger.error(`Error generating AI signal for ${tokenId}:`, error);
        // Fall back to mock signal on error
        return generateMockSignal(tokenId, symbol, name, currentPrice, params);
      }
    } else {
      // No AI credentials, use mock signal
      return generateMockSignal(tokenId, symbol, name, currentPrice, params);
    }
  } catch (error) {
    logger.error(`Error in AI signal generation for ${tokenId}:`, error);

    // Return a neutral signal as fallback
    return {
      token: tokenId.toUpperCase(),
      tokenId,
      action: 'hold',
      confidence: 50,
      direction: 'neutral',
      timeframe: 'medium',
      price: params.tokenInfo.current_price,
      reasoning: 'Signal generation encountered an error. Defaulting to neutral position.',
      technicalIndicators: [],
      sentiment: {
        social: 50,
        news: 50,
        overall: 50,
      },
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 min expiry for error state
    };
  }
}

/**
 * Generate a signal using Anthropic Claude API
 */
async function generateAnthropicSignal(
  tokenId: string,
  symbol: string,
  name: string,
  currentPrice: number,
  params: SignalParams
): Promise<AISignal> {
  const env = getEnv();

  // Prepare price history data for visualization
  const prices = params.priceHistory.prices.map(p => p[1]);
  const dates = params.priceHistory.prices.map(p => new Date(p[0]).toISOString().split('T')[0]);

  // Calculate some basic indicators to assist the AI
  const priceChanges = [];
  for (let i = 1; i < prices.length; i++) {
    const change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
    priceChanges.push(change);
  }

  // Calculate moving averages
  const ma7 = calculateMovingAverage(prices, 7);
  const ma30 = calculateMovingAverage(prices, 30);

  // Simple RSI calculation
  const rsi = calculateRSI(prices);

  // Prepare technical analysis summary
  const technicalAnalysis = {
    price: currentPrice,
    priceChange24h: params.tokenInfo.price_change_percentage_24h,
    volume24h: params.tokenInfo.volume_24h,
    marketCap: params.tokenInfo.market_cap,
    ma7: ma7[ma7.length - 1].toFixed(4),
    ma30: ma30[ma30.length - 1].toFixed(4),
    rsi: rsi[rsi.length - 1].toFixed(2),
  };

  // Construct prompt for Claude
  const prompt = `
  You are a crypto trading AI assistant. Analyze the following data about ${name} (${symbol}) and generate a trading signal.
  
  Current price: $${currentPrice}
  
  Technical Analysis:
  - 24h price change: ${technicalAnalysis.priceChange24h.toFixed(2)}%
  - 24h volume: $${(technicalAnalysis.volume24h / 1000000).toFixed(2)}M
  - Market cap: $${(technicalAnalysis.marketCap / 1000000).toFixed(2)}M
  - 7-day MA: $${technicalAnalysis.ma7}
  - 30-day MA: $${technicalAnalysis.ma30}
  - RSI (14): ${technicalAnalysis.rsi}
  
  Generate a trading signal with the following format:
  
  1. Action: "buy", "sell", or "hold"
  2. Confidence: A number from 0-100 indicating your confidence in this signal
  3. Direction: "bullish", "bearish", or "neutral"
  4. Timeframe: "short", "medium", or "long"
  5. Reasoning: A brief explanation of your analysis
  6. Technical Indicators: Provide 3-5 technical indicators with values and what they signal
  7. Sentiment: Estimate social and news sentiment on a scale of 0-100
  
  Base your analysis on the technical data provided. Be specific about why you're recommending this action.
  `;

  try {
    // Call Anthropic API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        system:
          'You are an expert crypto market analyst skilled in technical analysis. Your job is to analyze crypto token data and generate clear trading signals. Be precise and analytical.',
      },
      {
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    // Extract response content
    const content = response.data.content[0].text;

    // Parse the AI output to extract structured data
    const action = extractAction(content);
    const confidence = extractConfidence(content);
    const direction = extractDirection(content);
    const timeframe = extractTimeframe(content);
    const reasoning = extractReasoning(content);
    const technicalIndicators = extractTechnicalIndicators(content);
    const sentiment = extractSentiment(content);

    // Construct the signal object
    const signal: AISignal = {
      token: symbol,
      tokenId,
      action,
      confidence,
      direction,
      timeframe,
      price: currentPrice,
      reasoning,
      technicalIndicators,
      sentiment: {
        social: sentiment.social,
        news: sentiment.news,
        overall: (sentiment.social + sentiment.news) / 2,
      },
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
    };

    // Cache the _result
    await RedisCache.set(`ai:signal:${tokenId}`, signal, 3600); // 1 hour cache

    return signal;
  } catch (error) {
    logger.error('Error calling Anthropic API:', error);
    throw error;
  }
}

/**
 * Extract elements from AI response
 */
function extractAction(content: string): 'buy' | 'sell' | 'hold' {
  const actionMatch = content.match(/action:?\s*["']?(buy|sell|hold)["']?/i);
  return (actionMatch?.[1].toLowerCase() as 'buy' | 'sell' | 'hold') || 'hold';
}

function extractConfidence(content: string): number {
  const confidenceMatch = content.match(/confidence:?\s*(\d+)/i);
  return confidenceMatch ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1], 10))) : 50;
}

function extractDirection(content: string): 'bullish' | 'bearish' | 'neutral' {
  const directionMatch = content.match(/direction:?\s*["']?(bullish|bearish|neutral)["']?/i);
  return (directionMatch?.[1].toLowerCase() as 'bullish' | 'bearish' | 'neutral') || 'neutral';
}

function extractTimeframe(content: string): 'short' | 'medium' | 'long' {
  const timeframeMatch = content.match(/timeframe:?\s*["']?(short|medium|long)["']?/i);
  return (timeframeMatch?.[1].toLowerCase() as 'short' | 'medium' | 'long') || 'medium';
}

function extractReasoning(content: string): string {
  const reasoningMatch = content.match(
    /reasoning:?\s*([\s\S]*?)(?=\n\s*\d|\n\s*[A-Za-z]+\s*Indicators|\n\s*Sentiment|$)/i
  );
  return (
    reasoningMatch?.[1].trim() || 'Analysis based on technical indicators and market conditions.'
  );
}

function extractTechnicalIndicators(content: string): TechnicalIndicator[] {
  const indicators: TechnicalIndicator[] = [];

  // Look for indicators section
  const indicatorsSection = content.match(
    /Technical Indicators:?\s*([\s\S]*?)(?=\n\s*Sentiment|$)/i
  );

  if (indicatorsSection) {
    const indicatorsText = indicatorsSection[1];

    // Try to extract individual indicators
    const indicatorMatches = indicatorsText.match(/[•-]\s*([^:]+):\s*([^(]+)(?:\(([^)]+)\))?/g);

    if (indicatorMatches) {
      for (const match of indicatorMatches) {
        const parts = match.match(/[•-]\s*([^:]+):\s*([^(]+)(?:\(([^)]+)\))?/);
        if (parts) {
          const name = parts[1].trim();
          const value = parts[2].trim();
          const signal = extractSignal(parts[3] || value);
          indicators.push({
            name,
            value,
            signal,
            timeframe: 'medium', // Default timeframe
          });
        }
      }
    }
  }

  // If no indicators found, provide defaults
  if (indicators.length === 0) {
    indicators.push(
      { name: 'RSI', value: '45', signal: 'neutral', timeframe: 'short' },
      { name: 'Moving Averages', value: 'Mixed', signal: 'neutral', timeframe: 'medium' }
    );
  }

  return indicators;
}

function extractSignal(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('bull') || lowerText.includes('buy') || lowerText.includes('positive')) {
    return 'bullish';
  } else if (
    lowerText.includes('bear') ||
    lowerText.includes('sell') ||
    lowerText.includes('negative')
  ) {
    return 'bearish';
  }
  return 'neutral';
}

function extractSentiment(content: string): { social: number; news: number } {
  const socialMatch = content.match(/social:?\s*(\d+)/i);
  const newsMatch = content.match(/news:?\s*(\d+)/i);

  return {
    social: socialMatch ? Math.min(100, Math.max(0, parseInt(socialMatch[1], 10))) : 50,
    news: newsMatch ? Math.min(100, Math.max(0, parseInt(newsMatch[1], 10))) : 50,
  };
}

/**
 * Calculate a simple moving average
 */
function calculateMovingAverage(data: number[], window: number): number[] {
  const _result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      _result.push(NaN);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += data[i - j];
    }
    _result.push(sum / window);
  }

  return _result;
}

/**
 * Calculate a simple RSI
 */
function calculateRSI(data: number[], window: number = 14): number[] {
  const _result: number[] = [];
  const changes: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  // Calculate RSI
  for (let i = 0; i < data.length; i++) {
    if (i < window) {
      _result.push(NaN);
      continue;
    }

    let gains = 0;
    let losses = 0;

    for (let j = i - window; j < i; j++) {
      if (changes[j - 1] >= 0) {
        gains += changes[j - 1];
      } else {
        losses -= changes[j - 1];
      }
    }

    const avgGain = gains / window;
    const avgLoss = losses / window;

    if (avgLoss === 0) {
      _result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      _result.push(100 - 100 / (1 + rs));
    }
  }

  return _result;
}

/**
 * Generate a mock signal when AI is not available
 */
function generateMockSignal(
  tokenId: string,
  symbol: string,
  name: string,
  currentPrice: number,
  params: SignalParams
): AISignal {
  // Calculate a mock RSI as a basis for the signal
  const prices = params.priceHistory.prices.map(p => p[1]);
  const rsiValues = calculateRSI(prices);
  const currentRSI = isNaN(rsiValues[rsiValues.length - 1]) ? 50 : rsiValues[rsiValues.length - 1];

  // Determine signal direction based on RSI
  let direction: 'bullish' | 'bearish' | 'neutral';
  let action: 'buy' | 'sell' | 'hold';

  if (currentRSI > 70) {
    direction = 'bearish';
    action = 'sell';
  } else if (currentRSI < 30) {
    direction = 'bullish';
    action = 'buy';
  } else {
    direction = 'neutral';
    action = 'hold';
  }

  // Generate confidence based on how extreme the RSI is
  const confidence = Math.round(Math.abs(currentRSI - 50) * 2);

  // Create technical indicators
  const technicalIndicators: TechnicalIndicator[] = [
    {
      name: 'RSI',
      value: currentRSI.toFixed(2),
      signal: currentRSI > 70 ? 'bearish' : currentRSI < 30 ? 'bullish' : 'neutral',
      timeframe: 'short',
    },
    {
      name: 'Moving Average',
      value:
        direction === 'bullish'
          ? 'Price above MA'
          : direction === 'bearish'
            ? 'Price below MA'
            : 'Price near MA',
      signal: direction,
      timeframe: 'medium',
    },
    {
      name: 'Volume',
      value: 'Average',
      signal: 'neutral',
      timeframe: 'short',
    },
  ];

  // Create reasonable mock reasons
  const reasons = {
    bullish: [
      `${symbol} appears oversold with RSI below 30, suggesting a potential reversal.`,
      `Recent price action shows strong support levels with increasing volume.`,
      `Technical indicators suggest accumulation phase may be ending.`,
    ],
    bearish: [
      `${symbol} shows overbought conditions with RSI above 70.`,
      `Recent price action failed to break resistance with declining volume.`,
      `Technical indicators suggest distribution phase may be beginning.`,
    ],
    neutral: [
      `${symbol} is consolidating within a range with balanced buying and selling pressure.`,
      `Market indicators show mixed signals, suggesting a wait-and-see approach.`,
      `${symbol} is trading near key moving averages with neutral momentum.`,
    ],
  };

  // Select a random reason based on direction
  const reasonIndex = Math.floor(Math.random() * 3);
  const reasoning = reasons[direction][reasonIndex];

  // Create the mock signal
  return {
    token: symbol,
    tokenId,
    action,
    confidence,
    direction,
    timeframe: 'medium',
    price: currentPrice,
    reasoning,
    technicalIndicators,
    sentiment: {
      social: 50 + (direction === 'bullish' ? 15 : direction === 'bearish' ? -15 : 0),
      news: 50 + (direction === 'bullish' ? 10 : direction === 'bearish' ? -10 : 0),
      overall: 50 + (direction === 'bullish' ? 12 : direction === 'bearish' ? -12 : 0),
    },
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
  };
}
