// @ts-nocheck
import { NextResponse } from 'next/server';
import { AIStrategyService } from '@/lib/ai-strategy-service';
import { formatErrorResponse } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/trading/stats?userStrategyId=xyz
 *
 * Gets performance statistics for a specific user strategy
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userStrategyId = url.searchParams.get('userStrategyId');

    if (!userStrategyId) {
      return formatErrorResponse(400, 'Missing required query parameter: userStrategyId');
    }

    const strategyService = AIStrategyService.getInstance();
    const stats = await strategyService.getStrategyStats(userStrategyId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Error getting strategy stats:', error);
    return formatErrorResponse(500, 'Failed to fetch strategy statistics');
  }
}
