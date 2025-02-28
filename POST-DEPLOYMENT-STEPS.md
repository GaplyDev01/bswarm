# BlockSwarms Post-Deployment Steps

This guide outlines the crucial steps to complete after your BlockSwarms application is successfully deployed to Vercel.

## 1. Configure Environment Variables

Log in to your Vercel dashboard and navigate to your BlockSwarms project:

1. Go to the **Settings** tab
2. Select **Environment Variables**
3. Add all required environment variables from your `.env.local` file:

### Required Environment Variables

```
# API Keys
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
REPLICATE_API_KEY=your_replicate_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/your-token/
NEXT_PUBLIC_SOLANA_WSS_URL=wss://your-endpoint.solana-mainnet.quiknode.pro/your-token/

# CoinGecko API
COINGECKO_API_KEY=your_coingecko_key_here
COINGECKO_CACHE_TTL=300
```

4. Click **Save** after adding all variables
5. Redeploy the application to apply the new environment variables

## 2. Configure Clerk for Production

Log in to your [Clerk Dashboard](https://dashboard.clerk.com/):

1. Navigate to your application
2. Go to **Settings** > **Domains & URLs**
3. Add your Vercel deployment URL to the allowed domains
4. Configure your redirect URLs:
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
5. Save changes

## 3. Set Up QuickNode for Solana

Solana integration requires a reliable RPC endpoint:

1. Log in to your [QuickNode account](https://www.quicknode.com/)
2. Create a new Solana endpoint (select the appropriate network: mainnet or devnet)
3. Copy the HTTP and WSS endpoint URLs
4. Add these URLs to your Vercel environment variables
5. Enable appropriate QuickNode add-ons as needed:
   - NFT API
   - Token API
   - Priority Fee API

## 4. Verify Your Deployment

After completing the above steps:

1. Visit your deployed application
2. Test user authentication (sign up and sign in)
3. Test the AI chat functionality
4. Verify Solana integration works
5. Check token search and market data

## 5. Set Up Monitoring

Consider setting up monitoring to track the health of your application:

1. **Error Tracking**: Use a service like [Sentry](https://sentry.io/) to track runtime errors
2. **Performance Monitoring**: Configure [Vercel Analytics](https://vercel.com/analytics) for Web Vitals
3. **API Usage**: Set up alerts for API rate limits (especially for CoinGecko and LLM providers)

## 6. Regular Maintenance

Establish a maintenance schedule:

1. Update dependencies regularly
2. Rotate API keys periodically
3. Monitor API usage and costs
4. Review application logs for potential issues
5. Gradually fix TypeScript errors:
   - The deployment process uses `@ts-ignore` comments to bypass TypeScript errors
   - Identify files with the most ignore comments (`git grep "@ts-ignore"`)
   - Fix at least 5-10 type errors per week to improve code quality
   - Focus on cleaning up `unknown` types with proper interfaces

## Troubleshooting Common Issues

### Authentication Problems
- Verify Clerk environment variables are correctly set
- Check that your production domain is added to Clerk's allowed domains
- Ensure redirect URLs are configured properly

### Solana Integration Issues
- Verify your RPC endpoint is active and responding
- Check rate limits on your QuickNode plan
- Ensure your WebSocket URL is formatted correctly

### AI Chat Not Working
- Verify API keys for OpenAI, Groq, or Anthropic
- Check API usage and rate limits
- Inspect browser console for client-side errors

### TypeScript Build Errors
- Use our TypeScript error fixing scripts:
  ```bash
  # Fix TypeScript errors with type assertions
  npm run fix-types
  
  # Add @ts-ignore comments to remaining errors
  npm run add-ts-ignore
  
  # Build with production TypeScript config
  npm run build:deploy
  ```
- Alternatively, run the entire process with:
  ```bash
  npm run deploy
  ```

For additional assistance, refer to the documentation for each service:
- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [QuickNode Documentation](https://www.quicknode.com/docs/solana)
- [CoinGecko API Documentation](https://www.coingecko.com/api/documentation)
