/**
 * Type definitions for TradesXBT platform
 */

// Token Data Types
export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume?: number;
  image?: string;
  description?: string;
  circulating_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_date?: string;
  atl?: number;
  atl_date?: string;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  market_cap_change_24h?: number;
  market_cap_rank?: number;
  last_updated?: string;
}

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

export interface TokenSearchResult {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
}

export interface TechnicalIndicator {
  name: string;
  value: string | number;
  signal: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
}

// AI and Chat Types
export interface MessageDetail {
  type: string;
  text?: string;
}

export interface MessagePart {
  type: string;
  text?: string;
  token?: string;
  price?: number;
  details?: MessageDetail[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string | MessagePart[];
  createdAt?: Date;
}

export interface AISignal {
  token: string;
  tokenId: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: 'short' | 'medium' | 'long';
  price: number;
  reasoning: string;
  technicalIndicators: TechnicalIndicator[];
  sentiment: {
    social: number;
    news: number;
    overall: number;
  };
  timestamp: string;
  expiresAt: string;
}

// Trading Types
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

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  tokens: string[];
  maxPositionPercentage: number;
  targetProfitPercentage: number;
  stopLossPercentage: number;
  aiModel: string;
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

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// User Types
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  aiProvider?: string;
  aiModel?: string;
  tradingEnabled?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
    signals?: boolean;
  };
}

// Market Data Types
export interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  sol_dominance: number;
  last_updated: string;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  volumes: [number, number][];
}

// Wallet Types
export interface WalletBalance {
  token: string;
  amount: number;
  valueUsd: number;
}

export interface WalletDetails {
  address: string;
  balances: WalletBalance[];
  totalValueUsd: number;
}

// Tool Types
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresAuth: boolean;
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

// Error Types
export interface ErrorResponse {
  status: number;
  message: string;
  details?: unknown;
}

// Dashboard Types
export interface DashboardConfig {
  layout: 'default' | 'compact' | 'wide';
  showTrendingTokens: boolean;
  showPortfolio: boolean;
  showSignals: boolean;
  showTradeHistory: boolean;
  columns: number;
}
