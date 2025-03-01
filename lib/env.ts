// @ts-nocheck
// Environment validation and configuration

import { z } from 'zod';
import { logger } from './logger';

// Define environment variables schema with defaults
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Caching
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),

  // External API keys
  COINGECKO_API_KEY: z.string().min(1),
  COINMARKETCAP_API_KEY: z.string().optional(),

  // AI providers
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_RATE_LIMIT: z.string().default('100'),
  API_RATE_LIMIT_WINDOW: z.string().default('60'),

  // Auth
  AUTH_SECRET: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),

  // Solana integration
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().optional(),
  NEXT_PUBLIC_SOLANA_WSS_URL: z.string().optional(),
  NEXT_PUBLIC_USE_REAL_SOLANA: z.string().optional().default('false'),

  // Feature flags
  ENABLE_TRADING: z.string().optional(),
  ENABLE_MOCK_TRADING: z.string().default('true'),
  ENABLE_AI_SIGNALS: z.string().default('true'),
});

// Type for type safety when accessing environment variables
export type Env = z.infer<typeof envSchema>;

function getEnvOrThrow(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
        .map(e => e.path.join('.'));

      const invalidVars = error.errors
        .filter(e => e.code !== 'invalid_type' || e.received !== 'undefined')
        .map(e => `${e.path.join('.')}: ${e.message}`);

      // Log all environment validation errors
      if (missingVars.length > 0) {
        logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      if (invalidVars.length > 0) {
        logger.error(`Invalid environment variables: ${invalidVars.join(', ')}`);
      }

      // Special handling for development mode
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'Running in development mode with missing environment variables - using fallbacks'
        );

        // Create a fallback environment with required values
        const fallbackEnv: Partial<Env> = {
          ...process.env,
          DATABASE_URL:
            process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tradesxbt',
          COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || 'demo-key',
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'demo-key',
          NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          NEXT_PUBLIC_USE_REAL_SOLANA: process.env.NEXT_PUBLIC_USE_REAL_SOLANA || 'false',
          ENABLE_MOCK_TRADING: 'true',
        };

        return envSchema.parse(fallbackEnv);
      }

      // In production, throw error for missing critical variables
      throw new Error(`Environment validation failed: ${error.message}`);
    }

    throw error;
  }
}

// Lazy-loaded environment to avoid issues during build time
let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = getEnvOrThrow();
  }
  return cachedEnv;
}

// Utility functions for specific environment variables

/**
 * Check if mock trading is enabled
 */
export function isMockTradingEnabled(): boolean {
  return getEnv().ENABLE_MOCK_TRADING === 'true';
}

/**
 * Check if live trading is enabled
 */
export function isLiveTradingEnabled(): boolean {
  return getEnv().ENABLE_TRADING === 'true';
}

/**
 * Check if real Solana integration is enabled
 */
export function isRealSolanaEnabled(): boolean {
  return getEnv().NEXT_PUBLIC_USE_REAL_SOLANA === 'true';
}

/**
 * Get Solana RPC URL
 */
export function getSolanaRpcUrl(): string {
  return getEnv().NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

/**
 * Check if AI signals are enabled
 */
export function areAISignalsEnabled(): boolean {
  return getEnv().ENABLE_AI_SIGNALS === 'true';
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Get rate limit for API calls
 */
export function getRateLimit(): number {
  return parseInt(getEnv().API_RATE_LIMIT, 10);
}

/**
 * Get rate limit window in seconds
 */
export function getRateLimitWindow(): number {
  return parseInt(getEnv().API_RATE_LIMIT_WINDOW, 10);
}

/**
 * Get Anthropic API key
 */
export function getAnthropicApiKey(): string {
  return getEnv().ANTHROPIC_API_KEY;
}

/**
 * Get Groq API key
 */
export function getGroqApiKey(): string {
  return getEnv().GROQ_API_KEY || '';
}
