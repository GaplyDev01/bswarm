import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Test route works',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error:`, error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
