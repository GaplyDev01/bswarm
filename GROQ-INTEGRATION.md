# Groq Integration for BlockSwarms

This document outlines the integration of Groq's LLM APIs into the BlockSwarms platform, providing enhanced chat capabilities with fast, reliable language models.

## Overview

BlockSwarms now uses Groq's API to power its chat functionality. Groq provides high-performance, low-latency access to state-of-the-art language models like Mixtral and LLaMA.

## Available Models

- **mixtral-8x7b-32768** (default): A powerful mixture-of-experts model for general-purpose chat
- **llama-3.1-405b-reasoning**: High-capability reasoning model with 405 billion parameters
- **llama-3.1-8b**: Smaller model, good for quick responses
- **llama-3.1-70b**: Larger model with improved capabilities

## Setup

1. Get your Groq API key from [console.groq.com](https://console.groq.com)
2. Add your API key to `.env.local`:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Implementation Details

The Groq integration is implemented through the following components:

- **groq-handler.ts**: Core handler for Groq API calls, supporting both regular and streaming responses
- **route.ts**: Updated to use the Groq handler for chat processing
- **env.ts**: Environment utilities for safely accessing the Groq API key

## Usage

The chat API supports customizing the model and other parameters:

```typescript
// Example client request
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Tell me about Solana' }],
    userId: 'user123',
    model: 'llama-3.1-70b' // Optional, defaults to 'mixtral-8x7b-32768'
  })
});

// Process streaming response
const reader = response.body.getReader();
// ...handle stream processing
```

## Tool Integration

The Groq models support all existing tools including:

- Token price lookups
- Technical indicators
- Portfolio analysis
- Market sentiment analysis

These tools are automatically available and will be used when relevant in the conversation.

## Performance Considerations

- Groq provides significantly faster response times compared to other providers
- Models can handle 32K token contexts for long conversations
- The `mixtral-8x7b-32768` model provides a good balance of performance and response quality

## Troubleshooting

If you encounter issues with the Groq integration:

1. Verify your API key is correctly set in `.env.local`
2. Check if you have sufficient quota in your Groq account
3. Examine the logs for specific error messages from the Groq API
4. Try switching to a different model (some models may occasionally be at capacity)

## Further Resources

- [Groq API Documentation](https://console.groq.com/docs/quickstart)
- [Groq Model Specifications](https://console.groq.com/docs/models)
