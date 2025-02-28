// @ts-nocheck
import { kv } from '@vercel/kv';
import { logger } from '@/lib/logger';

// Cache TTL in seconds
const DEFAULT_TTL = 3600; // 1 hour
const TOKEN_DATA_TTL = 5 * 60; // 5 minutes
const MARKET_DATA_TTL = 2 * 60; // 2 minutes
const CHAT_HISTORY_TTL = 30 * 24 * 60 * 60; // 30 days

export type CacheKey = string;

/**
 * Vercel KV Redis client for caching
 */
export class RedisCache {
  /**
   * Set a value in the cache
   */
  static async set<T>(key: CacheKey, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
    try {
      // Ensure we're storing a proper JSON string, not an object
      const jsonString = JSON.stringify(value);
      await kv.set(key, jsonString, { ex: ttlSeconds });
      logger.log(`Redis cache: stored ${key} (${jsonString.length} chars)`);
    } catch (error) {
      logger.error('Redis cache set error:', error);
      // Fail gracefully in development or when Redis is not available
    }
  }

  /**
   * Get a value from the cache
   */
  static async get<T>(key: CacheKey): Promise<T | null> {
    try {
      const data = await kv.get(key);
      if (!data) {
        logger.log(`Redis cache: miss for key ${key}`);
        return null;
      }

      // Check if data is already an object (redis client handling)
      if (typeof data === 'object' && data !== null) {
        logger.log(`Redis cache: hit for key ${key} (already an object)`);
        return data as T;
      }

      // Otherwise parse it as JSON
      logger.log(`Redis cache: hit for key ${key} (string to parse)`);
      return JSON.parse(data as string) as T;
    } catch (error) {
      logger.error(`Redis cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  static async delete(key: CacheKey): Promise<void> {
    try {
      await kv.del(key);
    } catch (error) {
      logger.error('Redis cache delete error:', error);
    }
  }

  /**
   * Set token data in the cache
   */
  static async setTokenData(tokenId: string, data: Record<string, unknown>): Promise<void> {
    await this.set(`token:${tokenId}`, data, TOKEN_DATA_TTL);
  }

  /**
   * Get token data from the cache
   */
  static async getTokenData<T>(tokenId: string): Promise<T | null> {
    return this.get<T>(`token:${tokenId}`);
  }

  /**
   * Set market data in the cache
   */
  static async setMarketData(dataType: string, data: Record<string, unknown>): Promise<void> {
    await this.set(`market:${dataType}`, data, MARKET_DATA_TTL);
  }

  /**
   * Get market data from the cache
   */
  static async getMarketData<T>(dataType: string): Promise<T | null> {
    return this.get<T>(`market:${dataType}`);
  }

  /**
   * Store user chat history
   */
  static async setChatHistory(userId: string, tokenId: string, messages: Event[]): Promise<void> {
    await this.set(`chat:${userId}:${tokenId}`, messages, CHAT_HISTORY_TTL);
  }

  /**
   * Get user chat history
   */
  static async getChatHistory<T>(userId: string, tokenId: string): Promise<T | null> {
    return this.get<T>(`chat:${userId}:${tokenId}`);
  }

  /**
   * Store AI model preferences for a user
   */
  static async setUserModelPreference(
    userId: string,
    provider: string,
    model: string
  ): Promise<void> {
    await this.set(`preference:${userId}:model`, { provider, model }, CHAT_HISTORY_TTL);
  }

  /**
   * Get AI model preferences for a user
   */
  static async getUserModelPreference(
    userId: string
  ): Promise<{ provider: string; model: string } | null> {
    return this.get<{ provider: string; model: string }>(`preference:${userId}:model`);
  }

  /**
   * Scan for keys matching a pattern
   */
  static async scan(pattern: string): Promise<string[]> {
    try {
      // Use keys command for development purposes
      // In production with large datasets, should use scan instead
      const keys = await kv.keys(pattern);
      logger.log(`Found ${keys.length} keys matching pattern: ${pattern}`);
      return keys;
    } catch (error) {
      logger.error(`Redis scan error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Flush all cache entries (use with caution)
   */
  static async flush(): Promise<void> {
    try {
      await kv.flushall();
      logger.log('Redis cache flushed successfully');
    } catch (error) {
      logger.error('Redis cache flush error:', error);
      throw error;
    }
  }

  /**
   * Health check for Redis connection
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const testKey = `health:${Date.now()}`;
      const testValue = 'ok';

      // Set a value
      await this.set(testKey, testValue, 10);

      // Get it back
      const result = await this.get<string>(testKey);

      // Cleanup
      await this.delete(testKey);

      // Return true if value matches
      return result === testValue;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
