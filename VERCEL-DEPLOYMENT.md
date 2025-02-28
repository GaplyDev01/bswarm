# Deploying BlockSwarms to Vercel

This guide explains how to deploy the BlockSwarms application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Git repository with your BlockSwarms project (GitHub, GitLab, or Bitbucket)
3. Required API keys and environment variables

## Step 1: Set Up Environment Variables

Make sure you have all the required environment variables. Based on the `.env.local.example` file, you need:

- `ANTHROPIC_API_KEY`: API key for Anthropic (Claude AI)
- `OPENAI_API_KEY`: API key for OpenAI
- `GROQ_API_KEY`: API key for Groq
- `COINGECKO_API_KEY`: API key for CoinGecko
- `DATABASE_URL`: PostgreSQL database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key for Clerk authentication
- `CLERK_SECRET_KEY`: Secret key for Clerk authentication
- `REDIS_URL`: (Optional) URL for Redis cache
- `NEXT_PUBLIC_SOLANA_RPC_URL`: QuickNode or other Solana RPC endpoint
- `NEXT_PUBLIC_SITE_URL`: Your site URL (defaults to https://txbt.vercel.app)

## Step 2: Deploy to Vercel

### Option 1: Using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Deploy from your project directory:
   ```
   vercel
   ```

4. Follow the prompts to link your project and set up environment variables.

### Option 2: Using the Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → "Project"

4. Import your repository

5. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. Add all your environment variables from Step 1

7. Click "Deploy"

## Step 3: Set Up Cron Jobs

The application uses several cron jobs for data updates. These are already configured in the `vercel.json` file:

```json
"crons": [
  {
    "path": "/api/cron/update-tokens",
    "schedule": "0 */6 * * *"
  },
  {
    "path": "/api/cron/refresh-market-data",
    "schedule": "*/15 * * * *"
  },
  {
    "path": "/api/cron/generate-trading-signals",
    "schedule": "0 */4 * * *"
  },
  {
    "path": "/api/cron/update-positions",
    "schedule": "*/10 * * * *"
  }
]
```

Ensure your Vercel plan supports cron jobs (available on Pro plans and above).

## Step 4: Verify Deployment

1. After deployment, Vercel will provide a URL to access your application

2. Test all major functionality:
   - Authentication flows
   - Solana blockchain interactions
   - AI chat functionality
   - Data retrieval and display

3. Check logs for any errors: In the Vercel dashboard, go to your project → Deployments → Select the latest deployment → Functions

## Troubleshooting

### Build Errors
- Check that all TypeScript errors are resolved
- Ensure all dependencies are properly installed
- Review Vercel build logs for specific errors

### Runtime Errors
- Verify all environment variables are set correctly
- Check that your database is accessible from Vercel
- Ensure API keys have the correct permissions

### Database Issues
- Make sure your database allows connections from Vercel's IP ranges
- Check connection pooling settings for optimal performance

## Production Considerations

1. **Environment Variables**: Use production-specific API keys and credentials.

2. **Custom Domain**: Configure a custom domain in the Vercel dashboard under Project Settings → Domains.

3. **Team Access**: Invite team members to your Vercel project for collaborative management.

4. **Analytics**: Set up Vercel Analytics to monitor user experience and performance.

5. **Preview Deployments**: Use Vercel's preview deployments for testing changes before merging to the main branch.

For additional support, refer to the [Vercel documentation](https://vercel.com/docs) or the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
