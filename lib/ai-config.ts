import { OpenAI } from 'openai';
import { tokenPriceTool } from './tools';

// Configure available tools
export const availableTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_token_price',
      description: 'Get the current price and market data for a cryptocurrency token',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description:
              'The cryptocurrency symbol to get price information for (e.g., BTC, ETH, SOL)',
          },
        },
        required: ['symbol'],
      },
    },
  },
];

// Create a client configuration for OpenAI or Groq
export const createAIConfig = (apiKey: string, baseURL: string = 'https://api.openai.com/v1') => {
  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  return {
    openai,
    tools: [tokenPriceTool],
  };
};

// Create a client configuration specifically for Groq
export const createGroqConfig = (apiKey: string) => {
  return createAIConfig(apiKey, 'https://api.groq.com/openai/v1');
};
