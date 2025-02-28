# Multi-Model AI Integration for BlockSwarms

This document explains how different AI models are integrated into the BlockSwarms application.

## Overview

BlockSwarms offers two distinct AI experiences:

1. **Main Trading Chat** - Powered by Llama 3.1 models via Groq's API
2. **Claude Experience** - Dedicated interface for Claude 3.7 Sonnet with extended thinking

## Model Capabilities

### Llama 3.1 Models

The main chat interface leverages Llama 3.1 models through Groq's API:

- `llama-3.1-70b-versatile` - High-performance model with improved reasoning capabilities
- `llama-3.1-405b-reasoning` - Largest open-source model with exceptional reasoning power
- `llama-3.3-70b-versatile` - Fast model with versatile capabilities and tool access

These models offer:
- Fast response times
- Excellent contextual understanding
- Tool usage for token price information

### Claude 3.7 Sonnet

The dedicated Claude interface showcases Anthropic's powerful Claude 3.7 Sonnet model:

- Extended thinking for complex reasoning tasks (12,000 token budget)
- Transparent reasoning process that can be viewed by users
- Advanced capabilities for nuanced cryptocurrency analysis

## Technical Implementation

### Modular Handler Architecture

We use a modular approach with dedicated handlers:

- `claude-handler.ts` - For Claude 3.7 Sonnet requests
- `llama-handler.ts` - For Llama 3.1 models via Groq

The main `/api/chat/route.ts` endpoint routes requests to the appropriate handler based on the selected model.

### AI SDK Integration

Both experiences leverage the Vercel AI SDK:

```typescript
// For Claude
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// For Llama via Groq
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { streamText } from 'ai';
```

### UI Components

1. `TokenChat.tsx` - Main chat interface with model selection
2. `ClaudeChat.tsx` - Dedicated Claude interface with reasoning display

## Environment Configuration

Required environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

## User Flow

1. Users can start at `/model-selection` to choose their experience
2. The main application (`/`) provides access to Llama models with token prices
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
