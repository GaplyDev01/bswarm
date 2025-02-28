import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// Initialize Redis for rate limiting
let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN || '',
    });
  }
} catch (error) {
  logger.error('Failed to initialize Redis for rate limiting:', error);
}

// Standard error response formatter
// TODO: Replace 'any' with a more specific type
export function formatErrorResponse(status: number, message: string, details?: unknown) {
  logger.error(`API Error: ${status} - ${message}`, details || '');
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: details || undefined,
    },
    { status }
  );
}

// Retry mechanism for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    backoff?: number;
    maxBackoff?: number;
    onRetry?: (attempt: number, error: Event) => void;
    shouldRetry?: (error: Event) => boolean;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    backoff = 300,
    maxBackoff = 5000,
    onRetry = () => {},
    shouldRetry = () => true,
  } = options;

  let lastError: Event;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt > retries || !shouldRetry(error)) {
        break;
      }

      // Calculate exponential backoff with jitter
      const delay = Math.min(backoff * Math.pow(2, attempt - 1) + Math.random() * 100, maxBackoff);

      // Notify retry callback
      onRetry(attempt, error);

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Rate limiting middleware
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60 // 1 minute window by default
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  // If no Redis, allow all requests but warn
  if (!redis) {
    logger.warn('Rate limiting not available: Redis not configured');
    return { allowed: true, remaining: 999, resetAt: new Date(Date.now() + window * 1000) };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / window) * window;
  const key = `ratelimit:${identifier}:${windowKey}`;

  try {
    // Get current count
    const currentCount = (await redis.get<number>(key)) || 0;

    // Check if over limit
    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date((windowKey + window) * 1000),
      };
    }

    // Increment counter with expiry
    await redis.incr(key);
    await redis.expire(key, window * 2); // Double window to ensure proper expiration

    return {
      allowed: true,
      remaining: limit - (currentCount + 1),
      resetAt: new Date((windowKey + window) * 1000),
    };
  } catch (error) {
    logger.error('Rate limit check failed:', error);
    // On failure, allow the request to proceed
    return { allowed: true, remaining: 1, resetAt: new Date(Date.now() + window * 1000) };
  }
}

// Validate required API keys are present
export function validateRequiredKeys(): { valid: boolean; missing: string[] } {
  const requiredKeys = ['COINGECKO_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL'];

  const missing = requiredKeys.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Safely parse JSON with fallback
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    return fallback;
  }
}

// Create consistent data structure for API responses
export function createApiResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

// Helper to validate request parameters
export function validateParams(
  params: Record<string, any>,
  required: string[] = []
): { valid: boolean; missing: string[] } {
  const missing = required.filter(
    key => !(key in params) || params[key] === undefined || params[key] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Security headers for API responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Cache headers for API responses
export function createCacheHeaders(maxAge: number = 60): Record<string, string> {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
  };
}

// Fetch data from APIs with proper error handling
export async function fetchData<T>(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  return withRetry(
    async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    },
    {
      retries,
      onRetry: (attempt, error) => {
        logger.warn(`Retrying API call (${attempt}/${retries}):`, error);
      },
    }
  );
}

// Fetch configuration from Vercel
export async function fetchConfiguration(): Promise<Record<string, any>> {
  try {
    // Default configuration for when Vercel API is not available
    const defaultConfig = {
      features: {
        trading: false,
        signals: true,
        portfolioAnalysis: true,
      },
      limits: {
        apiRateLimit: 100,
        maxApiCalls: 1000,
      },
    };

    // Only fetch from Vercel in production
    if (process.env.NODE_ENV !== 'production') {
      return defaultConfig;
    }

    const response = await fetchData<{ data: Record<string, any> }>(
      `https://api.vercel.com/v1/projects/${process.env.VERCEL_PROJECT_ID}/env`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        },
      }
    );

    return response.data || defaultConfig;
  } catch (error) {
    logger.error('Failed to fetch Vercel configuration:', error);
    return {
      features: {
        trading: false,
        signals: true,
        portfolioAnalysis: true,
      },
      limits: {
        apiRateLimit: 100,
        maxApiCalls: 1000,
      },
    };
  }
}
