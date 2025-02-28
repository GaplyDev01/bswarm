 # Multi-Model AI Integration for BlockSwarms

This document explains how different AI models are integrated into the BlockSwarms application.

## Overview

BlockSwarms now primarily uses Groq's API to access a variety of powerful language models:

1. **Main Trading Chat** - Powered by multiple models via Groq's high-performance API
2. **Specialized Models** - Support for specific use cases through model selection

## Model Capabilities

### Groq-Powered Models

The main chat interface leverages multiple models through Groq's API:

- `mixtral-8x7b-32768` (default) - Powerful mixture-of-experts model with 32k context
- `llama-3.1-70b` - High-performance model with strong reasoning capabilities
- `llama-3.1-405b-reasoning` - Largest open-source model with exceptional reasoning power
- `llama-3-8b` - Fast, smaller model for quick responses

These models are selected for their outstanding performance characteristics:
- Fast response times (10-100x faster than some alternatives)
- Strong reasoning capabilities for market analysis
- Support for function calling/tools
- Cost-effective for high-volume usage

## Implementation

The Groq integration is implemented through a modular architecture:

1. **API Route** (`/api/chat/route.ts`) - Main entry point for chat requests
2. **Groq Handler** (`/api/chat/groq-handler.ts`) - Specialized handler for Groq API calls
3. **Environment Management** - Secure handling of API keys and configuration

See the [GROQ-INTEGRATION.md](./GROQ-INTEGRATION.md) document for detailed implementation information.

## Model Selection

Users can specify their preferred model when making API requests:

```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Analyze BTC price action' }],
    model: 'llama-3.1-405b-reasoning' // Optional model selection
  })
})
```

If no model is specified, the system defaults to `mixtral-8x7b-32768` for an optimal balance of speed and capability.

## Tool Integration

All models have access to the same set of tools:

- **Token Price Tool** - Real-time cryptocurrency price data
- **Technical Analysis** - Chart analysis and technical indicators
- **Market Sentiment** - Social and market sentiment analysis
- **Portfolio Analysis** - Allocation recommendations and risk assessment

## Configuration

Configure your Groq API key in the `.env.local` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

## Performance Considerations

- Groq offers significantly lower latency compared to other providers
- Models can handle extended contexts (up to 32k tokens)
- Response streaming ensures a responsive user experience

## Future Extensions

The modular design makes it easy to add support for additional models and providers:

1. Create a new handler for the provider (e.g., `new-provider-handler.ts`)
2. Update the route.ts file to conditionally use the appropriate handler
3. Add necessary environment variables and configuration

## Environment Configuration

Required environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

## User Flow

1. Users can start at `/model-selection` to choose their experience
2. The main application (`/`) provides access to Groq models with token prices
3. The Claude demo (`/claude-demo`) provides the Claude-specific experience

## Error Handling

Both integrations include:

- Graceful fallbacks if API keys are missing
- Error reporting to users
- Logging for debugging

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server with `npm run dev`

## Future Enhancements

Potential improvements:

1. Additional tool integrations for both models
2. Performance optimization for large responses
3. Model-specific UI enhancements based on capabilities
