# BlockSwarms v1.0

BlockSwarms is an AI-powered cryptocurrency trading platform that integrates with the Groq API to provide intelligent trading insights and chat functionality.

## Features

- AI Chat powered by Groq's LLM models
- Real-time cryptocurrency market analysis
- Integrated trading signals
- Wallet integration
- Responsive UI for desktop and mobile

## Technologies Used

- Next.js 15
- TypeScript
- Groq API
- Vercel AI SDK
- Tailwind CSS
- Solana Integration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local` (see `.env.example` for required variables)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Models

- llama-3.3-70b-versatile (default)
- deepseek-r1-distill-llama-70b
- deepseek-r1-distill-qwen-32b

## Deployment to Production

### Prerequisites

1. Make sure all environment variables are properly set (see `.env.example`)
2. Ensure API keys have production-level rate limits
3. Set up a Solana RPC endpoint through QuickNode or another provider

### Deployment Options

- **Vercel** (Recommended for Next.js apps)
- **Netlify**
- **Traditional Node.js hosting**

For detailed deployment instructions, see the `DEPLOYMENT-GUIDE.md` file.

For a comprehensive pre-deployment checklist, see `DEPLOYMENT-CHECKLIST.md`.

## Monitoring in Production

Monitor the following aspects of your deployment:

1. API rate limits (Groq, OpenAI, CoinGecko)
2. Error logs
3. Performance metrics
4. User engagement

## License

MIT License