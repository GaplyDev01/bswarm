# BlockSwarms Routing Guide

This document explains the routing structure of the BlockSwarms application and provides guidelines for maintaining consistent routing in both local and production environments.

## Routing Structure

The application uses Next.js App Router, with routes defined in the `app/` directory. We have centralized route definitions in `lib/routes.ts` to ensure consistency.

### Route Types

- **Public Routes**: Accessible without authentication
- **App Routes**: Protected routes requiring authentication
- **API Routes**: Backend endpoints for data and functionality
- **Cron Routes**: Endpoints for scheduled tasks

## Using Routes in Components

Always import routes from the central route definition file:

```typescript
import { APP_ROUTES, PUBLIC_ROUTES, API_ROUTES } from '@/lib/routes';

// Use in navigation
router.push(APP_ROUTES.DASHBOARD);

// Use in API calls
fetch(API_ROUTES.TOKEN_SEARCH);

// Use with parameters
fetch(API_ROUTES.TOKEN_BY_ID('sol'));
```

## Route Protection

Routes are protected using Clerk authentication middleware, defined in `middleware.ts`. The public routes are explicitly listed, and all other routes require authentication.

## Environment Considerations

### Local Development

In local development, routes work as defined in the codebase. The base URL is typically `http://localhost:3000`.

### Production Deployment

In production, routes maintain the same paths, but the base URL will change to your deployment URL.

For absolute URLs in production, use the `NEXT_PUBLIC_SITE_URL` environment variable defined in `vercel.json`.

## Cron Jobs

The application includes scheduled tasks defined in `vercel.json`:

- `/api/cron/update-tokens` - Runs every 6 hours
- `/api/cron/refresh-market-data` - Runs every 15 minutes

## Maintaining Routes

When adding new routes:

1. Add the route definition to `lib/routes.ts`
2. Create the corresponding page or API endpoint in the `app/` directory
3. Update `middleware.ts` if the route should be publicly accessible
4. Use the route constant in components rather than hard-coding the path

## Troubleshooting

If routes aren't working as expected:

1. Check that the route is correctly defined in `lib/routes.ts`
2. Verify the route is properly imported and used in components
3. If it's a protected route, ensure middleware is configured correctly
4. For API routes, check that the endpoint is implemented with correct HTTP methods