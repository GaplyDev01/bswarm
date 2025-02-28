/**
 * Application route definitions
 *
 * This file centralizes all route paths to ensure consistency
 * across the application and make future routing changes easier.
 */

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MARKETS: '/markets',
  AI_CHAT: '/ai-chat',
};

// Protected/authenticated routes
export const APP_ROUTES = {
  DASHBOARD: '/dashboard',
  TOKEN_ANALYSIS: '/token-analysis',
  CHAT: '/chat',
  PORTFOLIO: '/portfolio',
  INVESTMENT: '/investment',
  SETTINGS: '/settings',
  SIGNALS: '/signals',
  WALLET: '/wallet',
  TOKENS: '/tokens',
  TRADING: '/trading',
  MARKET_ANALYSIS: '/market-analysis',
  ANALYTICS: '/analytics',
  AGENTS: '/agents',
};

// API routes
export const API_ROUTES = {
  // Token related
  TOKEN_SEARCH: '/api/token/search',
  TOKEN_INFO: '/api/token/info',
  TOKEN_BY_ID: (id: string) => `/api/token/${id}`,
  TOKEN_TEST: '/api/token/test',

  // Market related
  MARKET_DATA: '/api/market/data',
  MARKET_TRENDING: '/api/market/trending',

  // Chat/AI related
  CHAT: '/api/chat',
  CLAUDE_CHAT: '/api/claude-chat',
  SEARCH: '/api/search',

  // Cron jobs
  CRON_UPDATE_TOKENS: '/api/cron/update-tokens',
  CRON_REFRESH_MARKET_DATA: '/api/cron/refresh-market-data',

  // Admin routes
  ADMIN_RESET_TOKENS: '/api/admin/reset-tokens',
  ADMIN_RESET_CACHE: '/api/admin/reset-cache',

  // Auth routes
  AUTH: '/api/auth',

  // Misc
  HEALTH: '/api/health',
};
