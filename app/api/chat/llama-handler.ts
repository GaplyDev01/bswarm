/**
 * Llama handler for BlockSwarms
 * This file handles Llama 3.1 integration via Groq's OpenAI compatible API
 */

import { Message } from 'ai';
import { OpenAI } from 'openai';
import { tokenPriceTool } from '@/lib/tools';
import { logger } from '@/lib/logger';

/**
 * Process a chat request using Llama 3.1 via Groq
 */
export async function handleLlamaChat(
  messages: Message[],
  systemPrompt: string,
  userId: string = 'anonymous',
  model: string = 'llama-3.1-70b-versatile'
) {
  // Initialize Groq client using OpenAI compatible API
  const client = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
  });

  // Add the system message to the beginning if not present
  const completeMessages = messages.some(m => m.role === 'system')
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  logger.log(`Processing Llama chat request for user ${userId} with model ${model}`);

  // Process with Llama via Groq's OpenAI compatible API
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: completeMessages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      tools: [tokenPriceTool] as unknown,
    });

    logger.log(`Llama chat completed for user ${userId}`);

    return response;
  } catch (error) {
    logger.error('Error with Llama/Groq API:', error);
    throw error;
  }
}
