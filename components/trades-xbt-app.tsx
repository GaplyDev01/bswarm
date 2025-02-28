// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAIChat } from '@/hooks/use-ai-chat';
// Mock data hook to replace useTokenData
import { ArrowUp, ArrowDown, CandlestickChart, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// Using Lucide icons as alternatives
import { Send, Search, X } from 'lucide-react';

export default function TradesXBTApp() {
  // State for selected token and UI panels
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState('SOL');
  const [collapsed, setCollapsed] = useState({
    left: false,
    right: false,
  });

  // State for token search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; name: string; price: Event; change: any }>
  >([]);

  // Mock data for token information
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState({
    symbol: 'SOL',
    name: 'Solana',
    price: 145.82,
    change: 5.2,
    volume: 1523950000,
    marketCap: 65432100000,
  });
  const [technicalData, setTechnicalData] = useState({
    rsi: 62,
    macd: 'bullish',
    ma: 'above',
    sentiment: 'positive',
    signalStrength: 'BULLISH',
    signalValue: 75,
    movingAverages: 'bullish',
    socialSentiment: {
      twitter: { sentiment: 'Positive', value: 75 },
      reddit: { sentiment: 'Neutral', value: 50 },
      discord: { sentiment: 'Bullish', value: 85 },
    },
  });
  const [trendingTokens, setTrendingTokens] = useState([
    { symbol: 'SOL', name: 'Solana', price: 145.82, change: 5.2 },
    { symbol: 'JUP', name: 'Jupiter', price: 0.78, change: 3.5 },
    { symbol: 'BONK', name: 'Bonk', price: 0.00002684, change: -1.8 },
    { symbol: 'PYTH', name: 'Pyth Network', price: 0.397, change: 4.3 },
    { symbol: 'WIF', name: 'Dogwifhat', price: 2.17, change: 8.9 },
  ]);

  const { messages, isTyping, inputMessage, setInputMessage, sendMessage, chatEndRef } = useAIChat({
    selectedToken: tokenData,
    technicalData,
  });

  // Handle toggle section collapse
  const toggleCollapse = (section: 'left' | 'right') => {
    setCollapsed({
      ...collapsed,
      [section]: !collapsed[section],
    });
  };

  // Handle token selection
  const handleTokenSelect = (token: { symbol: string }) => {
    setSelectedTokenSymbol(token.symbol);
    setShowSearchResults(false);
  };

  // Search for tokens
  useEffect(() => {
    if (searchQuery.length < 2) {
// @ts-ignore
      setSearchResults([] as unknown[]);
      setShowSearchResults(false);
      return;
    }

    const filteredTokens = trendingTokens.filter(
      token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

// @ts-ignore
    setSearchResults(filteredTokens);
    setShowSearchResults(filteredTokens.length > 0);
  }, [searchQuery, trendingTokens]);

  return (
    <div className="bg-[#0A0A0D] text-white min-h-screen w-full overflow-hidden backdrop-blur-lg bg-[radial-gradient(ellipse_at_top_right,_rgba(54,197,140,0.15),transparent_70%),radial-gradient(ellipse_at_bottom_left,_rgba(23,49,79,0.2),transparent_70%)]">
      {/* Main Grid Layout */}
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Market Overview Section */}
        <div className={`lg:col-span-3 flex flex-col gap-4`}>
          <div className="flex items-center justify-between rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Market Overview
            </h2>
          </div>

          {/* Token Price Card */}
          {loading ? (
            <div className="rounded-xl bg-[#121417]/80 p-4 backdrop-blur-md border border-[#36C58C]/10 shadow-lg flex justify-center items-center h-20">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-[#36C58C]"></div>
                <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
              </div>
            </div>
          ) : tokenData ? (
            <div className="rounded-xl bg-[#121417]/80 p-4 backdrop-blur-md border border-[#36C58C]/10 shadow-lg transition-all duration-300 hover:bg-[#121417]/90">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-base font-medium">
                      {tokenData.name} ({tokenData.symbol})
                    </h3>
                    <span
                      className={`ml-2 rounded-full ${
                        tokenData.change >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      } px-2 py-0.5 text-xs font-bold`}
                    >
                      {tokenData.change >= 0 ? 'BULLISH' : 'BEARISH'}
                    </span>
                  </div>
                  <div className="flex items-center text-2xl font-bold mt-1">
                    ${tokenData.price.toFixed(tokenData.price < 0.01 ? 6 : 2)}
                    <span
                      className={`ml-2 text-sm font-normal ${
                        tokenData.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {tokenData.change >= 0 ? '▲' : '▼'} {Math.abs(tokenData.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-[#1C2620]/60 p-2 hover:bg-[#1C2620] transition-colors cursor-pointer">
                  <CandlestickChart className="h-4 w-4 text-[#36C58C]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#121417]/80 p-4 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
              <p className="text-center text-red-400">Failed to load token data</p>
            </div>
          )}

          {/* Volume and Market Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
              <div className="text-xs text-gray-400">24h Volume</div>
              <div className="text-lg font-bold">{tokenData?.volume || '-'}</div>
            </div>
            <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
              <div className="text-xs text-gray-400">Market Cap</div>
              <div className="text-lg font-bold">{tokenData?.marketCap || '-'}</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4 mb-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tokens (min. 2 characters)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121417]/60 border border-[#36C58C]/30 text-white"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="absolute w-full mt-2 bg-[#1C2620]/90 border border-[#36C58C]/20 rounded-xl overflow-hidden z-50">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleTokenSelect(result)}
                    className="w-full p-3 text-left hover:bg-[#243830] transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-sm text-gray-400">{result.name}</div>
                    </div>
                    <div className="text-right">
// @ts-ignore
                      <div>${result.price.toFixed(result.price < 0.01 ? 6 : 2)}</div>
                      <div
                        className={`text-sm ${result.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {result.change >= 0 ? '+' : ''}
                        {result.change.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trending tokens */}
          <div className="space-y-2">
            {trendingTokens.length === 0 ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-[#36C58C]"></div>
                  <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
                </div>
              </div>
            ) : (
              trendingTokens.map((token, index) => (
                <button
                  key={index}
                  onClick={() => handleTokenSelect(token)}
                  className={`w-full p-3 rounded-xl border transition-all duration-300
                        ${
                          selectedTokenSymbol === token.symbol
                            ? 'border-[#36C58C] bg-[#36C58C]/10'
                            : 'border-[#36C58C]/10 hover:border-[#36C58C]/30 bg-[#121417]/60'
                        }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{token.symbol}</span>
                    <span
                      className={`flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {token.change >= 0 ? (
                        <ArrowUp className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(token.change).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{token.name}</span>
                    <span>${token.price.toFixed(token.price < 0.01 ? 6 : 2)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Content */}
        <div className={`lg:col-span-6 flex flex-col gap-4`}>
          <div className="flex items-center justify-between rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#36C58C]" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                TradesXBT {tokenData?.symbol && `- ${tokenData.symbol}`}
              </h2>
              {tokenData && (
                <Badge
                  className={`ml-2 ${
                    tokenData.change >= 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tokenData.change >= 0 ? '▲' : '▼'} {Math.abs(tokenData.change).toFixed(2)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 rounded-xl bg-[#121417]/80 backdrop-blur-md border border-[#36C58C]/10 shadow-lg overflow-hidden flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.role === 'user'
                          ? 'bg-[#36C58C]/20 text-white'
                          : 'bg-[#121417]/90 text-gray-200 border border-[#36C58C]/10'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#121417]/90 max-w-[80%] rounded-xl p-3 border border-[#36C58C]/10">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse"></div>
                        <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                        <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 p-3 border-t border-[#36C58C]/10 bg-[#121417]/60">
              <Input
                type="text"
                className="flex-1 bg-[#121417]/60 border border-[#36C58C]/30 text-white"
                placeholder="Ask about market analysis..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(inputMessage)}
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={isTyping || !inputMessage.trim()}
                className="bg-[#36C58C] text-black hover:bg-[#36C58C]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Analysis Section */}
        <div className={`lg:col-span-3 flex flex-col gap-4`}>
          <div className="flex items-center justify-between rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Technical Analysis
            </h2>
          </div>

          {/* Signal Strength */}
          {loading || !technicalData ? (
            <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg h-16 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-[#36C58C]"></div>
                <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Signal Strength</h3>
              <div className="flex items-center justify-between">
                <span
                  className={`text-base font-bold ${
                    technicalData.signalStrength === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {technicalData.signalStrength}
                </span>
                <div className="h-1.5 w-24 rounded-full bg-gray-700/50">
                  <div
                    className={`h-1.5 rounded-full ${
                      technicalData.signalStrength === 'BULLISH' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${technicalData.signalValue}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tabs */}
          <Tabs defaultValue="indicators" className="flex-1">
            <TabsList className="w-full grid grid-cols-3 bg-[#121417]/60">
              <TabsTrigger
                value="indicators"
                className="data-[state=active]:bg-[#36C58C]/10 data-[state=active]:text-[#36C58C]"
              >
                Indicators
              </TabsTrigger>
              <TabsTrigger
                value="sentiment"
                className="data-[state=active]:bg-[#36C58C]/10 data-[state=active]:text-[#36C58C]"
              >
                Sentiment
              </TabsTrigger>
              <TabsTrigger
                value="onchain"
                className="data-[state=active]:bg-[#36C58C]/10 data-[state=active]:text-[#36C58C]"
              >
                On-Chain
              </TabsTrigger>
            </TabsList>

            <TabsContent value="indicators" className="space-y-2 mt-2">
              {loading || !technicalData ? (
                <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg h-36 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-[#36C58C]"></div>
                    <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                    <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">RSI (14)</span>
                        <span
                          className={`text-sm ${technicalData.rsi > 50 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {technicalData.rsi.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MACD</span>
                        <span className="text-sm text-green-400">{technicalData.macd}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Moving Averages</span>
                        <span className="text-sm text-[#36C58C]">
                          {technicalData.movingAverages}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
                    <div className="text-xs text-gray-400 mb-1">Support Levels</div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        ${(tokenData.price * 0.95).toFixed(tokenData.price < 0.01 ? 6 : 2)}
                      </span>
                      <span className="text-xs text-gray-400">Strong</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        ${(tokenData.price * 0.9).toFixed(tokenData.price < 0.01 ? 6 : 2)}
                      </span>
                      <span className="text-xs text-gray-400">Medium</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
                    <div className="text-xs text-gray-400 mb-1">Resistance Levels</div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        ${(tokenData.price * 1.05).toFixed(tokenData.price < 0.01 ? 6 : 2)}
                      </span>
                      <span className="text-xs text-gray-400">Weak</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        ${(tokenData.price * 1.1).toFixed(tokenData.price < 0.01 ? 6 : 2)}
                      </span>
                      <span className="text-xs text-gray-400">Strong</span>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-2 mt-2">
              {loading || !technicalData ? (
                <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg h-36 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-[#36C58C]"></div>
                    <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-150"></div>
                    <div className="h-2 w-2 rounded-full bg-[#36C58C] animate-pulse delay-300"></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
                  <h3 className="mb-2 text-sm font-medium text-gray-300">Social Sentiment</h3>
                  <div className="space-y-3">
                    {Object.entries(technicalData.socialSentiment).map(([platform, data]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{platform}</span>
                        <div className="flex items-center">
                          <div className="mr-2 h-1.5 w-12 rounded-full bg-gray-700/50">
                            <div
                              className={`h-1.5 rounded-full ${
                                data.sentiment === 'Bullish' || data.sentiment === 'Positive'
                                  ? 'bg-green-400'
                                  : data.sentiment === 'Neutral'
                                    ? 'bg-yellow-400'
                                    : 'bg-red-400'
                              }`}
                              style={{ width: `${data.value}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs ${
                              data.sentiment === 'Bullish' || data.sentiment === 'Positive'
                                ? 'text-green-400'
                                : data.sentiment === 'Neutral'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {data.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="onchain" className="space-y-2 mt-2">
              <div className="rounded-xl bg-[#121417]/80 p-3 backdrop-blur-md border border-[#36C58C]/10 shadow-lg">
                <h3 className="mb-2 text-sm font-medium text-gray-300">On-Chain Metrics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Addresses</span>
                    <span className="text-sm text-gray-300">
                      {(Math.floor(Math.random() * 1000) + 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Count</span>
                    <span className="text-sm text-gray-300">
                      {(Math.floor(Math.random() * 10000) + 5000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network Hash Rate</span>
                    <span className="text-sm text-gray-300">
                      {(Math.floor(Math.random() * 100) + 50).toLocaleString()} TH/s
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
