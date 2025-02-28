import { NextRequest, NextResponse } from 'next/server';

// Remove the _runtime export as it's not valid in Next.js 15
// export const _runtime = 'edge';

// This is a simplified route structure for Next.js 15
export async function GET(request: NextRequest) {
  try {
    // Get the URL and parse potential redirect
    const url = new URL(request.url);
    const _redirectUrl = url.searchParams.get('redirect_url') || '/dashboard';

    // Return a simple success response
    return NextResponse.json({
      status: 'success',
      message: 'Auth route - GET',
      path: request.nextUrl.pathname,
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
    const _body = await request.json().catch(() => ({}));

    // Return a simple success response
    return NextResponse.json({
      status: 'success',
      message: 'Auth route - POST',
      path: request.nextUrl.pathname,
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
