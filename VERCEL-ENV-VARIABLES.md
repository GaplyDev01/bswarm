# Vercel Environment Variables

To deploy this application to Vercel, you need to add the following environment variables in your Vercel project settings:

## Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## AI API Keys
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Database & Storage (Neon PostgreSQL)
```
DATABASE_URL=your_database_url
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
DATABASE_URL_UNPOOLED=your_database_url_unpooled
```

## Caching & Vector Storage (Upstash)
```
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
KV_URL=your_kv_url
UPSTASH_VECTOR_REST_URL=your_upstash_vector_rest_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_rest_token
UPSTASH_VECTOR_REST_READONLY_TOKEN=your_upstash_vector_rest_readonly_token
```

## Market Data
```
COINGECKO_API_KEY=your_coingecko_api_key
```

## Blockchain Settings
```
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
TRADING_FEE_PERCENTAGE=0.1
MAX_POSITIONS_PER_USER=10
```

## Instructions for Adding Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each of the above variables (you can copy and paste multiple variables at once)
4. Make sure to click "Save" after adding the variables
5. Redeploy your application for the changes to take effect
