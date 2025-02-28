import { NextResponse } from 'next/server';
import { AIStrategyService } from '@/lib/ai-strategy-service';
import { formatErrorResponse } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/trading/strategies
 *
 * Gets available strategy templates that users can choose from
 */
export async function GET(req: Request) {
  try {
    const strategyService = AIStrategyService.getInstance();
    const templates = strategyService.getStrategyTemplates();

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    logger.error('Error getting strategy templates:', error);
    return formatErrorResponse(500, 'Failed to fetch strategy templates');
  }
}

/**
 * POST /api/trading/strategies
 *
 * Creates a new trading strategy for a user
 *
 * Required body:
 * - userId: string
 * - strategyTemplateId: string
 * - riskOverride?: 'low' | 'medium' | 'high'
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, strategyTemplateId, riskOverride } = body;

    if (!userId || !strategyTemplateId) {
      return formatErrorResponse(400, 'Missing required fields: userId and strategyTemplateId');
    }

    const strategyService = AIStrategyService.getInstance();
    const result = await strategyService.createUserStrategy(
      userId,
      strategyTemplateId,
      riskOverride
    );

    if (!result.success) {
      return formatErrorResponse(400, result.error || 'Failed to create strategy');
    }

    return NextResponse.json({
      success: true,
      strategy: result.userStrategy,
    });
  } catch (error) {
    logger.error('Error creating strategy:', error);
    return formatErrorResponse(500, 'Failed to create strategy');
  }
}
