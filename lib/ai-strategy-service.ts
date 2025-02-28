// @ts-nocheck
import { AITradingService, TradeResult } from './ai-trading-service';
import { MarketDataService } from './market-data-service';
import { PostgresDB } from './postgres-db';
import { RedisCache } from './redis-cache';
import { logger } from '@/lib/logger';

// Strategy types and interfaces
export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  tokens: string[]; // Tokens the strategy can trade
  maxPositionPercentage: number; // Max percentage of portfolio per position
  targetProfitPercentage: number; // Target profit before exiting
  stopLossPercentage: number; // Stop loss threshold
  aiModel: string; // Which AI model powers this strategy
  createdAt: Date;
  status: 'active' | 'paused' | 'archived';
}

export interface UserStrategy {
  id: string;
  userId: string;
  strategyId: string;
  status: 'active' | 'paused';
  riskOverride?: 'low' | 'medium' | 'high';
  createdAt: Date;
  lastRunAt?: Date;
  performancePnL?: number;
  performancePercentage?: number;
}

export interface StrategyPosition {
  id: string;
  userStrategyId: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  entryPrice: number;
  currentPrice?: number;
  exitPrice?: number;
  status: 'open' | 'closed' | 'cancelled';
  unrealizedPnL?: number;
  unrealizedPnLPercentage?: number;
  realizedPnL?: number;
  realizedPnLPercentage?: number;
  openedAt: Date;
  closedAt?: Date;
  txIdOpen?: string;
  txIdClose?: string;
}

export interface AISignal {
  token: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100 scale
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: 'short' | 'medium' | 'long';
  reason: string;
  indicators: {
    rsi?: number;
    macd?: 'bullish' | 'bearish';
    movingAverages?: 'bullish' | 'bearish' | 'neutral';
    volume?: 'increasing' | 'decreasing' | 'stable';
    priceAction?: string;
  };
  timestamp: Date;
}

/**
 * Service for managing AI-powered trading strategies
 */
export class AIStrategyService {
  private static instance: AIStrategyService;
  private tradingService: AITradingService;
  private marketDataService: MarketDataService;

  // Predefined strategy templates
  private strategyTemplates: Record<string, TradingStrategy> = {
    momentum: {
      id: 'momentum',
      name: 'AI Momentum Strategy',
      description: 'Follows market momentum using technical indicators and AI sentiment analysis',
      riskLevel: 'medium',
      tokens: ['SOL', 'JUP', 'BONK', 'JTO'],
      maxPositionPercentage: 15,
      targetProfitPercentage: 10,
      stopLossPercentage: 5,
      aiModel: 'claude-3-7-sonnet',
      createdAt: new Date(),
      status: 'active',
    },
    trendfollowing: {
      id: 'trendfollowing',
      name: 'AI Trend Following',
      description: 'Identifies and follows market trends using AI-powered analysis',
      riskLevel: 'medium',
      tokens: ['SOL', 'JUP', 'BONK', 'JTO', 'RAY'],
      maxPositionPercentage: 20,
      targetProfitPercentage: 15,
      stopLossPercentage: 7,
      aiModel: 'claude-3-7-sonnet',
      createdAt: new Date(),
      status: 'active',
    },
    conservative: {
      id: 'conservative',
      name: 'AI Conservative Strategy',
      description: 'Low-risk strategy focusing on blue-chip Solana tokens with AI risk management',
      riskLevel: 'low',
      tokens: ['SOL', 'JUP', 'JTO'],
      maxPositionPercentage: 10,
      targetProfitPercentage: 5,
      stopLossPercentage: 3,
      aiModel: 'claude-3-7-sonnet',
      createdAt: new Date(),
      status: 'active',
    },
    aggressive: {
      id: 'aggressive',
      name: 'AI Aggressive Growth',
      description: 'High-risk, high-reward strategy targeting emerging Solana tokens',
      riskLevel: 'high',
      tokens: ['SOL', 'JUP', 'BONK', 'WIF', 'MEME'],
      maxPositionPercentage: 25,
      targetProfitPercentage: 30,
      stopLossPercentage: 15,
      aiModel: 'claude-3-7-sonnet',
      createdAt: new Date(),
      status: 'active',
    },
  };

  // Singleton pattern
  public static getInstance(): AIStrategyService {
    if (!AIStrategyService.instance) {
      AIStrategyService.instance = new AIStrategyService();
    }
    return AIStrategyService.instance;
  }

  private constructor() {
    this.tradingService = AITradingService.getInstance();
    this.marketDataService = MarketDataService.getInstance();

    // Initialize cache for strategies and positions
    this.loadUserStrategies();
  }

  private async loadUserStrategies() {
    try {
      // In production, preload active strategies from PostgresDB
      // For now, just initialize
    } catch (error) {
      logger.error('Error loading user strategies:', error);
    }
  }

  /**
   * Get available strategy templates
   */
  public getStrategyTemplates(): TradingStrategy[] {
    return Object.values(this.strategyTemplates);
  }

  /**
   * Get a specific strategy template
   */
  public getStrategyTemplate(templateId: string): TradingStrategy | null {
    return this.strategyTemplates[templateId] || null;
  }

  /**
   * Create a new strategy for a user
   */
  public async createUserStrategy(
    userId: string,
    strategyTemplateId: string,
    riskOverride?: 'low' | 'medium' | 'high'
  ): Promise<{
    success: boolean;
    userStrategy?: any;
    error?: string;
  }> {
    try {
      // Check if template exists
      const template = this.getStrategyTemplate(strategyTemplateId);
      if (!template) {
        return {
          success: false,
          error: `Strategy template '${strategyTemplateId}' not found`,
        };
      }

      // Create user strategy
      const userStrategy: any = {
        id: `${userId}-${template.id}-${Date.now()}`,
        userId,
        strategyId: template.id,
        status: 'active',
        riskOverride,
        createdAt: new Date(),
      };

      // Check if user has authorized trading
      const hasAuthority = await this.tradingService.hasDelegatedAuthority(userId);

      if (!hasAuthority) {
        // Create trading authority
        await this.tradingService.createDelegatedAuthority(
          userId,
          riskOverride === 'high' || template.riskLevel === 'high' ? 'full' : 'limited'
        );
      }

      // Store in database
      await PostgresDB.saveUserStrategy(userId, userStrategy);

      // Store in cache
      await RedisCache.set(`strategy:${userStrategy.id}`, userStrategy, 3600);

      return {
        success: true,
        userStrategy,
      };
    } catch (error) {
      logger.error('Error creating user strategy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating strategy',
      };
    }
  }

  /**
   * Get user strategies
   */
  public async getUserStrategies(userId: string): Promise<UserStrategy[]> {
    try {
      // Try cache first
      const cacheKey = `strategies:${userId}`;
      const cached = await RedisCache.get<UserStrategy[]>(cacheKey);

      if (cached) {
        return cached;
      }

      // Fetch from database
      const strategies = await PostgresDB.getUserStrategies(userId);

      // Cache for future use
      await RedisCache.set(cacheKey, strategies, 300); // 5 minutes

      return strategies;
    } catch (error) {
      logger.error('Error getting user strategies:', error);
      return [];
    }
  }

  /**
   * Generate AI trading signal for a token
   */
  public async generateSignal(token: string): Promise<AISignal> {
    try {
      // In production, this would use the AI to generate a real signal
      // For now, generate a simulated signal

      // Get token info and price
      const tokenInfo = await this.marketDataService.getTokenInfo(token);

      // Calculate RSI (randomly for the mockup)
      const rsi = 30 + Math.random() * 40; // 30-70 range

      // Direction based on RSI
      const direction = rsi > 60 ? 'bullish' : rsi < 40 ? 'bearish' : 'neutral';

      // Action based on direction and random probability
      const actionRandom = Math.random();
      let action: 'buy' | 'sell' | 'hold';

      if (direction === 'bullish') {
        action = actionRandom > 0.3 ? 'buy' : 'hold';
      } else if (direction === 'bearish') {
        action = actionRandom > 0.3 ? 'sell' : 'hold';
      } else {
        action = 'hold';
      }

      // Confidence based on how extreme the RSI is
      const confidence = Math.round(Math.abs(rsi - 50) * 2 + 20 + Math.random() * 20);

      // MACD (mocked)
      const macd = rsi > 55 ? 'bullish' : 'bearish';

      // Moving averages (mocked)
      const movingAverages =
        direction === 'bullish' ? 'bullish' : direction === 'bearish' ? 'bearish' : 'neutral';

      // Volume (mocked)
      const volumeOptions = ['increasing', 'decreasing', 'stable'] as const;
      const volume = volumeOptions[Math.floor(Math.random() * volumeOptions.length)];

      // Reasons for the signal
      const reasons = {
        bullish: [
          'Strong upward momentum with increasing volume',
          'Price broke through key resistance level',
          'RSI indicates oversold condition, potential reversal',
          'Positive on-chain metrics showing increased adoption',
          'Recent network upgrades improving scalability',
        ],
        bearish: [
          'Downward trend with consistent selling pressure',
          'Price failed to break key resistance level',
          'RSI indicates overbought condition, potential reversal',
          'Decreasing on-chain activity suggesting reduced usage',
          'Market uncertainty affecting overall sentiment',
        ],
        neutral: [
          'Price consolidating within range, no clear direction',
          'Balanced buying and selling pressure',
          'Mixed technical indicators showing conflicting signals',
          'Awaiting catalyst for directional movement',
          'Low volatility period suggesting accumulation phase',
        ],
      };

      // Select an appropriate reason based on direction
      const reasonIndex = Math.floor(Math.random() * 5);
      const reason = reasons[direction][reasonIndex];

      return {
        token,
        action,
        confidence,
        direction: direction as 'bullish' | 'bearish' | 'neutral',
        timeframe: Math.random() > 0.5 ? 'short' : 'medium',
        reason,
        indicators: {
          rsi,
          macd,
          movingAverages,
          volume,
          priceAction:
            direction === 'bullish'
              ? 'Higher highs and higher lows'
              : direction === 'bearish'
                ? 'Lower highs and lower lows'
                : 'Sideways movement',
        },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`Error generating signal for ${token}:`, error);

      // Return a neutral signal as fallback
      return {
        token,
        action: 'hold',
        confidence: 50,
        direction: 'neutral',
        timeframe: 'medium',
        reason: 'Insufficient data to generate reliable signal',
        indicators: {},
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get active positions for a user strategy
   */
  public async getStrategyPositions(userStrategyId: string): Promise<StrategyPosition[]> {
    try {
      // Try cache first
      const cacheKey = `positions:${userStrategyId}`;
      const cached = await RedisCache.get<StrategyPosition[]>(cacheKey);

      if (cached) {
        return cached;
      }

      // Fetch from database
      const positions = await PostgresDB.getStrategyPositions(userStrategyId);

      // Cache for future use
      await RedisCache.set(cacheKey, positions, 60); // 1 minute

      return positions;
    } catch (error) {
      logger.error('Error getting strategy positions:', error);
      return [];
    }
  }

  /**
   * Execute a trade based on AI signal
   */
  public async executeStrategyTrade(
    userId: string,
    userStrategyId: string,
    inputToken: string,
    outputToken: string,
    amount: number,
    signal: AISignal
  ): Promise<{
    success: boolean;
    position?: StrategyPosition;
    tradeResult?: any;
    error?: string;
  }> {
    try {
      // Get user strategy
      const userStrategy = await PostgresDB.getUserStrategyById(userId, userStrategyId);

      if (!userStrategy) {
        return {
          success: false,
          error: 'Strategy not found',
        };
      }

      if (userStrategy.status !== 'active') {
        return {
          success: false,
          error: 'Strategy is not active',
        };
      }

      // Get strategy template
      const template = this.getStrategyTemplate(userStrategy.strategyId);

      if (!template) {
        return {
          success: false,
          error: 'Strategy template not found',
        };
      }

      // Verify token is allowed by strategy
      if (!template.tokens.includes(outputToken)) {
        return {
          success: false,
          error: `Token ${outputToken} is not allowed in this strategy`,
        };
      }

      // Apply risk adjustment based on AI confidence
      const riskLevel = userStrategy.riskOverride || template.riskLevel;
      const confidenceMultiplier = this.getConfidenceMultiplier(signal.confidence, riskLevel);
      const adjustedAmount = amount * confidenceMultiplier;

      // Execute the trade
      const tradeResult = await this.tradingService.executeTradeForUser(
        userId,
        inputToken,
        outputToken,
        adjustedAmount,
        50, // 0.5% slippage
        'market'
      );

      if (!tradeResult.success) {
        return {
          success: false,
          error: tradeResult.error || 'Trade execution failed',
        };
      }

      // Get current price
      const price = (await this.marketDataService.getTokenPrice(outputToken)) || 0;

      // Create position
      const position: StrategyPosition = {
        id: `pos-${userStrategyId}-${Date.now()}`,
        userStrategyId,
        inputToken,
        outputToken,
        inputAmount: adjustedAmount,
        outputAmount: tradeResult.outputAmount || 0,
        entryPrice: price,
        currentPrice: price,
        status: 'open',
        openedAt: new Date(),
        txIdOpen: tradeResult.txSignature,
        unrealizedPnL: 0,
        unrealizedPnLPercentage: 0,
      };

      // Save position
      await PostgresDB.saveStrategyPosition(position);

      // Clear positions cache
      await RedisCache.delete(`positions:${userStrategyId}`);

      // Update user strategy
      userStrategy.lastRunAt = new Date();
      await PostgresDB.updateUserStrategy(userStrategy);

      return {
        success: true,
        position,
        tradeResult,
      };
    } catch (error) {
      logger.error('Error executing strategy trade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error executing trade',
      };
    }
  }

  /**
   * Close a position
   */
  public async closePosition(
    userId: string,
    positionId: string
  ): Promise<{
    success: boolean;
    position?: StrategyPosition;
    tradeResult?: any;
    error?: string;
  }> {
    try {
      // Get position
      const position = await PostgresDB.getPositionById(positionId);

      if (!position) {
        return {
          success: false,
          error: 'Position not found',
        };
      }

      if (position.status !== 'open') {
        return {
          success: false,
          error: 'Position is not open',
        };
      }

      // Get strategy
      const userStrategy = await PostgresDB.getUserStrategyById(userId, position.userStrategyId);

      if (!userStrategy || userStrategy.userId !== userId) {
        return {
          success: false,
          error: 'Strategy not found or not owned by user',
        };
      }

      // Execute trade to close position (swap back)
      const tradeResult = await this.tradingService.executeTradeForUser(
        userId,
        position.outputToken,
        position.inputToken,
        position.outputAmount,
        50, // 0.5% slippage
        'market'
      );

      if (!tradeResult.success) {
        return {
          success: false,
          error: tradeResult.error || 'Failed to close position',
        };
      }

      // Get current price
      const exitPrice = (await this.marketDataService.getTokenPrice(position.outputToken)) || 0;

      // Calculate PnL
      const realizedPnL = tradeResult.outputAmount! - position.inputAmount;
      const realizedPnLPercentage = (realizedPnL / position.inputAmount) * 100;

      // Update position
      position.status = 'closed';
      position.closedAt = new Date();
      position.exitPrice = exitPrice;
      position.txIdClose = tradeResult.txSignature;
      position.realizedPnL = realizedPnL;
      position.realizedPnLPercentage = realizedPnLPercentage;

      // Save updated position
      await PostgresDB.updateStrategyPosition(position);

      // Clear positions cache
      await RedisCache.delete(`positions:${position.userStrategyId}`);

      // Update strategy performance
      userStrategy.performancePnL = (userStrategy.performancePnL || 0) + realizedPnL;

      // Calculate percentage based on initial deposit (mock for now)
      const initialDeposit = 1000; // In production, track actual deposits
      userStrategy.performancePercentage =
        ((userStrategy.performancePnL || 0) / initialDeposit) * 100;

      await PostgresDB.updateUserStrategy(userStrategy);

      return {
        success: true,
        position,
        tradeResult,
      };
    } catch (error) {
      logger.error('Error closing position:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error closing position',
      };
    }
  }

  /**
   * Update user strategy
   */
  public async updateUserStrategy(strategy: any): Promise<{
    success: boolean;
    userStrategy?: any;
    error?: string;
  }> {
    try {
      // Update in database
      await PostgresDB.updateUserStrategy(strategy);

      // Update in cache
      await RedisCache.set(`strategy:${strategy.id}`, strategy, 3600);
      await RedisCache.delete(`strategies:${strategy.userId}`);

      return {
        success: true,
        userStrategy: strategy,
      };
    } catch (error) {
      logger.error('Error updating user strategy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating strategy',
      };
    }
  }

  /**
   * Update positions with current prices and PnL
   */
  public async updatePositions(userStrategyId: string): Promise<{
    success: boolean;
    positions?: StrategyPosition[];
    error?: string;
  }> {
    try {
      // Get positions
      const positions = await this.getStrategyPositions(userStrategyId);

      // Update each open position
      const updatedPositions: StrategyPosition[] = [];

      for (const position of positions) {
        if (position.status !== 'open') {
          updatedPositions.push(position);
          continue;
        }

        // Get current price
        const currentPrice =
          (await this.marketDataService.getTokenPrice(position.outputToken)) || 0;

        // Calculate unrealized PnL
        const currentValue = position.outputAmount * currentPrice;
        const initialValue = position.inputAmount;
        const unrealizedPnL = currentValue - initialValue;
        const unrealizedPnLPercentage = (unrealizedPnL / initialValue) * 100;

        // Update position
        position.currentPrice = currentPrice;
        position.unrealizedPnL = unrealizedPnL;
        position.unrealizedPnLPercentage = unrealizedPnLPercentage;

        // Check stop loss/take profit conditions and auto-close if needed
        // In production, this would trigger trades

        // Save updated position
        await PostgresDB.updateStrategyPosition(position);

        updatedPositions.push(position);
      }

      // Update cache
      await RedisCache.set(`positions:${userStrategyId}`, updatedPositions, 60);

      return {
        success: true,
        positions: updatedPositions,
      };
    } catch (error) {
      logger.error('Error updating positions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating positions',
      };
    }
  }

  /**
   * Adjust trade amount based on confidence and risk level
   */
  private getConfidenceMultiplier(
    confidence: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): number {
    // Normalize confidence to 0-1 range
    const normalizedConfidence = confidence / 100;

    // Base multiplier starts at 50% of max
    const baseMultiplier = 0.5;

    // Adjust for risk level
    const riskMultiplier = riskLevel === 'low' ? 0.7 : riskLevel === 'medium' ? 1.0 : 1.3;

    // Adjust for confidence (higher confidence = closer to max amount)
    const confidenceEffect = normalizedConfidence * 0.5; // Max additional 50% based on confidence

    // Calculate final multiplier
    return (baseMultiplier + confidenceEffect) * riskMultiplier;
  }

  /**
   * Get all available AI signals
   */
  public async getAllSignals(): Promise<AISignal[]> {
    try {
      // In production, generate signals for tracked tokens
      // For now, generate mock signals
      const tokens = ['SOL', 'JUP', 'BONK', 'JTO', 'WIF'];

      const signals: AISignal[] = [];

      for (const token of tokens) {
        const signal = await this.generateSignal(token);
        signals.push(signal);
      }

      return signals;
    } catch (error) {
      logger.error('Error getting all signals:', error);
      return [];
    }
  }

  /**
   * Get statistics for a user strategy
   */
  public async getStrategyStats(userStrategyId: string): Promise<{
    totalTrades: number;
    successfulTrades: number;
    profitableTrades: number;
    totalPnL: number;
    pnlPercentage: number;
    openPositions: number;
    closedPositions: number;
  }> {
    try {
      // Get all positions
      const positions = await PostgresDB.getStrategyPositions(userStrategyId);

      // Calculate statistics
      const totalTrades = positions.length;
      const openPositions = positions.filter(p => p.status === 'open').length;
      const closedPositions = positions.filter(p => p.status === 'closed').length;
      const profitableTrades = positions.filter(
        p => p.status === 'closed' && (p.realizedPnL || 0) > 0
      ).length;
      const successfulTrades = profitableTrades;

      // Calculate PnL
      const totalPnL = positions.reduce((sum, p) => {
        if (p.status === 'closed') {
          return sum + (p.realizedPnL || 0);
        }
        return sum + (p.unrealizedPnL || 0);
      }, 0);

      // Calculate percentage return (mock initial deposit)
      const initialDeposit = 1000; // In production, track actual deposits
      const pnlPercentage = (totalPnL / initialDeposit) * 100;

      return {
        totalTrades,
        successfulTrades,
        profitableTrades,
        totalPnL,
        pnlPercentage,
        openPositions,
        closedPositions,
      };
    } catch (error) {
      logger.error('Error getting strategy stats:', error);
      return {
        totalTrades: 0,
        successfulTrades: 0,
        profitableTrades: 0,
        totalPnL: 0,
        pnlPercentage: 0,
        openPositions: 0,
        closedPositions: 0,
      };
    }
  }
}
