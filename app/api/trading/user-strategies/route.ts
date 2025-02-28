import { NextResponse } from 'next/server';
import { AIStrategyService } from '@/lib/ai-strategy-service';
import { formatErrorResponse } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/trading/user-strategies?userId=xyz
 *
 * Gets strategies for a specific user
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return formatErrorResponse(400, 'Missing required query parameter: userId');
    }

    const strategyService = AIStrategyService.getInstance();
    const strategies = await strategyService.getUserStrategies(userId);

    return NextResponse.json({
      success: true,
      strategies,
    });
  } catch (error) {
    logger.error('Error getting user strategies:', error);
    return formatErrorResponse(500, 'Failed to fetch user strategies');
  }
}

/**
 * PATCH /api/trading/user-strategies/:id
 *
 * Updates a user strategy (e.g., pause/activate)
 */
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const idMatch = path.match(/\/api\/trading\/user-strategies\/(.+)/);

    if (!idMatch || !idMatch[1]) {
      return formatErrorResponse(400, 'Missing strategy ID in URL');
    }

    const strategyId = idMatch[1];
    const body = await req.json();
    const { userId, status } = body;

    if (!userId) {
      return formatErrorResponse(400, 'Missing required field: userId');
    }

    if (status && !['active', 'paused'].includes(status)) {
      return formatErrorResponse(400, 'Invalid status. Must be "active" or "paused"');
    }

    // Get the strategy
    const strategyService = AIStrategyService.getInstance();
    const strategies = await strategyService.getUserStrategies(userId);
    const strategy = strategies.find(s => s.id === strategyId);

    if (!strategy) {
      return formatErrorResponse(404, 'Strategy not found');
    }

    // Update the strategy
    if (status) {
      strategy.status = status;
    }

    // Save the updated strategy
    await strategyService.updateUserStrategy(strategy);

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error) {
    logger.error('Error updating user strategy:', error);
    return formatErrorResponse(500, 'Failed to update user strategy');
  }
}
