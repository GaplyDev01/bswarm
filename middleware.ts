import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import { getEnv, getRateLimit, getRateLimitWindow } from './lib/env';
import { checkRateLimit } from './lib/api-utils';

// Define public routes
export const publicRoutes = [
  '/',
  '/login*',
  '/signup*',
  '/api/health',
  '/api/token/search*',
  '/api/token/info*',
  '/api/market/trending*',
  '/api/market/data*',
];

// Define API rate limit paths
const apiRateLimitPaths = ['/api/'];

// Apply API rate limiting to requests
async function apiMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if this is an API route that should be rate limited
  if (apiRateLimitPaths.some(prefix => path.startsWith(prefix))) {
    // Use IP or auth token as identifier for rate limiting
    // Get IP address from headers since NextRequest.ip is deprecated
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const authHeader = request.headers.get('authorization');

    let identifier = ip;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If there's a token, use a combination of IP and token
      const token = authHeader.substring(7);
      identifier = `${ip}:${token.substring(0, 10)}`;
    }

    // Check rate limit
    const limitResult = await checkRateLimit(identifier, getRateLimit(), getRateLimitWindow());

    // If rate limit exceeded, return 429 Too Many Requests
    if (!limitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          resetAt: limitResult.resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': getRateLimit().toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(limitResult.resetAt.getTime() / 1000).toString(),
            'Retry-After': Math.ceil(
              (limitResult.resetAt.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', getRateLimit().toString());
    response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
    response.headers.set(
      'X-RateLimit-Reset',
      Math.floor(limitResult.resetAt.getTime() / 1000).toString()
    );

    return response;
  }

  // Not an API route, continue
  return NextResponse.next();
}

// Check if a feature flag is activated
function isFeatureActive(flagName: string): boolean {
  try {
    const env = getEnv();
    return env[flagName as keyof typeof env] === 'true';
  } catch (error) {
    return false;
  }
}

// Add security headers to responses
function addSecurityHeaders(response: NextResponse) {
  // Default security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Only add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Define a combined middleware that first checks API rate limits,
// then applies authentication checks
export default authMiddleware({
  publicRoutes,
  beforeAuth: async req => {
    return await apiMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Get the authentication result and request path
    const { isPublicRoute } = auth;
    const path = req.nextUrl.pathname;

    // Allow access to feature flag protected routes based on environment
    const featureFlagRoutes = [
      { path: '/trading', flag: 'ENABLE_TRADING' },
      { path: '/ai-signals', flag: 'ENABLE_AI_SIGNALS' },
    ];

    for (const { path: routePath, flag } of featureFlagRoutes) {
      if (path.startsWith(routePath) && !isFeatureActive(flag)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Continue with the request
    const response = NextResponse.next();

    // Add security headers
    return addSecurityHeaders(response);
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
