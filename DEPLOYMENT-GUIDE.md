# BlockSwarms Deployment Guide

This guide provides instructions for deploying BlockSwarms to production without using Docker.

## Prerequisites

### 1. Environment Variables

Before deploying, make sure you have set up all required environment variables in your deployment platform:

- **API Keys**: GROQ_API_KEY, OPENAI_API_KEY, etc.
- **Clerk Authentication**: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, etc.
- **Solana Configuration**: NEXT_PUBLIC_SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_WSS_URL

See `.env.example` for a complete list of required variables.

### 2. Clerk Authentication Setup

Clerk is used for authentication in BlockSwarms. To set it up:

1. Create an account at [Clerk.com](https://clerk.com)
2. Create a new application in the Clerk dashboard
3. Configure authentication methods (Email, Social logins, etc.)
4. Set allowed domains in the Clerk dashboard for your production URL
5. Configure redirect URLs:
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
6. Copy the API keys from your Clerk dashboard to your environment variables

## Recommended Deployment Options

### 1. Vercel (Easiest)

Vercel is the recommended platform for deploying Next.js applications with minimal setup.

**Steps:**
1. Push your repository to GitHub
2. Connect to Vercel (https://vercel.com)
3. Import your repository
4. Configure environment variables in the Vercel dashboard
5. Deploy!

**Benefits:**
- Zero configuration required
- Built-in CDN and edge functions
- Automatic HTTPS
- Preview deployments for pull requests
- Integration with GitHub

### 2. Netlify

**Steps:**
1. Push your repository to GitHub
2. Connect to Netlify (https://netlify.com)
3. Import your repository
4. Add build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Configure environment variables
6. Deploy!

### 3. Traditional Hosting with Node.js

For traditional hosting environments with Node.js:

**Prerequisites:**
- Node.js 18+ installed on your server
- PM2 or similar process manager (recommended)
- Nginx or similar reverse proxy (recommended)

**Deployment Steps:**

1. Set up your server with Node.js 18+
2. Clone your repository on the server
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your production values
   ```

5. Build the application
   ```bash
   npm run build
   ```

6. Start the application with PM2
   ```bash
   # Install PM2 if not installed
   npm install -g pm2
   
   # Start the application
   pm2 start npm --name "blockswarms" -- start
   
   # Make it restart on server reboot
   pm2 startup
   pm2 save
   ```

7. Set up Nginx (optional but recommended)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. Set up SSL with Let's Encrypt (recommended)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Pre-Deployment Checklist

Before deploying, make sure to:

1. Update all API keys to production versions
2. Set up proper environment variables (including Clerk authentication)
3. Ensure CoinGecko API and Solana RPC endpoints are configured for production
4. Run a full build to check for errors: `npm run build`
5. Test the production build locally: `npm start`

See the `DEPLOYMENT-CHECKLIST.md` file for a more comprehensive checklist.

## Post-Deployment Monitoring

After deployment, monitor:

1. API rate limits (CoinGecko, Groq, etc.)
2. Server performance
3. Error logs
4. Authentication flows (verify Clerk is working properly)

## Automatic Deployment

For any of the cloud platforms mentioned above (Vercel, Netlify), you can set up automatic deployments that trigger whenever you push to the main branch of your repository.

## Troubleshooting

If you encounter issues during deployment:

1. Check the deployment logs for errors
2. Verify all environment variables are set correctly
3. Ensure all API endpoints are accessible from your production environment
4. Check for rate limiting issues with external APIs
5. For authentication issues, verify Clerk configuration in the Clerk dashboard
