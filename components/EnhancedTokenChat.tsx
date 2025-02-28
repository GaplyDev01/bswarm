// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SendHorizontal,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  LineChart,
  DollarSign,
  ArrowUp,
  ArrowDown,
  BarChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Info,
  Twitter,
  MessageSquare,
  Newspaper,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { MessagePart, MessageDetail, ChatMessage } from '@/lib/types';

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume?: number;
  image?: string;
  description?: string;
  circulating_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_date?: string;
  atl?: number;
  atl_date?: string;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  market_cap_change_24h?: number;
  market_cap_rank?: number;
  last_updated?: string;
}

interface EnhancedTokenChatProps {
  tokenData: TokenData | null;
}

export function EnhancedTokenChat({ tokenData }: EnhancedTokenChatProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => nanoid());
  const [isCopied, setIsCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Technical analysis indicators (mock data)
  const [technicalIndicators, setTechnicalIndicators] = useState({
    rsi: { value: 59.73, status: 'neutral' },
    macd: { value: -1.55, status: 'bearish' },
    movingAverages: { status: 'pending', message: 'Coming Soon' },
  });

  // Social sentiment (mock data)
  const [socialSentiment, setSocialSentiment] = useState({
    twitter: { value: 75, status: 'bullish' },
    reddit: { value: 50, status: 'neutral' },
    news: { value: 65, status: 'positive' },
  });

  // Signal strength
  const [signalStrength, setSignalStrength] = useState({
    status: 'bearish',
    value: 35, // 0-100
  });

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

  // Custom interface for enhanced parts with reasoning details
  interface EnhancedMessagePart extends MessagePart {
    details?: MessageDetail[];
  }

  // Format the message content, handling both string content and structured content with parts
  const formatMessageContent = (message: ChatMessage) => {
    // Check if the message has parts (for message with parts property)
    if (
      'content' in message &&
      typeof message.content !== 'string' &&
      Array.isArray(message.content)
    ) {
      return (
        <div>
          {message.content.map((part: EnhancedMessagePart, index: number) => {
            // Handle text parts
            if (part.type === 'text') {
              return (
                <div key={`text-${index}`}>
                  <ReactMarkdown>{part.text || ''}</ReactMarkdown>
                </div>
              );
            }

            // Handle reasoning parts from Claude
            if (part.type === 'reasoning' && showReasoning) {
              // If details property exists, display them
              if (part.details && Array.isArray(part.details)) {
                return (
                  <div key={`reasoning-${index}`} className="mt-2 border-t border-dashed pt-2">
                    <div className="text-sm font-medium mb-1 flex items-center">
                      <Brain className="h-3 w-3 mr-1" />
                      <span>Claude's Reasoning Process</span>
                    </div>
                    <pre className="text-xs bg-black/5 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {part.details
                        .map((detail: MessageDetail, detailIndex: number) =>
                          detail.type === 'text' ? detail.text || '' : '<redacted>'
                        )
                        .join('\n')}
                    </pre>
                  </div>
                );
              }
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
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to TradesXBT - Your Degen Market Analyst. Ask me anything about market conditions, technical analysis, or trading strategies.\nCurrent ${tokenData?.symbol?.toUpperCase() || 'SOL'} price: ${formatCurrency(tokenData?.current_price || 170.93)}`,
      },
    ],
  });

  // Copy conversation to clipboard
  const handleCopyConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'TradesXBT'}: ${msg.content}`)
      .join('\n\n');

    navigator.clipboard.writeText(conversationText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Get price change direction
  const getPriceChangeDirection = () => {
    if (!tokenData) return 'neutral';
    return tokenData.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
  };

  // Style helpers
  const getDirectionColor = (direction: 'positive' | 'negative' | 'neutral') => {
    if (direction === 'positive') return 'text-emerald-400';
    if (direction === 'negative') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish' || sentiment === 'positive') return 'text-emerald-400';
    if (sentiment === 'bearish' || sentiment === 'negative') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getPriceChangeIcon = () => {
    if (!tokenData) return <RefreshCw className="h-4 w-4" />;
    return tokenData.price_change_percentage_24h >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Left Panel - Market Overview */}
      <div className="bg-sapphire-800 rounded-lg border border-emerald-400/10 overflow-hidden">
        <div className="p-4 border-b border-emerald-400/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-emerald-400">Market Overview</h2>
          <LineChart className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-emerald-400/70">
                {tokenData?.symbol?.toUpperCase() || 'SOL'}
              </span>
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-500 text-xs font-semibold rounded">
                BEARISH
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-white">
                {formatCurrency(tokenData?.current_price || 170.93)}
              </span>
              <span
                className={`ml-2 flex items-center text-sm ${getDirectionColor(getPriceChangeDirection())}`}
              >
                {getPriceChangeIcon()}
                {formatPercentage(tokenData?.price_change_percentage_24h || -1.69)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-sapphire-900/50 p-3 rounded-lg">
              <div className="text-xs text-emerald-400/60 mb-1">24h Volume</div>
              <div className="text-lg font-mono font-semibold text-white">
                ${formatNumber(tokenData?.total_volume || 2000000000, 0, 'compact')}
              </div>
            </div>
            <div className="bg-sapphire-900/50 p-3 rounded-lg">
              <div className="text-xs text-emerald-400/60 mb-1">Market Cap</div>
              <div className="text-lg font-mono font-semibold text-white">
                ${formatNumber(tokenData?.market_cap || 84000000000, 0, 'compact')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Panel - Chat Interface */}
      <div className="bg-sapphire-800 rounded-lg border border-emerald-400/10 overflow-hidden md:col-span-1">
        <div className="p-4 border-b border-emerald-400/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-emerald-400">Market Analysis</h2>
          <Bot className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="flex flex-col h-[calc(100%-56px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                  max-w-[85%] p-3 rounded-lg
                  ${
                    message.role === 'user'
                      ? 'bg-emerald-400/10 text-white'
                      : 'bg-sapphire-900/70 border border-emerald-400/10 text-white'
                  }
                `}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.role === 'user' ? (
                      <>
                        <User className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">You</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">TradesXBT</span>
                      </>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none prose-invert">
                    {formatMessageContent(message)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-emerald-400/10">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about market analysis..."
                className="w-full bg-sapphire-900/60 text-white px-4 py-3 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none h-12 overflow-hidden"
                rows={1}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
// @ts-ignore
                    handleSubmit(e as unknown);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 disabled:text-emerald-400/50"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Technical Analysis */}
      <div className="bg-sapphire-800 rounded-lg border border-emerald-400/10 overflow-hidden">
        <div className="p-4 border-b border-emerald-400/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-emerald-400">Technical Analysis</h2>
          <BarChart className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="p-4 space-y-4">
          {/* Signal Strength */}
          <div>
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Signal Strength</h3>
            <div className="flex items-center space-x-2">
              <span className="uppercase font-bold text-red-500">BEARISH</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div>
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Indicators</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">RSI (14)</span>
                <span className="text-sm text-emerald-400">59.73</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">MACD</span>
                <span className="text-sm text-red-500">-1.55</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Moving Averages</span>
                <span className="text-sm text-cyan-400">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Social Sentiment */}
          <div>
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Social Sentiment</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center text-white">
                  <Twitter className="h-3 w-3 mr-1" />
                  Twitter
                </span>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full mr-2 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-emerald-400">Bullish</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center text-white">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reddit
                </span>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full mr-2 overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '50%' }}></div>
                  </div>
                  <span className="text-sm text-yellow-500">Neutral</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center text-white">
                  <Newspaper className="h-3 w-3 mr-1" />
                  News
                </span>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full mr-2 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-emerald-400">Positive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
