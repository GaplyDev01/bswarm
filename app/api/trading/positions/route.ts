// @ts-nocheck
import { NextResponse } from 'next/server';
import { AIStrategyService } from '@/lib/ai-strategy-service';
import { formatErrorResponse } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/trading/positions?userStrategyId=xyz
 *
 * Gets positions for a specific user strategy
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userStrategyId = url.searchParams.get('userStrategyId');

    if (!userStrategyId) {
      return formatErrorResponse(400, 'Missing required query parameter: userStrategyId');
    }

    const strategyService = AIStrategyService.getInstance();

    // Update positions to get latest price data
    const updateResult = await strategyService.updatePositions(userStrategyId);

    if (!updateResult.success) {
      return formatErrorResponse(500, updateResult.error || 'Failed to update positions');
    }

    return NextResponse.json({
      success: true,
      positions: updateResult.positions,
    });
  } catch (error) {
    logger.error('Error getting positions:', error);
    return formatErrorResponse(500, 'Failed to fetch positions');
  }
}

/**
 * POST /api/trading/positions
 *
 * Creates a new position (executes a trade) based on AI signal
 *
 * Required body:
 * - userId: string
 * - userStrategyId: string
 * - inputToken: string
 * - outputToken: string
 * - amount: number
 * - signal: AISignal
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userStrategyId, inputToken, outputToken, amount, signal } = body;

    if (!userId || !userStrategyId || !inputToken || !outputToken || !amount || !signal) {
      return formatErrorResponse(400, 'Missing required fields');
    }

    const strategyService = AIStrategyService.getInstance();
    const result = await strategyService.executeStrategyTrade(
      userId,
      userStrategyId,
      inputToken,
      outputToken,
      amount,
      signal
    );

    if (!result.success) {
      return formatErrorResponse(400, result.error || 'Failed to execute trade');
    }

    return NextResponse.json({
      success: true,
      position: result.position,
      tradeResult: result.tradeResult,
    });
  } catch (error) {
    logger.error('Error executing trade:', error);
    return formatErrorResponse(500, 'Failed to execute trade');
  }
}

/**
 * PATCH /api/trading/positions/:id
 *
 * Closes a position (exits a trade)
 *
 * Required body:
 * - userId: string
 */
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const idMatch = path.match(/\/api\/trading\/positions\/(.+)/);

    if (!idMatch || !idMatch[1]) {
      return formatErrorResponse(400, 'Missing position ID in URL');
    }

    const positionId = idMatch[1];
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return formatErrorResponse(400, 'Missing required field: userId');
    }

    const strategyService = AIStrategyService.getInstance();
    const result = await strategyService.closePosition(userId, positionId);

    if (!result.success) {
      return formatErrorResponse(400, result.error || 'Failed to close position');
    }

    return NextResponse.json({
      success: true,
      position: result.position,
      tradeResult: result.tradeResult,
    });
  } catch (error) {
    logger.error('Error closing position:', error);
    return formatErrorResponse(500, 'Failed to close position');
  }
}
