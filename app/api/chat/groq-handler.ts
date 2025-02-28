// @ts-nocheck
/**
 * Groq chat handler for BlockSwarms
 * This file handles Groq LLM integration for the main chat API
 */

import { Message } from 'ai';
import { AIStream, StreamingTextResponse } from 'ai';
import { OpenAI } from 'openai';
import { 
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool 
} from 'openai/resources/chat/completions';

// Fix the import path
import { getGroqApiKey } from '../../../lib/env';
import { handleToolCall } from './tool-handler';

// Import OpenAI types for streaming
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources';
import { logger } from '../../../lib/logger';

/**
 * Process a chat request using Groq models
 * @param messages Chat messages array
 * @param systemPrompt System prompt to use
 * @param userId User ID (optional)
 * @param model Model to use (defaults to Mixtral)
 */
export async function handleGroqChat(
  messages: Message[],
  systemPrompt: string,
  userId: string = 'anonymous',
  model: string = 'mixtral-8x7b-32768',
  tools: unknown[] = []
): Promise<unknown> {
  // Get the Groq API key
  const apiKey = getGroqApiKey();

  // Initialize OpenAI client with Groq endpoint
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  // Add the system message to the beginning if not present
  const completeMessages = messages.some(m => m.role === 'system')
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  logger.log(`Processing Groq chat request for user ${userId} with model ${model}`);

  try {
    // Prepare request parameters
    const openaiMessages: ChatCompletionMessageParam[] = completeMessages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const temperature = 0.7;
    const topP = 1;
    const maxTokens = 4000;

    // Create request parameters for the Groq API
    // Define with proper typing for OpenAI's API
    const requestParams: ChatCompletionCreateParams = {
      model: model,
      messages: openaiMessages,
      stream: false,
      temperature: temperature,
      top_p: topP,
      max_tokens: maxTokens,
    };

    // Add tools if they are provided
    if (tools && tools.length > 0) {
      requestParams.tools = tools as ChatCompletionTool[];
    }

    // Process with OpenAI-compatible API
    const completion = await client.chat.completions.create(requestParams);

    return completion;
  } catch (error) {
    logger.error('Error calling Groq API:', error);
    throw error;
  }
}

/**
 * Process a streaming chat request using Groq models
 */
export async function handleGroqChatStream(
  messages: Message[],
  model = 'llama3-8b-8192',
  tools?: unknown[],
): Promise<ReadableStream> {
  const completeMessages = messages;
  
  // Initialize Groq client with API key
  const groqApiKey = getGroqApiKey();
  if (!groqApiKey) {
    throw new Error('Missing Groq API key');
  }
  
  const client = new OpenAI({
    apiKey: groqApiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    // Prepare request parameters
    const openaiMessages: ChatCompletionMessageParam[] = completeMessages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const temperature = 0.7;
    const topP = 1;
    const maxTokens = 4000;

    // Create request parameters for the Groq API
    // Define with proper typing for OpenAI's API
    const requestParams: ChatCompletionCreateParams = {
      model: model,
      messages: openaiMessages,
      stream: true,
      temperature: temperature,
      top_p: topP,
      max_tokens: maxTokens,
    };
    
    // Add tools if they are provided
    if (tools && tools.length > 0) {
      requestParams.tools = tools as ChatCompletionTool[];
    }

    // Process with OpenAI-compatible API (streaming)
    const stream = await client.chat.completions.create(
      requestParams
    );
    
    // Ensure it's treated as an async iterable for processing
    const streamAsyncIterable = stream as unknown as AsyncIterable<ChatCompletionChunk>;

    // Create a new ReadableStream that adapts the OpenAI streaming format to AI's expected format
    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Handle the incoming chunks from OpenAI stream
        for await (const chunk of streamAsyncIterable) {
          try {
            // Extract the delta content from the chunk
            const content = (chunk.choices[0]?.delta as { content?: string })?.content || '';

            if (content) {
              // Write the content to the stream
              controller.enqueue(encoder.encode(content));
            }

            // Handle possible tool calls
            const toolCalls = (chunk.choices[0]?.delta as { tool_calls?: unknown[] })?.tool_calls;
            if (toolCalls) {
              logger.log('Tool call received:', JSON.stringify(toolCalls, null, 2));

              // Process tool calls (if needed)
              // This would go here if we wanted to intercept tool calls in the stream
            }
          } catch (err) {
            logger.error('Error processing chunk:', err);
          }
        }

        // Close the controller when done
        controller.close();
      },
    });
  } catch (error) {
    logger.error('Error calling Groq streaming API:', error);
    throw error;
  }
}
