// @ts-nocheck
/**
 * Claude chat handler for BlockSwarms
 * This file handles Anthropic Claude LLM integration for the main chat API
 */

import { Message } from 'ai';
// @ts-ignore
import { AIStream, _StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Process a chat request using Claude models
 * @param messages Chat messages array
 * @param systemPrompt System prompt to use
 * @param userId User ID (optional)
 * @param model Model to use (defaults to Claude 3 Opus)
 */
export async function handleClaudeChat(
  messages: Message[],
  systemPrompt: string,
  userId: string = 'anonymous',
  model: string = 'claude-3-opus-20240229',
  tools: unknown[] = []
): Promise<unknown> {
  // Get the Anthropic API key
  const apiKey = getAnthropicApiKey();

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: apiKey,
  });

  // Add the system message to the beginning if not present
  const completeMessages = messages.some(m => m.role === 'system')
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  logger.log(`Processing Claude chat request for user ${userId} with model ${model}`);

  try {
    // Prepare request parameters
    const requestParams: Anthropic.MessageCreateParams = {
      model: model,
      messages: completeMessages.map(m => ({
        role: m.role as Anthropic.MessageParam['role'],
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 4000,
    };

    // Add tools if they are provided
    if (tools && tools.length > 0) {
// @ts-ignore
      requestParams.tools = tools;
    }

    // Process with Anthropic API
    const _completion = await client.messages.create(requestParams);

// @ts-ignore
    return completion;
  } catch (error) {
    logger.error('Error calling Anthropic API:', error);
    throw error;
  }
}

/**
 * Process a streaming chat request using Claude models
 */
export async function handleClaudeChatStream(
  messages: Message[],
  systemPrompt: string,
  userId: string = 'anonymous',
  model: string = 'claude-3-opus-20240229',
  tools: unknown[] = []
): Promise<ReadableStream> {
  // Get the Anthropic API key
  const apiKey = getAnthropicApiKey();

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: apiKey,
  });

  // Add the system message to the beginning if not present
  const completeMessages = messages.some(m => m.role === 'system')
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  logger.log(`Processing streaming Claude chat request for user ${userId} with model ${model}`);

  try {
    // Prepare request parameters
    const requestParams: Anthropic.MessageCreateParams = {
      model: model,
      messages: completeMessages.map(m => ({
        role: m.role as Anthropic.MessageParam['role'],
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
    };

    // Add tools if they are provided
    if (tools && tools.length > 0) {
// @ts-ignore
      requestParams.tools = tools;
    }

    // Process with Anthropic streaming API
    const stream = await client.messages.create(requestParams);

    // Return a ReadableStream that adapts the Anthropic streaming format
// @ts-ignore
    return AIStream(stream as unknown);
  } catch (error) {
    logger.error('Error calling Anthropic streaming API:', error);
    throw error;
  }
}
