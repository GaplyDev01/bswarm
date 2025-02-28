// @ts-nocheck
// LLM provider types and configurations for AI Chat
import { OpenAI } from 'openai';
// We'll use a mock implementation for Anthropic instead of the SDK
// import Anthropic from '@anthropic-ai/sdk';
import type { CreateMessage } from 'ai';
import { logger } from '@/lib/logger';

// Define a proper request type for API calls
export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tool_choice?: any;
  tools?: any[];
  signal?: AbortSignal;
  response_format?: { type: string };
  system?: string;
  messages?: any; // Adding messages property to fix type errors
}

// Provider interface for common methods
export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  getClient: () => any;
  // TODO: Replace 'any' with a more specific type
  streamCompletion: (messages: CreateMessage[], options?: LLMRequestOptions) => Promise<Response>;
  models: {
    id: string;
    name: string;
    contextWindow: number;
    description: string;
  }[];
  defaultModel: string;
}

// List of available LLM providers
const providers: LLMProvider[] = [];

// OpenAI provider
export const openaiProvider: LLMProvider = {
  id: 'openai',
  name: 'OpenAI',
  description: "Powered by OpenAI's GPT models",
  icon: '/icons/openai-logo.svg',
  getClient: () => {
    const apiKey = process.env.OPENAI_API_KEY || '';
    logger.log('OpenAI Provider - API Key Format:', {
      length: apiKey.length,
      prefix: apiKey.substring(0, 10) + '...',
      isProjectKey: apiKey.startsWith('sk-proj-'),
    });

    // For project keys, we need to use the baseURL parameter
    const options: Record<string, unknown> = {
      apiKey,
      dangerouslyAllowBrowser: true, // Only for development environments
    };

    // OpenAI project keys require explicit baseURL
    if (apiKey.startsWith('sk-proj-')) {
      options.baseURL = 'https://api.openai.com/v1';
    }

    return new OpenAI(options);
  },
  streamCompletion: async (messages, options = {}) => {
    const client = openaiProvider.getClient();

    // Handle API errors with retry logic
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        // Create request parameters with proper typing
        const requestParams: Record<string, any> = {
          model: options.model || openaiProvider.defaultModel,
          messages,
          stream: true,
          temperature: options.temperature || 0.7,
        };

        // Add optional parameters if supported
        if (options.max_tokens) {
          requestParams.max_tokens = options.max_tokens;
        }

        // Add tool choice if specified
        if (options.tool_choice) {
          requestParams.tool_choice = options.tool_choice;
        }

        // Add tools if specified
        if (options.tools) {
          requestParams.tools = options.tools;
        }

        // Handle response format for structured output if using o1 models
        if (requestParams.model.startsWith('o1') || requestParams.model.startsWith('o3')) {
          requestParams.response_format = { type: 'text' };
        }

        // Pass abort signal if provided
        if (options.signal) {
          requestParams.signal = options.signal;
        }

        const response = await client.chat.completions.create(requestParams);
        return new Response(response.body);
      } catch (error) {
        attempts++;
        logger.warn(`OpenAI API error (attempt ${attempts}):`, error);

        // If we've reached max attempts, rethrow
        if (attempts >= maxAttempts) {
          throw error;
        }

        // Try with a short backoff
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // This shouldn't be reached due to the rethrow above, but just in case
    throw new Error('Failed to complete OpenAI API request after retries');
  },
  models: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      contextWindow: 128000,
      description: 'Most powerful model, great for complex tasks',
    },
    {
      id: 'o3-mini',
      name: 'o3-mini',
      contextWindow: 16000,
      description: 'Efficient, fast model for straightforward tasks',
    },
  ],
  defaultModel: 'gpt-4o',
};

// Anthropic provider
export const anthropicProvider: LLMProvider = {
  id: 'anthropic',
  name: 'Anthropic',
  description: "Powered by Anthropic's Claude models",
  icon: '/icons/anthropic-logo.svg',
  getClient: () => {
    // Simple implementation that mimics the Anthropic SDK
    // You should use the actual Anthropic SDK in production
    return {
      messages: {
        async create(options: LLMRequestOptions) {
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            throw new Error('Anthropic API key is required');
          }

          // Log options for debugging
          logger.log('Anthropic API request options:', {
            model: options.model,
            messageCount: options.messages?.length || 0,
            system: options.system ? 'Present' : 'None',
          });

          try {
            // Create a body for the fetch request
            const body = JSON.stringify({
              model: options.model,
              messages: options.messages,
              system: options.system,
              max_tokens: options.max_tokens,
              stream: options.stream,
              temperature: options.temperature,
            });

            // Make a direct fetch request to the Anthropic API
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body,
              signal: options.signal,
            });

            if (!response.ok) {
              const error = await response.json();

              // Check for credit balance issues
              if (error?.error?.message?.includes('credit balance is too low')) {
                logger.error('Anthropic credit balance too low, cannot use this provider');
                throw new Error('ANTHROPIC_CREDIT_BALANCE_TOO_LOW');
              }

              throw new Error(`Anthropic API error: ${JSON.stringify(error)}`);
            }

            // Return the response with the streaming body
            return { body: response.body };
          } catch (error: unknown) {
            logger.error('Anthropic API error:', error);

            // Check for specific error to handle credit balance issues
            if (error instanceof Error && error.message === 'ANTHROPIC_CREDIT_BALANCE_TOO_LOW') {
              throw new Error(
                'Anthropic API unavailable due to credit balance. Please try another provider.'
              );
            }

            throw error;
          }
        },
      },
    };
  },
  streamCompletion: async (messages, options = {}) => {
    const client = anthropicProvider.getClient();

    // Convert messages format from OpenAI to Anthropic if needed
    // Anthropic expects a specific format for system messages
    const systemMessage = messages.find(msg => msg.role === 'system');
    const userAssistantMessages = messages.filter(msg => msg.role !== 'system');

    // Handle Anthropic API options
    const apiOptions: LLMRequestOptions = {
      model: options.model || anthropicProvider.defaultModel,
      messages: userAssistantMessages as any, // Type assertion to handle messages
      system: systemMessage?.content || '',
      stream: true,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
    };

    // Pass abort signal if provided
    if (options.signal) {
      apiOptions.signal = options.signal;
    }

    const response = await client.messages.create(apiOptions);

    return new Response(response.body);
  },
  models: [
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      contextWindow: 180000,
      description: 'Fast, efficient and reliable model for most use cases',
    },
    {
      id: 'claude-3.7-sonnet',
      name: 'Claude 3.7 Sonnet',
      contextWindow: 200000,
      description: 'Latest Claude 3.7 model with exceptional capabilities',
    },
  ],
  defaultModel: 'claude-3.7-sonnet',
};

// Perplexity provider
export const perplexityProvider: LLMProvider = {
  id: 'perplexity',
  name: 'Perplexity',
  description: "Powered by Perplexity's Sonar models",
  icon: '/icons/perplexity-logo.svg',
  getClient: () => {
    return new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY || '',
      baseURL: 'https://api.perplexity.ai',
    });
  },
  streamCompletion: async (messages, options = {}) => {
    const client = perplexityProvider.getClient();

    // Handle API errors with retry logic
    let attempts = 0;
    const maxAttempts = 2;

    // Ensure messages follow Perplexity's requirements
    // After system messages, user and assistant roles should alternate
    const processMessages = (msgs: CreateMessage[]) => {
      // Filter out any empty messages
      const nonEmptyMessages = msgs.filter(m => m.content && m.content.trim() !== '');

      if (nonEmptyMessages.length === 0) return [];

      const result: CreateMessage[] = [];
      const systemMessages = nonEmptyMessages.filter(m => m.role === 'system');
      const nonSystemMessages = nonEmptyMessages.filter(m => m.role !== 'system');

      // Add all system messages first
      result.push(...systemMessages);

      // If no non-system messages, add a default user message
      if (nonSystemMessages.length === 0) {
        result.push({ role: 'user', content: 'Hello' });
        return result;
      }

      // Make sure the first message after any system messages is a user message
      if (nonSystemMessages[0].role !== 'user') {
        result.push({ role: 'user', content: 'Hello' });
      }

      // Ensure alternating roles
      let lastRole = 'user';
      for (const message of nonSystemMessages) {
        if (message.role === lastRole) {
          // Insert a placeholder message to ensure alternation
          result.push({
            role: lastRole === 'user' ? 'assistant' : 'user',
            content: lastRole === 'user' ? 'I understand.' : 'Please continue.',
          });
          lastRole = lastRole === 'user' ? 'assistant' : 'user';
        }

        result.push(message);
        lastRole = message.role;
      }

      return result;
    };

    const processedMessages = processMessages(messages);

    while (attempts < maxAttempts) {
      try {
        // Create request parameters with proper typing
        const requestParams: Record<string, any> = {
          model: options.model || perplexityProvider.defaultModel,
          messages: processedMessages,
          stream: true,
          temperature: options.temperature || 0.7,
        };

        // Add optional parameters if available
        if (options.max_tokens) {
          requestParams.max_tokens = options.max_tokens;
        }

        // Add response_format for structured output if using Sonar models
        if (requestParams.model.includes('sonar')) {
          requestParams.response_format = { type: 'text' };
        }

        // Pass abort signal if provided
        if (options.signal) {
          requestParams.signal = options.signal;
        }

        const response = await client.chat.completions.create(requestParams);
        return new Response(response.body);
      } catch (error) {
        attempts++;
        logger.warn(`Perplexity API error (attempt ${attempts}):`, error);

        // If we've reached max attempts, rethrow
        if (attempts >= maxAttempts) {
          throw error;
        }

        // Try with a short backoff
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // This shouldn't be reached due to the rethrow above, but just in case
    throw new Error('Failed to complete Perplexity API request after retries');
  },
  models: [
    {
      id: 'sonar-small-online',
      name: 'Sonar (Online)',
      contextWindow: 12000,
      description: 'Online search model with real-time information',
    },
    {
      id: 'sonar-pro-online',
      name: 'Sonar Pro (Online)',
      contextWindow: 12000,
      description: 'Enhanced online search with improved capabilities',
    },
  ],
  defaultModel: 'sonar-small-online',
};

// Groq provider
export const groqProvider: LLMProvider = {
  id: 'groq',
  name: 'Groq',
  description: "Powered by Groq's ultra-fast LLaMA models",
  icon: '/icons/groq-logo.svg',
  getClient: () => {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  },
  streamCompletion: async (messages, options = {}) => {
    const client = groqProvider.getClient();

    // Handle API errors with retry logic
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        // Create request parameters with proper typing
        const requestParams: Record<string, any> = {
          model: options.model || groqProvider.defaultModel,
          messages,
          stream: true,
          temperature: options.temperature || 0.7,
        };

        // Add optional parameters if available
        if (options.max_tokens) {
          requestParams.max_tokens = options.max_tokens;
        }

        // Pass abort signal if provided
        if (options.signal) {
          requestParams.signal = options.signal;
        }

        const response = await client.chat.completions.create(requestParams);
        return new Response(response.body);
      } catch (error) {
        attempts++;
        logger.warn(`Groq API error (attempt ${attempts}):`, error);

        // If we've reached max attempts, rethrow
        if (attempts >= maxAttempts) {
          throw error;
        }

        // Try with a short backoff
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // This shouldn't be reached due to the rethrow above, but just in case
    throw new Error('Failed to complete Groq API request after retries');
  },
  models: [
    {
      id: 'llama3-70b-8192-tool-use-preview',
      name: 'LLaMA 3 70B (Tool Use)',
      contextWindow: 8192,
      description: 'Ultra-fast LLaMA model with tool-using capabilities',
    },
  ],
  defaultModel: 'llama3-70b-8192-tool-use-preview',
};

// Add all providers to the list
providers.push(openaiProvider);
providers.push(anthropicProvider);
providers.push(perplexityProvider);
providers.push(groqProvider);

// Get provider by ID
export function getProvider(id: string): LLMProvider {
  logger.log(`Looking for provider: ${id}`);

  // Default to Anthropic if OpenAI is requested but API key is not set
  if (id === 'openai' && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '')) {
    logger.log('OpenAI API key not properly configured. Falling back to Anthropic provider.');
    return anthropicProvider;
  }

  // Try to match the requested provider
  const provider = providers.find(provider => provider.id === id);

  // If no provider is found, fall back to Anthropic as it's most reliable
  if (!provider) {
    logger.log(`Provider '${id}' not found. Falling back to Anthropic.`);
    return anthropicProvider;
  }

  return provider;
}
