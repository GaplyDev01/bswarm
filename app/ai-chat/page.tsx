'use client';

import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useChat, type Message } from 'ai/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Send,
  ArrowDown,
  Bot,
  User,
  Wallet as WalletIcon,
  Settings,
  Info,
  ChevronLeft,
  Home,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { logger } from '@/lib/logger';

// UI components
import { CryptoCard } from '@/components/ui/crypto-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModelSelector from '@/components/ModelSelector';
import PageNavigation from '@/components/PageNavigation';
import TradesXBTAvatar from '@/components/dashboard/TradesXBTAvatar';
import { TradesXBTMessage } from '@/components/dashboard/TradesXBTMessage';

// App logic
import { getRandomTraderStatus } from '@/lib/tradesxbt-prompt';
import { useWalletContext } from '@/context/WalletContext';

// Import custom styles
import './ai-chat.css';

// Dynamically import wallet components with SSR disabled
const EnhancedConnectWalletButton = dynamic(
  () => import('@/components/wallet/WalletComponents').then(mod => mod.EnhancedConnectWalletButton),
  { ssr: false }
);

export default function AIChat() {
  // Use the wallet context hook
  const { isConnected, walletAddress, isConnecting } = useWalletContext();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const _router = useRouter();
  const searchParams = useSearchParams();

  // Check for token data in URL parameters
  const tokenSymbol = searchParams.get('token');
  const tokenName = searchParams.get('name');
  const tokenPrice = searchParams.get('price');
  const tokenMarketCap = searchParams.get('market_cap');
  const tokenChange24h = searchParams.get('change_24h');

  // Default to LLaMA model
  const [model, setModel] = useState('llama-3.1-405b-reasoning');
  const [showSettings, setShowSettings] = useState(false);
  const [traderStatus, setTraderStatus] = useState('trading from bed, watching charts on my phone');
  const [sessionId] = useState(() => nanoid());
  const [chatId] = useState(() => nanoid());

  // Store token data if provided in URL
  const [tokenData, setTokenData] = useState<unknown>(null);

  // Process token data from URL parameters
  useEffect(() => {
    if (tokenSymbol && tokenName && tokenPrice) {
      setTokenData({
        symbol: tokenSymbol,
        name: tokenName,
        price: parseFloat(tokenPrice),
        market_cap: tokenMarketCap ? parseFloat(tokenMarketCap) : undefined,
        change_24h: tokenChange24h ? parseFloat(tokenChange24h) : undefined,
      });

      // Generate suggested questions based on the token
      const questions = [
        `What's your outlook for ${tokenSymbol.toUpperCase()}?`,
        `Give me a technical analysis for ${tokenSymbol.toUpperCase()}`,
        `What are key support/resistance levels for ${tokenSymbol.toUpperCase()}?`,
        `How is ${tokenName} performing compared to other Solana tokens?`,
        `Any trading strategy for ${tokenSymbol.toUpperCase()} right now?`,
        `What's the social sentiment for ${tokenName}?`,
      ];

      setSuggestedQuestions(questions);
    }
  }, [tokenSymbol, tokenName, tokenPrice, tokenMarketCap, tokenChange24h]);

  // Helper function to get or create user ID from localStorage
  const _getUserId = () => {
    // Check localStorage for existing ID
    let userId = localStorage.getItem('txbt_user_id');
    if (!userId) {
      // Generate new ID if none exists
      userId = `user_${nanoid()}`;
      localStorage.setItem('txbt_user_id', userId);
    }
    return userId;
  };

  // Toggle settings panel
  const _toggleSettings = () => setShowSettings(!showSettings);

  // Set a random trader status only on the client side after hydration
  useEffect(() => {
    setTraderStatus(getRandomTraderStatus());
  }, []);

  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What's the current outlook for SOL?",
    "Tell me about JUP token's performance",
    'BONK going to pump or what?',
    'What support/resistance levels you watching for SOL?',
    "How's your solana defi portfolio doing?",
    'Any new projects with potential you looking at?',
    'What memecoin plays look interesting right now?',
    'You still bullish on the Solana ecosystem?',
    'Any thoughts on NFT market on Solana?',
    "What's your strategy for meme season?",
    'Which DEXs on Solana you using the most?',
    'Thoughts on $PYTH? Worth a bag?',
    'Jupiter vs Orca, which one you prefer?',
    'You think alt season is starting soon?',
    "What's your biggest bag right now?",
  ]);

  // Initialize the chat with the Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
    stop,
  } = useChat({
    api: '/api/chat',
    id: sessionId,
    body: {
      model,
      userId: _getUserId(), // This would normally come from auth
      traderMode: true,
      tokenData, // Pass token data to the API if provided
    },
    onError: error => {
      logger.error('Chat error:', error);
    },
    onFinish: message => {
      logger.log('Chat message finished:', message);
    },
    experimental_onToolCall: undefined, // Let the server handle all tool calls
  });

  // Add debugging for messages
  useEffect(() => {
    logger.log('Current messages:', messages);
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const _scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle asking a suggested question
  const _handleSuggestedQuestion = (question: string) => {
    const _formEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    handleInputChange({
      target: { value: question },
    } as React.ChangeEvent<HTMLInputElement>);

    // Use setTimeout to ensure the input value is updated before submission
    setTimeout(() => {
      handleSubmit(formEvent);
    }, 100);
  };

  // Debugging wallet _state
  useEffect(() => {
    logger.log('AIChat: Component mounted');

    return () => {
      logger.log('AIChat: Component unmounting');
    };
  }, []);

  useEffect(() => {
    logger.log('AIChat: Wallet context state -', { isConnected, walletAddress, isConnecting });
  }, [isConnected, walletAddress, isConnecting]);

  // Generate and periodically update suggested questions
  useEffect(() => {
    const generateQuestions = () => {
      const _baseQuestions = [
        "What's your take on SOL price action?",
        "Any alpha on JUP you're watching?",
        'BONK going to pump or what?',
        'What support/resistance levels you watching for SOL?',
        "How's your solana defi portfolio doing?",
        'Any new projects with potential you looking at?',
        'What memecoin plays look interesting right now?',
        'You still bullish on the Solana ecosystem?',
        'Any thoughts on NFT market on Solana?',
        "What's your strategy for meme season?",
        'Which DEXs on Solana you using the most?',
        'Thoughts on $PYTH? Worth a bag?',
        'Jupiter vs Orca, which one you prefer?',
        'You think alt season is starting soon?',
        "What's your biggest bag right now?",
      ];

      // Shuffle and take 6 questions
      const _shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());
      setSuggestedQuestions(shuffled.slice(0, 6));
    };

    // Generate questions initially and then every 2 hours
    generateQuestions();
    const interval = setInterval(generateQuestions, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Update trader status periodically
  useEffect(() => {
    // Generate a new status initially and then every 3-5 minutes
    const _updateTraderStatus = () => {
      setTraderStatus(getRandomTraderStatus());
    };

    const _randomInterval = Math.floor(Math.random() * (5 - 3 + 1) + 3) * 60 * 1000;
    const interval = setInterval(updateTraderStatus, randomInterval);

    return () => clearInterval(interval);
  }, []);

  // State for UI elements
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How do I analyze SOL price action?',
    'Can you explain what liquidity means in crypto?',
    'What trading strategy works for volatile memecoins?',
  ]);

  // Handle user message submission
  const _handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || isLoading) return;

    setIsSubmitting(true);
    logger.log('Submitting message:', question);

    try {
      // We'll pass the question as is - we've modified the backend to detect and handle natural language
      // patterns that should trigger tool usage
      let userContent = question;

      // But we'll still support explicit JSON for advanced users who want direct control
      const _jsonPattern = /{.*}/;
      const jsonMatch = question.match(jsonPattern);

      if (jsonMatch) {
        logger.log('Detected potential JSON in message:', jsonMatch[0]);

        try {
          // Try to parse the JSON
          const jsonData = JSON.parse(jsonMatch[0]);
          logger.log('Valid JSON detected:', jsonData);

          if (jsonData.symbol) {
            // For JSON requests, we'll remove the JSON and add a human-like query
            // so the conversation feels more natural but still triggers tools
            userContent = question.replace(jsonMatch[0], '').trim();

            const symbol = jsonData.symbol.toUpperCase();

            if (userContent === '') {
              // If there's no text besides the JSON, add a natural language question
              if (jsonData.metrics) {
                userContent = `What do the on-chain metrics show for ${symbol}?`;
              } else if (jsonData.sentiment || jsonData.social) {
                userContent = `What's the market sentiment for ${symbol} right now?`;
              } else if (jsonData.signals || jsonData.trading) {
                userContent = `What are the trading signals for ${symbol}?`;
              } else if (jsonData.technical || jsonData.indicators || jsonData.timeframe) {
                userContent = `How's ${symbol} looking technically?`;
              } else {
                userContent = `How's ${symbol} performing?`;
              }
            }

            logger.log(`Transformed JSON request to natural query: "${userContent}"`);
          }
        } catch (error) {
          logger.error('JSON parsing failed, treating as regular message');
        }
      }

      // Use the Vercel AI SDK to send the message
      const _result = await append({
        role: 'user',
        content: userContent,
      });

      logger.log('Message submitted successfully:', result);

      // Clear the input after sending
      setQuestion('');
    } catch (error) {
      logger.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation controls */}
        <PageNavigation />
        <CryptoCard className="mb-6" variant="neon">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-4">
                <TradesXBTAvatar size="lg" />
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-medium text-emerald-400">TradesXBT</h2>
                  <div className="ml-3 bg-emerald-400/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-400/20">
                    <span className="flex items-center">
                      <Zap size={12} className="mr-1" />
                      DEGEN TRADER
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-1 italic">&ldquo;{traderStatus}&rdquo;</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="mb-2 bg-black/20 border-emerald-400/20 hover:bg-emerald-900/20 hover:border-emerald-400/40"
              >
                <Settings size={14} className="mr-2 text-emerald-400" />
                <span className="text-emerald-400">AI Settings</span>
              </Button>

              {showSettings && (
                <div className="bg-card border border-border rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    AI Chat Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Model</p>
                      <p className="text-sm">Using LLaMA 3.1 405b Reasoning model</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Trader status</label>
                      </div>
                      <Input
                        value={traderStatus}
                        onChange={e => setTraderStatus(e.target.value)}
                        placeholder="e.g., watching charts on mobile"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Adds personality to the AI responses
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                        Close Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">Using LLaMA 3.1 405b Reasoning model</div>
            </div>
          </div>

          {/* Show API error messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <div className="flex">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error connecting to AI</p>
                  <p className="text-xs mt-1">{error.message}</p>
                </div>
              </div>
            </div>
          )}
        </CryptoCard>

        {!isConnected ? (
          <CryptoCard variant="glass" className="text-center py-16">
            <div className="max-w-md mx-auto">
              {tokenData ? (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-900/20 to-emerald-900/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-emerald-400/20">
                    <span className="text-2xl font-bold text-emerald-400">
                      {tokenData.symbol.toUpperCase().slice(0, 1)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-medium mb-2">Chat About {tokenData.name}</h2>
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <span className="text-lg font-medium">${tokenData.price.toLocaleString()}</span>
                    {tokenData.change_24h && (
                      <span
                        className={`text-sm px-2 py-0.5 rounded ${tokenData.change_24h >= 0 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}
                      >
                        {tokenData.change_24h >= 0 ? '↑' : '↓'}{' '}
                        {Math.abs(tokenData.change_24h).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-6">
                    Connect your wallet to chat with TradesXBT about {tokenData.name} and get
                    personalized trading insights.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-900/20 to-emerald-900/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-emerald-400/20">
                    <WalletIcon size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-medium mb-2">Connect Your Wallet</h2>
                  <p className="text-gray-400 mb-6">
                    Connect your Solana wallet to chat with TradesXBT and get personalized degen
                    trading insights.
                  </p>
                </div>
              )}
              <EnhancedConnectWalletButton />
            </div>
          </CryptoCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CryptoCard className="mb-6 min-h-[calc(100vh-240px)] flex flex-col">
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-340px)] mb-4 chat-messages">
                  <div className="space-y-6 p-2">
                    {messages.map((message: Message) =>
                      message.role === 'assistant' ? (
                        <TradesXBTMessage
                          key={message.id}
                          content={message.content}
                          timestamp={new Date()}
                          toolCalls={
                            Array.isArray(message.tool_calls) ? message.tool_calls : undefined
                          }
                        />
                      ) : (
                        <div key={message.id} className="flex justify-end">
                          <div className="flex max-w-[80%] ml-12">
                            <div className="rounded-lg px-4 py-3 user-message order-1">
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>

                            <div className="rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1 ml-2 bg-purple-900/50 order-2">
                              <User size={16} className="text-purple-300" />
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {isLoading && (
                      <div className="flex items-start mb-4">
                        <div className="mr-3 flex-shrink-0 mt-1">
                          <TradesXBTAvatar size="sm" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="trader-handle text-sm font-medium">TradesXBT</span>
                            <span className="text-xs text-gray-400 ml-2">typing...</span>
                          </div>

                          <div className="agent-message rounded-lg p-3 trader-style">
                            <div className="message-typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form
                  onSubmit={handleMessageSubmit}
                  className="flex space-x-2 mt-auto chat-input-container"
                >
                  <Input
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder={
                      tokenData
                        ? `Ask TradesXBT about ${tokenData.name} (${tokenData.symbol.toUpperCase()})...`
                        : 'Ask TradesXBT about Solana tokens, trading strategies, or market trends...'
                    }
                    className="chat-input flex-1"
                    disabled={isLoading}
                  />
                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stop}
                      variant="outline"
                      className="bg-red-900/20 hover:bg-red-900/30 border-red-500/30 text-red-400"
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!question.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black"
                    >
                      <Send size={16} className="mr-2" />
                      Send
                    </Button>
                  )}
                </form>
              </CryptoCard>
            </div>

            <div className="hidden md:block">
              <CryptoCard variant="glass" className="sticky top-4">
                <h3 className="text-lg font-medium mb-4 text-emerald-400">Ask TradesXBT</h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left suggested-question"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      <ArrowDown size={14} className="mr-2 text-emerald-400" />
                      {question}
                    </Button>
                  ))}
                </div>
                <div className="mt-6 p-3 border border-emerald-400/10 rounded-lg bg-black/30">
                  <h4 className="text-sm font-medium mb-2 text-emerald-400 flex items-center">
                    <Info size={14} className="mr-2" />
                    TradesXBT Insights
                  </h4>
                  <p className="text-xs text-gray-400">
                    TradesXBT is a Solana degen trader known for calling $JITO and $PYTH early. Ask
                    about trading strategies, Solana ecosystem projects, or market trends for
                    authentic insights.
                  </p>
                </div>
              </CryptoCard>
            </div>
          </div>
        )}
      </div>
      <div className="text-center mt-6 text-xs text-gray-500">
        <p>Disclaimer: AI is experimental and may produce inaccurate outputs.</p>
        <p>Do not rely on this for financial, legal, or medical advice.</p>
        <p>By using this feature, you agree to our &ldquo;Terms of Service&rdquo;.</p>
      </div>
    </div>
  );
}
