// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

// Remove the _runtime export as it's not valid in Next.js 15
// export const _runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Simple test route
    return NextResponse.json({
      status: 'success',
      message: 'Authentication route test',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Authentication failed',
      },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Process authentication request
    const _body = await request.json();

    // Simple test response
    return NextResponse.json({
      status: 'success',
      message: 'Authentication processed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Authentication processing failed',
      },
      { status: 400 }
    );
  }
}

// Set to force-dynamic to prevent caching
export const dynamic = 'force-dynamic';
