// @ts-nocheck
import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { formatErrorResponse, addSecurityHeaders } from '@/lib/api-utils';
import { PostgresDB } from '@/lib/postgres-db';
import { RedisCache } from '@/lib/redis-cache';
import { marketDataService } from '@/lib/market-data-service';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

/**
 * GET /api/health
 *
 * Health check endpoint to verify API services are working
 */
export async function GET() {
  try {
    // Get environment
    const env = getEnv();

    // Check API keys
    const apiKeysCheck = {
      coingecko: !!env.COINGECKO_API_KEY,
      anthropic: !!env.ANTHROPIC_API_KEY,
      openai: !!env.OPENAI_API_KEY,
      groq: !!env.GROQ_API_KEY,
    };

    // Check database connection
    let databaseStatus = false;
    try {
      // Run a simple query to check DB connection
      const result = await PostgresDB.getTrendingTokens(1);
      databaseStatus = Array.isArray(result);
    } catch (error) {
      logger.error('Database health check failed:', error);
    }

    // Check Redis cache
    let redisStatus = false;
    try {
      await RedisCache.set('health:check', 'ok', 30);
      const result = await RedisCache.get('health:check');
      redisStatus = result === 'ok';
    } catch (error) {
      logger.error('Redis health check failed:', error);
    }

    // Check external API
    let externalApiStatus = false;
    try {
      const price = await marketDataService.getTokenPrice('bitcoin');
      externalApiStatus = !!price;
    } catch (error) {
      logger.error('External API health check failed:', error);
    }

    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: databaseStatus,
        redis: redisStatus,
        externalApi: externalApiStatus,
      },
      apiKeys: apiKeysCheck,
      features: {
        aiSignals: env.ENABLE_AI_SIGNALS === 'true',
        mockTrading: env.ENABLE_MOCK_TRADING === 'true',
        liveTrading: env.ENABLE_TRADING === 'true',
      },
    };

    // Return health check status
    const response = NextResponse.json(status);

    // Add security headers
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Health check failed:', error);
    return formatErrorResponse(500, 'Health check failed');
  }
}
