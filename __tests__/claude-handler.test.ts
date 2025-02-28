// Mock the required browser APIs
class MockReadableStream {
  constructor() {}
  getReader() {
    return {
      read: jest.fn().mockResolvedValue({ done: true, value: null }),
      releaseLock: jest.fn(),
    };
  }
}

// Create mocks before importing modules
global.ReadableStream = MockReadableStream;
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock the AI package
jest.mock('ai', () => ({
  AIStream: jest.fn().mockImplementation(() => new MockReadableStream()),
}));

import { handleClaudeChat, handleClaudeChatStream } from '../app/api/chat/claude-handler';
import Anthropic from '@anthropic-ai/sdk';
import { AIStream } from 'ai';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockImplementation(async params => {
          return {
            id: 'msg_mock123',
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: 'This is a mock response from Claude',
              },
            ],
            model: params.model,
            usage: {
              input_tokens: 100,
              output_tokens: 50,
            },
          };
        }),
        stream: jest.fn().mockImplementation(() => {
          const mockEmitter = {
            on: jest.fn().mockImplementation((event, callback) => {
              // Simulate content event
              if (event === 'contentBlock') {
                callback({
                  type: 'content_block_start',
                  content_block: { type: 'text' },
                });
                callback({
                  type: 'content_block_delta',
                  delta: { type: 'text_delta', text: 'This is a streamed response' },
                });
                callback({
                  type: 'content_block_stop',
                });
              }

              // Simulate message event
              if (event === 'message') {
                callback({
                  type: 'message_start',
                  message: { id: 'msg_stream123', role: 'assistant', content: [] },
                });
              }

              // Simulate done event
              if (event === 'done') {
                callback({
                  type: 'message_stop',
                });
              }

              return mockEmitter;
            }),
            off: jest.fn(),
            controller: {
              signal: { aborted: false },
            },
          };
          return mockEmitter;
        }),
      },
    })),
  };
});

// Mock the env utility
jest.mock('../lib/env', () => ({
  getAnthropicApiKey: jest.fn().mockReturnValue('mock-api-key'),
}));

describe('Claude Chat Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleClaudeChat', () => {
    it('should process a chat request correctly', async () => {
      const messages = [{ role: 'user', content: 'Hello, who are you?' }];
      const systemPrompt = 'You are an AI assistant specialized in cryptocurrency trading.';

      const result = await handleClaudeChat(
        messages,
        systemPrompt,
        'user123',
        'claude-3-opus-20240229'
      );

      // Verify Anthropic was initialized with the API key
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'mock-api-key',
      });

      // Get the mock implementation of the messages.create method
      const mockAnthropicInstance = (Anthropic as jest.Mock).mock.results[0].value;
      const mockCreate = mockAnthropicInstance.messages.create;

      // Verify the API was called with correct parameters
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-opus-20240229',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Hello, who are you?' },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        })
      );

      // Verify the correct response was returned
      expect(result).toEqual(
        expect.objectContaining({
          id: 'msg_mock123',
          role: 'assistant',
          content: [{ type: 'text', text: 'This is a mock response from Claude' }],
        })
      );
    });

    it('should add tools when provided', async () => {
      const messages = [{ role: 'user', content: 'What is the price of Bitcoin?' }];
      const systemPrompt = 'You are an AI assistant specialized in cryptocurrency trading.';
      const tools = [
        {
          type: 'function',
          function: {
            name: 'get_token_price',
            description: 'Get the price of a token',
            parameters: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Token symbol',
                },
              },
              required: ['symbol'],
            },
          },
        },
      ];

      await handleClaudeChat(messages, systemPrompt, 'user123', 'claude-3-opus-20240229', tools);

      // Get the mock implementation and verify tools were added
      const mockAnthropicInstance = (Anthropic as jest.Mock).mock.results[0].value;
      const mockCreate = mockAnthropicInstance.messages.create;

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: tools,
        })
      );
    });
  });

  describe('handleClaudeChatStream', () => {
    it('should handle streaming chat requests', async () => {
      const messages = [{ role: 'user', content: 'Hello, who are you?' }];
      const systemPrompt = 'You are an AI assistant specialized in cryptocurrency trading.';

      const result = await handleClaudeChatStream(messages, systemPrompt, 'user123');

      // Verify the stream was created
      expect(result).toBeInstanceOf(MockReadableStream);
    });
  });
});
