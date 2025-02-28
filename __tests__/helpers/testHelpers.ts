// @ts-nocheck
import { NextRequest } from 'next/server';

// Mock the global Request class if it doesn't exist in the test environment
global.Request = class MockRequest {} as unknown;

// Mock the NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: function () {
      return {};
    },
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => {
        return {
          status: options?.status || 200,
          json: async () => body,
        };
      }),
    },
  };
});

/**
 * Helper function to create mock request with search params
 * @param path The pathname
 * @param params Query parameters
 * @param options Additional options for the request (method, body, etc.)
 */
export function createMockRequest(
  path: string,
  params: Record<string, string> | null = {},
  options: { method?: string; body?: string } = {}
) {
  // Create a URL with search params
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
  }

  const url = `http://localhost:3000${path}${params ? `?${searchParams.toString()}` : ''}`;

  // Create the mock request
  return {
    url,
    method: options.method || 'GET',
    nextUrl: {
      pathname: path,
      searchParams: {
        get: (key: string) => (params ? params[key] || null : null),
      },
    },
    json: async () => (options.body ? JSON.parse(options.body) : {}),
  } as unknown as NextRequest;
}

/**
 * Helper function to mock environment variables
 * @param env The environment variables to mock
 */
export function mockEnv(env: Record<string, string | undefined>) {
  const originalEnv = process.env;

  Object.keys(env).forEach(key => {
    process.env[key] = env[key];
  });

  return () => {
    process.env = originalEnv;
  };
}
