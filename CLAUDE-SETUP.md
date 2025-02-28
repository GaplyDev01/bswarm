# Claude 3.7 Sonnet Integration

This document provides instructions for integrating Claude 3.7 Sonnet into the BlockSwarms chat application.

## Overview

Claude 3.7 Sonnet is now directly integrated into the main chat interface, providing:

- Advanced reasoning capabilities with extended thinking
- Improved token price tool usage
- Transparent reasoning process (visible to users)

## Setup Requirements

### Environment Variables

You need to set up the following environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

You can get an Anthropic API key by signing up at [console.anthropic.com](https://console.anthropic.com/).

### Installation

1. Make sure you have all the required dependencies:

```bash
npm install @ai-sdk/anthropic ai
```

2. Create a `.env.local` file at the project root with your API keys.

## Using Claude 3.7 Sonnet

1. Open the chat interface
2. Select "Claude 3.7 Sonnet (Anthropic)" from the model dropdown
3. Start chatting

### Viewing Claude's Reasoning

Claude 3.7 Sonnet provides insight into its reasoning process:

1. Look for the "Show Reasoning" button in the top-right corner when using Claude
2. Click to toggle the visibility of Claude's reasoning process
3. Claude's step-by-step thought process will be displayed below each message

## Token Price Tool

Claude can retrieve cryptocurrency prices by using the built-in token price tool:

- Ask about a token price (e.g., "What's the current price of Bitcoin?")
- Claude will automatically use the token price tool to fetch real-time data
- Claude will present the price information in a formatted, easy-to-read response

## Troubleshooting

### API Key Issues

If you see a fallback to LLaMA 3.3, check your Anthropic API key:

1. Verify the `ANTHROPIC_API_KEY` is set correctly in your `.env.local` file
2. Ensure the API key is valid and has not expired
3. Check the console logs for specific error messages

### Missing Dependencies

If you encounter module not found errors:

```bash
npm install @ai-sdk/anthropic ai
```

### Rate Limiting

Anthropic has rate limits on its API. If you exceed these limits:

1. Wait for a few minutes before trying again
2. Consider using a different model for high-volume usage

## Advanced Configuration

You can adjust Claude's behavior by modifying:

- The thinking token budget (currently set to 12,000 tokens)
- System prompt customization
- Tool configurations

These settings can be found in `/app/api/chat/route.ts`.

## Further Reading

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Claude 3.7 Sonnet Documentation](https://docs.anthropic.com/claude/docs/claude-3-7-sonnet)
