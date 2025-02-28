// @ts-nocheck
import { tokenPriceTool } from './tools';
import { TokenPriceResponse } from './tools/token-price';
import { logger } from '@/lib/logger';

/**
 * Handler for Claude's tool calls
 * This maps Claude's tool call format to our tool implementations
 */
export async function handleClaudeToolCall(toolCall: unknown): Promise<any> {
  try {
    logger.log(`Handling Claude tool call:`, toolCall);

// @ts-ignore
    if (!toolCall || !toolCall.name) {
      throw new Error('Invalid tool call format');
    }

// @ts-ignore
    const toolName = toolCall.name;
// @ts-ignore
    const args = toolCall.input || {};

    // Execute the appropriate tool based on the name
    switch (toolName) {
      case 'get_token_price':
        return await tokenPriceTool.execute({ symbol: args.symbol });

      // Add other tools as needed

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    logger.error('Error handling Claude tool call:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format a token price response for display in chat
 */
export function formatTokenPriceResponse(response: TokenPriceResponse): string {
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(response.price);

  const change24hFormatted = `${response.change_24h > 0 ? '+' : ''}${response.change_24h.toFixed(2)}%`;
  const change7dFormatted = `${response.change_7d > 0 ? '+' : ''}${response.change_7d.toFixed(2)}%`;

  const volumeFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(response.volume_24h);

  const marketCapFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(response.market_cap);

  return `
**${response.name} (${response.symbol})**
Price: ${priceFormatted}
24h Change: ${change24hFormatted}
7d Change: ${change7dFormatted}
24h Volume: ${volumeFormatted}
Market Cap: ${marketCapFormatted}
Market Rank: #${response.rank}
Last Updated: ${new Date(response.last_updated).toLocaleString()}
Data Source: ${response.data_source}
${response.error_info ? `\n*Note: ${response.error_info}*` : ''}
  `.trim();
}
