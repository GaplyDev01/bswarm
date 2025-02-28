'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SendHorizontal,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Clipboard,
  Check,
  Zap,
  Brain,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';

import { TokenData, MessagePart, ChatMessage } from '@/lib/types';

interface TokenChatProps {
  tokenData: TokenData | null;
}

export function TokenChat({ tokenData }: TokenChatProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => nanoid());
  const [isCopied, setIsCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Helper to get a user ID
  const getUserId = () => {
    // Check if we have a userId in localStorage
    let userId = localStorage.getItem('txbt_user_id');
    if (!userId) {
      // Generate a new userId
      userId = `user_${nanoid()}`;
      localStorage.setItem('txbt_user_id', userId);
    }
    return userId;
  };

  // Format the message content, handling both string content and structured content with parts
  const formatMessageContent = React.useMemo(() => {
    return (message: ChatMessage) => {
      // Check if the message has content as an array (structured content)
      if (
        'content' in message &&
        typeof message.content !== 'string' &&
        Array.isArray(message.content)
      ) {
        return (
          <div>
            {message.content.map((part: MessagePart, index: number) => {
              // Handle text parts
              if (part.type === 'text') {
                return (
                  <div key={`text-${index}`}>
                    <ReactMarkdown>{part.text || ''}</ReactMarkdown>
                  </div>
                );
              }

              // Handle reasoning parts from Claude
              if (part.type === 'reasoning' && showReasoning && part.details) {
                return (
                  <div key={`reasoning-${index}`} className="mt-2 border-t border-dashed pt-2">
                    <div className="text-sm font-medium mb-1 flex items-center">
                      <Brain className="h-3 w-3 mr-1" />
                      <span>Claude's Reasoning Process</span>
                    </div>
                    <pre className="text-xs bg-black/5 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {part.details
                        .map(detail => (detail.type === 'text' ? detail.text || '' : '<redacted>'))
                        .join('\n')}
                    </pre>
                  </div>
                );
              }

              return null;
            })}
          </div>
        );
      }

      // Handle regular text content
      return (
        <ReactMarkdown>{typeof message.content === 'string' ? message.content : ''}</ReactMarkdown>
      );
    };
  }, [showReasoning]);

  // Use Vercel AI SDK for chat
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    id: chatId,
    body: {
      model: 'llama-3.1-405b-reasoning',
      tokenData,
      userId: getUserId(),
      traderMode: true,
    },
    onResponse: response => {
      // Scroll to the bottom when we get a response
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Store timeout ID for cleanup
      activeTimeouts.current.push(timeoutId);
    },
  });

  // Focus input when token changes
  useEffect(() => {
    if (tokenData && inputRef.current) {
      inputRef.current.focus();
    }
  }, [tokenData]);

  // Auto scroll when messages update
  useEffect(() => {
    if (messages.length > 0) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      return () => clearTimeout(scrollTimeout);
    }
  }, [messages.length]);

  // Handle copying content
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);

    const copyTimeout = setTimeout(() => setIsCopied(false), 2000);
    // Keep track of active timeout for cleanup
    activeTimeouts.current.push(copyTimeout);
  };

  // Track active timeouts for proper cleanup
  const activeTimeouts = useRef<unknown[]>([]);

  useEffect(() => {
    // Cleanup function for all timeouts
    return () => {
      activeTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {tokenData ? (
        <>
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Chat about {tokenData.name}</span>
              <span className="text-sm text-gray-500">
                ${tokenData.current_price.toLocaleString()}
              </span>
              <span
                className={`text-sm ${tokenData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {tokenData.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                {Math.abs(tokenData.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
            <div className="mb-4 py-1 px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded text-xs flex items-center">
              <Zap className="h-3 w-3 mr-1 text-yellow-300" />
              Using LLaMA 3.1 405b Reasoning with Solana trading capabilities
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>
                  Ask anything about {tokenData.name} ({tokenData.symbol.toUpperCase()})
                </p>
                <p className="text-sm mt-2">
                  Example: "What are key resistance levels?" or "Summarize recent news"
                </p>
              </div>
            ) : (
              messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg p-4 max-w-[85%] ${
                      m.role === 'user'
                        ? 'bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-gray-100'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {m.role === 'user' ? (
                        <User className="h-4 w-4 mr-1" />
                      ) : (
                        <Bot className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs font-semibold">
                        {m.role === 'user' ? 'You' : 'AI'}
                      </span>
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(m.content)}
                          className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Clipboard className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-sm prose-p:my-1 prose-headings:my-2">
                      {formatMessageContent(m)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />

            {/* Display error if there is one */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {error.message || 'Something went wrong. Please try again.'}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t bg-white dark:bg-gray-800">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask about ${tokenData.name}...`}
                rows={1}
                className="w-full pl-4 pr-12 py-3 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                style={{
                  minHeight: '60px',
                  maxHeight: '200px',
                  height: 'auto',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white p-1.5 rounded-full transition
                  ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : input.trim()
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Zap className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Select a token to start chatting</h3>
          <p className="text-gray-500 max-w-md">
            Choose a cryptocurrency token from the table to get detailed AI insights and ask
            questions about that specific asset.
          </p>
        </div>
      )}

      <button
        onClick={() => setShowReasoning(!showReasoning)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground absolute top-4 right-4"
      >
        <Brain className="h-4 w-4" />
        {showReasoning ? 'Hide Reasoning' : 'Show Reasoning'}
      </button>
    </div>
  );
}
