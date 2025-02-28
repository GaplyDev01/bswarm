# Claude 3.7 Sonnet Integration

This document provides details about the Claude 3.7 Sonnet integration in BlockSwarms.

## Overview

Claude 3.7 Sonnet is now directly integrated into the main chat interface, providing:

- Advanced reasoning capabilities with extended thinking
- Improved token price tool usage
- Transparent reasoning process (visible to users)

## Technical Implementation

### Direct Integration in Chat Route

Claude 3.7 Sonnet is now directly available in the main chat interface using the Anthropic AI SDK:

1. The model selector has been updated to include Claude 3.7 Sonnet
2. The main chat route (`/api/chat/route.ts`) handles Claude model requests separately
3. A dedicated Claude handler (`/api/chat/claude-handler.ts`) manages Anthropic API interactions

### Extended Thinking

Claude 3.7 Sonnet's implementation includes extended thinking:

```typescript
// Configuration for extended thinking
providerOptions: {
  anthropic: {
    // Enable extended thinking with a generous token budget
    thinking: { type: 'enabled', budgetTokens: 12000 },
  },
},
```

This allows Claude to tackle complex cryptocurrency analysis with detailed reasoning.

### UI Enhancements

The chat component has been enhanced to:

- Display Claude's reasoning process when requested
- Provide a toggle button to show/hide reasoning
- Format Claude's structured responses appropriately

## User Experience

Users can:

1. Select Claude 3.7 Sonnet from the model dropdown
2. Chat naturally using the same interface as other models
3. Optionally view Claude's step-by-step reasoning by toggling the "Show Reasoning" button
4. Request cryptocurrency information using natural language

## Setup Requirements

### Environment Variables

Required environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

### Dependencies

The following dependencies are required:

```json
{
  "@ai-sdk/anthropic": "^1.1.11",
  "ai": "^2.2.37"
}
```

## Token Price Tool Integration

Claude 3.7 Sonnet automatically uses the token price tool to retrieve cryptocurrency data:

1. Users can ask about token prices naturally
2. Claude decides when to use the tool based on context
3. The results are formatted in a user-friendly way

## Troubleshooting

Common issues:

1. **API Key Issues**: Ensure the `ANTHROPIC_API_KEY` is correctly configured
2. **Dependencies**: Make sure all required packages are installed
3. **Rate Limiting**: Be aware of Anthropic's rate limits on API calls

## Future Enhancements

Potential improvements:

- Additional tools for deeper crypto analysis
- Multi-token comparison functionality
- Historical price charting integration
- Sentiment analysis across social media
