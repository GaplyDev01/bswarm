// @ts-nocheck
import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis-cache';
import { logger } from '@/lib/logger';

/**
 * API route to reset the Redis cache
 * Use this endpoint only in development for testing purposes
 */
export async function POST() {
  try {
    // Clear all token-related cache entries
    // Safe approach: selectively clear by patterns rather than flushing all
    const tokenKeys = await RedisCache.scan('token:*');
    const searchKeys = await RedisCache.scan('search:*');

    // Delete token data cache
    let deletedCount = 0;
    for (const key of [...tokenKeys, ...searchKeys]) {
      await RedisCache.delete(key);
      deletedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully. Deleted ${deletedCount} keys.`,
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear cache' }, { status: 500 });
  }
}
