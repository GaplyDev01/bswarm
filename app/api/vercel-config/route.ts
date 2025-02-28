// @ts-nocheck
import { NextRequest } from 'next/server';
import { createCacheHeaders } from '@/lib/api-utils';

// Default configuration
const defaultConfig = {
  analyticsEnabled: true,
  speedInsightsEnabled: true,

  edgeFunctionsEnabled: true,
  edgeMiddlewareEnabled: true,
  serverlessRegions: ['iad1', 'sfo1', 'hnd1', 'cdg1'],

  previewDeploymentSuffix: 'tradesxbt.vercel.app',
  teamPreviewsEnabled: true,
  commentPreviewsEnabled: true,

  securityHeadersEnabled: true,
  dataCacheEnabled: true,
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get headers with appropriate caching
  const cacheHeaders = createCacheHeaders(3600); // Cache for 1 hour

  // In a real app, this would fetch from Vercel API or environment variables
  // Here we're just returning the default config
  const config = {
    ...defaultConfig,
    // Dynamic values that might be fetched from environment variables
    environment: process.env.VERCEL_ENV || 'development',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    deploymentUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
    // Add timestamp to track when the config was generated
    generatedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      ...cacheHeaders,
    },
  });
}
