// @ts-nocheck
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';

    // Log key details (but not the entire key)
    logger.log('Testing OpenAI API Key:', {
      length: apiKey.length,
      prefix: apiKey.substring(0, 10) + '...',
      isProjectKey: apiKey.startsWith('sk-proj-'),
    });

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Test with a simple models list request
    const models = await openai.models.list();

    return NextResponse.json({
      success: true,
      message: 'API Key is valid',
      modelCount: models.data.length,
      firstFewModels: models.data.slice(0, 3).map(model => model.id),
    });
// @ts-ignore
  } catch (error: Event) {
    logger.error('OpenAI API Test Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'API Key validation failed',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
