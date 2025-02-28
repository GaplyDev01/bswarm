# BlockSwarms Deployment Checklist

## Pre-Deployment

- [x] Fix TypeScript errors in critical files
  - [x] `app/api/chat/groq-handler.ts`
  - [x] `app/api/chat/tool-handler.ts`
  - [x] `lib/coingecko-api.ts`
- [x] Ensure ESLint checks are disabled during builds (next.config.js)
- [ ] Verify environment variables are set up
- [ ] Check API rate limits for external services
  - [ ] CoinGecko API
  - [ ] Groq API
  - [ ] Solana RPC nodes

## Environment Setup

### Required Environment Variables

```
# API Keys
OPENAI_API_KEY=
GROQ_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_KEY=

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=
NEXT_PUBLIC_SOLANA_WSS_URL=

# Database Configuration (if applicable)
DATABASE_URL=
```

## Clerk Authentication Setup

- [ ] Create a Clerk account at https://clerk.com if you don't have one
- [ ] Create a new application in the Clerk dashboard
- [ ] Configure authentication methods (Email, Social logins, etc.)
- [ ] Set up redirect URLs in the Clerk dashboard
- [ ] Copy API keys to your environment variables
- [ ] Test authentication flows before deployment

## Production Optimization

- [ ] Configure caching strategies
  - [ ] Verify the CoinGecko API memory cache is working correctly
  - [ ] Consider implementing Redis or other caching solution for production
- [ ] Set up proper error logging
- [ ] Configure monitoring and alerts

## Deployment Process

1. Run a production build locally to catch any build-time errors
   ```
   npm run build
   ```

2. Test the production build locally
   ```
   npm run start
   ```

3. Deploy to staging environment first
   - Test all key functionality
   - Verify API integrations
   - Check for performance issues

4. Deploy to production
   - Monitor logs for errors
   - Watch API usage and rate limits
   - Check system performance

## Post-Deployment

- [ ] Verify all API integrations are working
- [ ] Check for any rate limiting issues
- [ ] Monitor error logs
- [ ] Set up automated monitoring for critical endpoints

## Rollback Plan

In case of deployment issues, be prepared to:

1. Roll back to the previous stable version
2. Have backups of critical data
3. Document the issue for future reference

## Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [QuickNode Documentation](https://www.quicknode.com/docs/solana)
- [CoinGecko API Documentation](https://www.coingecko.com/api/documentation)
- [Clerk Documentation](https://clerk.com/docs)
