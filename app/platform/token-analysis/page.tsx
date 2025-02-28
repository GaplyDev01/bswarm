'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Bot, LineChart, BarChart3, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { TokenSearch } from '@/components/TokenSearch';
import BackNavigation from '@/components/BackNavigation';
import { EnhancedTokenChat } from '@/components/EnhancedTokenChat';

// Mock token data
const mockTokenData = {
  id: 'jupiter',
  name: 'Jupiter',
  symbol: 'JUP',
  current_price: 0.78,
  market_cap: 1054372819,
  price_change_percentage_24h: 5.2,
  price_change_percentage_7d: 9.7,
  price_change_percentage_30d: -12.4,
  volume_24h: 98745321,
  circulating_supply: 1350479168,
  description:
    'Jupiter is the leading on-chain DEX aggregator in the Solana ecosystem, providing the best swap execution for traders. JUP is the governance token of the Jupiter protocol.',
  recent_news: [
    { date: '2024-02-15', title: 'Jupiter DEX launches new staking program for JUP token holders' },
    { date: '2024-02-10', title: 'JUP token sees 15% price increase amid broader market recovery' },
  ],
  sentiment: 'Bullish',
};

// Interface for token data
interface TokenData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  volume_24h: number;
  circulating_supply: number;
  description?: string;
  recent_news?: { date: string; title: string }[];
  sentiment?: string;
}

export default function TokenAnalysisPage() {
  const searchParams = useSearchParams();
  const tokenSymbol = searchParams.get('token');

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);

  // Set the token data when the page loads with a token param
  useEffect(() => {
    if (tokenSymbol) {
      // In a real app, this would fetch from an API
      setLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        setSelectedToken(mockTokenData);
        setLoading(false);
      }, 1000);
    }
  }, [tokenSymbol]);

  // Handle token selection from search
  const handleSelectToken = (token: Event) => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setSelectedToken(mockTokenData);
      setLoading(false);
    }, 1000);
  };

  // Function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  return (
    <div className="min-h-screen bg-sapphire-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <BackNavigation backTo="/platform/dashboard" label="Back to Dashboard" />

        {/* Token search */}
        <div className="mb-8">
          <h1 className="text-3xl font-cyber text-emerald-400 mb-4">Token Analysis</h1>
          <div className="max-w-xl">
            <TokenSearch onSelectToken={handleSelectToken} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
              <p className="text-emerald-400/70">Loading token data...</p>
            </div>
          </div>
        ) : selectedToken ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Token info */}
            <div className="lg:col-span-1">
              <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden">
                {/* Token header */}
                <div className="bg-sapphire-800/70 px-6 py-5 border-b border-emerald-400/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-400/10 p-3 rounded-full border border-emerald-400/30 flex items-center justify-center">
                      <span className="text-emerald-400 text-xl">
                        {selectedToken.symbol.substring(0, 3)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-cyber text-emerald-400">{selectedToken.name}</h2>
                      <p className="text-emerald-400/70">{selectedToken.symbol}</p>
                    </div>
                  </div>
                </div>

                {/* Price info */}
                <div className="p-6 border-b border-emerald-400/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm uppercase text-emerald-400/50 font-cyber">
                      Current Price
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedToken.price_change_percentage_24h > 0
                          ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                          : 'bg-red-400/10 text-red-400 border border-red-400/30'
                      }`}
                    >
                      {selectedToken.price_change_percentage_24h > 0 ? '+' : ''}
                      {selectedToken.price_change_percentage_24h.toFixed(1)}% (24h)
                    </span>
                  </div>
                  <p className="text-3xl font-cyber text-emerald-400">
                    ${selectedToken.current_price.toFixed(selectedToken.current_price < 1 ? 5 : 2)}
                  </p>
                </div>

                {/* Market stats */}
                <div className="p-6 border-b border-emerald-400/10">
                  <h3 className="text-sm uppercase text-emerald-400/50 mb-4 font-cyber">
                    Market Stats
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">Market Cap</span>
                      <span className="text-emerald-400">
                        {formatNumber(selectedToken.market_cap)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">24h Volume</span>
                      <span className="text-emerald-400">
                        {formatNumber(selectedToken.volume_24h)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">Circulating Supply</span>
                      <span className="text-emerald-400">
                        {selectedToken.circulating_supply.toLocaleString()} {selectedToken.symbol}
                      </span>
                    </div>

                    {selectedToken.price_change_percentage_7d && (
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">7d Change</span>
                        <span
                          className={
                            selectedToken.price_change_percentage_7d > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {selectedToken.price_change_percentage_7d > 0 ? '+' : ''}
                          {selectedToken.price_change_percentage_7d.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {selectedToken.price_change_percentage_30d && (
                      <div className="flex justify-between">
                        <span className="text-emerald-400/70">30d Change</span>
                        <span
                          className={
                            selectedToken.price_change_percentage_30d > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {selectedToken.price_change_percentage_30d > 0 ? '+' : ''}
                          {selectedToken.price_change_percentage_30d.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sentiment & Description */}
                {(selectedToken.sentiment || selectedToken.description) && (
                  <div className="p-6">
                    {selectedToken.sentiment && (
                      <div className="mb-6">
                        <h3 className="text-sm uppercase text-emerald-400/50 mb-2 font-cyber">
                          Sentiment
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${
                              selectedToken.sentiment === 'Bullish'
                                ? 'bg-green-400/10'
                                : selectedToken.sentiment === 'Bearish'
                                  ? 'bg-red-400/10'
                                  : 'bg-yellow-400/10'
                            }`}
                          >
                            {selectedToken.sentiment === 'Bullish' ? (
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            ) : selectedToken.sentiment === 'Bearish' ? (
                              <TrendingUp className="w-5 h-5 text-red-400 transform rotate-180" />
                            ) : (
                              <BarChart3 className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <span
                            className={
                              selectedToken.sentiment === 'Bullish'
                                ? 'text-green-400'
                                : selectedToken.sentiment === 'Bearish'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                            }
                          >
                            {selectedToken.sentiment}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedToken.description && (
                      <div>
                        <h3 className="text-sm uppercase text-emerald-400/50 mb-2 font-cyber">
                          About {selectedToken.name}
                        </h3>
                        <p className="text-emerald-400/80 text-sm">{selectedToken.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent News */}
              {selectedToken.recent_news && selectedToken.recent_news.length > 0 && (
                <div className="mt-6 bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-emerald-400/20">
                    <h3 className="flex items-center gap-2 text-lg font-cyber text-emerald-400">
                      <Clock className="w-4 h-4" />
                      Recent News
                    </h3>
                  </div>
                  <div className="divide-y divide-emerald-400/10">
                    {selectedToken.recent_news.map((news, index) => (
                      <div key={index} className="p-4">
                        <p className="text-emerald-400/80 mb-1">{news.title}</p>
                        <p className="text-emerald-400/50 text-xs">{news.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Token chat */}
            <div className="lg:col-span-2">
              <EnhancedTokenChat tokenData={selectedToken} />
            </div>
          </div>
        ) : (
          <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg p-8 text-center">
            <div className="mb-4 flex justify-center">
              <Search className="w-12 h-12 text-emerald-400/40" />
            </div>
            <h2 className="text-2xl font-cyber text-emerald-400 mb-2">No Token Selected</h2>
            <p className="text-emerald-400/70 mb-6 max-w-md mx-auto">
              Search for a token above or select from trending tokens to get detailed analysis and
              insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
