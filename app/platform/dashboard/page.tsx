// @ts-nocheck
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SearchIcon,
  TrendingUp,
  XCircle,
  Bot,
  Cpu,
  LineChart,
  BarChart,
  PieChart,
  CandlestickChart,
  TrendingDown,
  Info,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { TokenSearch } from '@/components/TokenSearch';

// Mock data for TradesXBT agent profile
const agentProfile = {
  name: 'TradesXBT',
  role: 'Solana Trading Specialist',
  bio: 'TradesXBT is an advanced AI trading agent specializing in Solana token analysis and trading signals. With deep integration of on-chain data, technical analysis, and sentiment tracking, TradesXBT provides precision trading recommendations and market insights.',
  experience: 'Active since January 2024',
  performance: {
    monthly: 18.7,
    yearly: 142.3,
    winRate: 76,
  },
  contractAddress: 'SXBTVgD2Z7QwfJHvNQ3EzhJ9zuqBHjY9fYDGeZn2eHZ',
  tokenomics: {
    supply: '100,000,000 SXBT',
    circulating: '45,500,000 SXBT',
    price: '$0.87',
    marketCap: '$39.59M',
  },
  socialStats: {
    followers: 12843,
    trades: 387,
    signals: 142,
  },
};

// Mock data for recent trades
const recentTrades = [
  {
    id: 1,
    token: 'JUP',
    tokenName: 'Jupiter',
    action: 'BUY',
    entry: '$0.682',
    exit: '$0.791',
    profit: '+16.0%',
    date: '2 days ago',
    status: 'closed',
  },
  {
    id: 2,
    token: 'BONK',
    tokenName: 'Bonk',
    action: 'SELL',
    entry: '$0.00002712',
    exit: '$0.00002541',
    profit: '+6.3%',
    date: '4 days ago',
    status: 'closed',
  },
  {
    id: 3,
    token: 'PYTH',
    tokenName: 'Pyth Network',
    action: 'BUY',
    entry: '$0.381',
    exit: '-',
    profit: '+2.1%',
    date: '1 day ago',
    status: 'open',
  },
  {
    id: 4,
    token: 'HADES',
    tokenName: 'Hades',
    action: 'BUY',
    entry: '$0.0431',
    exit: '$0.0517',
    profit: '+20.0%',
    date: '7 days ago',
    status: 'closed',
  },
];

// Mock data for trending tokens
const trendingTokens = [
  { symbol: 'JUP', name: 'Jupiter', price: '$0.78', change: '+5.2%' },
  { symbol: 'BONK', name: 'Bonk', price: '$0.00002684', change: '-1.8%' },
  { symbol: 'PYTH', name: 'Pyth Network', price: '$0.397', change: '+4.3%' },
  { symbol: 'WIF', name: 'Dogwifhat', price: '$2.17', change: '+8.9%' },
  { symbol: 'RAY', name: 'Raydium', price: '$1.22', change: '+0.7%' },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; name: string; price: string }>
  >([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // Simulate search results (this would normally call an API)
    if (searchQuery.trim()) {
      setShowResults(true);
      // Mock results - in a real app, this would fetch from an API
      setSearchResults([
        { symbol: 'JUP', name: 'Jupiter', price: '$0.78' },
        { symbol: 'JUPUSD', name: 'Jupiter USD', price: '$0.78' },
      ]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-sapphire-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for a token by name or symbol..."
                  className="w-full bg-sapphire-800/50 border border-emerald-400/30 text-emerald-400 py-3 px-4 pr-12 rounded-md placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-emerald-400/70 hover:text-emerald-400"
                  onClick={clearSearch}
                >
                  {searchQuery && <XCircle className="w-5 h-5" />}
                </button>
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400/70 hover:text-emerald-400"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-sapphire-800 border border-emerald-400/30 rounded-md shadow-lg overflow-hidden z-10">
                {searchResults.length > 0 ? (
                  <div>
// @ts-ignore
                    {searchResults.map((result: Response, index: number) => (
                      <Link
                        key={index}
// @ts-ignore
                        href={`/platform/token-analysis?token=${result.symbol}`}
                        className="flex justify-between items-center px-4 py-3 hover:bg-emerald-400/10 border-b border-emerald-400/10 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-400/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
// @ts-ignore
                            {result.symbol.substring(0, 2)}
                          </div>
                          <div>
// @ts-ignore
                            <div className="text-emerald-400">{result.symbol}</div>
// @ts-ignore
                            <div className="text-emerald-400/60 text-sm">{result.name}</div>
                          </div>
                        </div>
// @ts-ignore
                        <div className="text-emerald-400">{result.price}</div>
                      </Link>
                    ))}
                    <div className="px-4 py-2 text-center text-emerald-400/60 text-sm bg-sapphire-900/50">
                      View all results
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-emerald-400/60 text-center">
                    No tokens found. Try a different search.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agent Profile */}
          <div className="lg:col-span-1">
            <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden">
              {/* Agent Header */}
              <div className="bg-sapphire-800/70 px-6 py-5 border-b border-emerald-400/20">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-400/10 p-3 rounded-full border border-emerald-400/30">
                    <Bot className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-cyber text-emerald-400">{agentProfile.name}</h2>
                    <p className="text-emerald-400/70">{agentProfile.role}</p>
                  </div>
                </div>
              </div>

              {/* Agent Bio */}
              <div className="p-6 border-b border-emerald-400/10">
                <h3 className="text-sm uppercase text-emerald-400/50 mb-2 font-cyber">Bio</h3>
                <p className="text-emerald-400/80 mb-3">{agentProfile.bio}</p>
                <p className="text-emerald-400/60 text-sm">{agentProfile.experience}</p>
              </div>

              {/* Performance Metrics */}
              <div className="p-6 border-b border-emerald-400/10">
                <h3 className="text-sm uppercase text-emerald-400/50 mb-3 font-cyber">
                  Performance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-sapphire-900/50 p-3 rounded-md text-center">
                    <p className="text-2xl font-cyber text-emerald-400">
                      +{agentProfile.performance.monthly}%
                    </p>
                    <p className="text-xs text-emerald-400/60">Monthly</p>
                  </div>
                  <div className="bg-sapphire-900/50 p-3 rounded-md text-center">
                    <p className="text-2xl font-cyber text-emerald-400">
                      +{agentProfile.performance.yearly}%
                    </p>
                    <p className="text-xs text-emerald-400/60">YTD</p>
                  </div>
                  <div className="bg-sapphire-900/50 p-3 rounded-md text-center">
                    <p className="text-2xl font-cyber text-emerald-400">
                      {agentProfile.performance.winRate}%
                    </p>
                    <p className="text-xs text-emerald-400/60">Win Rate</p>
                  </div>
                </div>
              </div>

              {/* Token Info */}
              <div className="p-6 border-b border-emerald-400/10">
                <h3 className="text-sm uppercase text-emerald-400/50 mb-3 font-cyber">Token</h3>
                <div className="bg-sapphire-900/30 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-emerald-400/70">Contract</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-sm font-mono">
                        {agentProfile.contractAddress.substring(0, 4)}...
                        {agentProfile.contractAddress.substring(
                          agentProfile.contractAddress.length - 4
                        )}
                      </span>
                      <button className="text-emerald-400/50 hover:text-emerald-400">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-emerald-400/50 text-xs mb-1">Price</p>
                      <p className="text-emerald-400">{agentProfile.tokenomics.price}</p>
                    </div>
                    <div>
                      <p className="text-emerald-400/50 text-xs mb-1">Market Cap</p>
                      <p className="text-emerald-400">{agentProfile.tokenomics.marketCap}</p>
                    </div>
                    <div>
                      <p className="text-emerald-400/50 text-xs mb-1">Total Supply</p>
                      <p className="text-emerald-400">{agentProfile.tokenomics.supply}</p>
                    </div>
                    <div>
                      <p className="text-emerald-400/50 text-xs mb-1">Circulating</p>
                      <p className="text-emerald-400">{agentProfile.tokenomics.circulating}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Stats */}
              <div className="p-6">
                <h3 className="text-sm uppercase text-emerald-400/50 mb-3 font-cyber">Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-cyber text-emerald-400">
                      {agentProfile.socialStats.followers.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-400/60">Followers</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-cyber text-emerald-400">
                      {agentProfile.socialStats.trades}
                    </p>
                    <p className="text-xs text-emerald-400/60">Trades</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-cyber text-emerald-400">
                      {agentProfile.socialStats.signals}
                    </p>
                    <p className="text-xs text-emerald-400/60">Signals</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link
                href="/platform/token-analysis"
                className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg p-4 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <LineChart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-emerald-400 font-cyber">Token Analysis</h3>
                </div>
                <p className="text-emerald-400/60 text-sm">Search and analyze any Solana token</p>
              </Link>

              <Link
                href="/platform/market-analysis"
                className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg p-4 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BarChart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-emerald-400 font-cyber">Market Analysis</h3>
                </div>
                <p className="text-emerald-400/60 text-sm">Overall market sentiment and trends</p>
              </Link>

              <Link
                href="/platform/portfolio"
                className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg p-4 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-emerald-400 font-cyber">Portfolio</h3>
                </div>
                <p className="text-emerald-400/60 text-sm">Track and manage your holdings</p>
              </Link>

              <Link
                href="/platform/invest"
                className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg p-4 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CandlestickChart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-emerald-400 font-cyber">Invest</h3>
                </div>
                <p className="text-emerald-400/60 text-sm">Customize investment strategies</p>
              </Link>
            </div>
          </div>

          {/* Middle & Right Column - Trading Activity */}
          <div className="lg:col-span-2">
            {/* Recent Trading Signals */}
            <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-emerald-400/20 flex justify-between items-center">
                <h2 className="text-xl font-cyber text-emerald-400">Recent Trading Signals</h2>
                <Link
                  href="/platform/token-analysis"
                  className="text-emerald-400/70 hover:text-emerald-400 flex items-center gap-1"
                >
                  <span className="text-sm">View All</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-emerald-400/50 text-sm">
                      <th className="px-2 py-2">Token</th>
                      <th className="px-2 py-2">Action</th>
                      <th className="px-2 py-2">Entry</th>
                      <th className="px-2 py-2">Exit</th>
                      <th className="px-2 py-2">Profit</th>
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map(trade => (
                      <tr key={trade.id} className="border-b border-emerald-400/10 last:border-0">
                        <td className="px-2 py-3">
                          <Link
                            href={`/platform/token-analysis?token=${trade.token}`}
                            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-400/80"
                          >
                            <div className="w-8 h-8 bg-emerald-400/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
                              {trade.token}
                            </div>
                            <div>
                              <div>{trade.token}</div>
                              <div className="text-xs text-emerald-400/60">{trade.tokenName}</div>
                            </div>
                          </Link>
                        </td>
                        <td
                          className={`px-2 py-3 ${trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {trade.action}
                        </td>
                        <td className="px-2 py-3 text-emerald-400/80">{trade.entry}</td>
                        <td className="px-2 py-3 text-emerald-400/80">{trade.exit}</td>
                        <td className="px-2 py-3 text-green-400">{trade.profit}</td>
                        <td className="px-2 py-3 text-emerald-400/60">{trade.date}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              trade.status === 'open'
                                ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                                : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                            }`}
                          >
                            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Stats & Trending Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Trends */}
              <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-emerald-400/20">
                  <h2 className="text-xl font-cyber text-emerald-400">Market Trends</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-400/10 p-2 rounded-full">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-cyber text-emerald-400">Bullish</p>
                        <p className="text-emerald-400/60 text-sm">Overall Sentiment</p>
                      </div>
                    </div>
                    <div className="text-2xl font-cyber text-green-400">+4.8%</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-sapphire-900/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-emerald-400">Layer 1s</span>
                      </div>
                      <span className="text-green-400">+7.2%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-sapphire-900/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-emerald-400">DeFi</span>
                      </div>
                      <span className="text-green-400">+3.4%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-sapphire-900/30">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-emerald-400">Memecoins</span>
                      </div>
                      <span className="text-red-400">-2.1%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-sapphire-900/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-emerald-400">Gaming</span>
                      </div>
                      <span className="text-green-400">+5.8%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Tokens */}
              <div className="bg-sapphire-800/30 border border-emerald-400/20 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-emerald-400/20 flex justify-between items-center">
                  <h2 className="text-xl font-cyber text-emerald-400">Trending Tokens</h2>
                  <Link
                    href="/platform/market-analysis"
                    className="text-emerald-400/70 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <span className="text-sm">View All</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-emerald-400/50 text-sm">
                        <th className="px-3 py-2">Token</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">24h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendingTokens.map((token, index) => (
                        <tr key={index} className="border-b border-emerald-400/10 last:border-0">
                          <td className="px-3 py-3">
                            <Link
                              href={`/platform/token-analysis?token=${token.symbol}`}
                              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-400/80"
                            >
                              <div className="w-8 h-8 bg-emerald-400/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
                                {token.symbol.substring(0, 2)}
                              </div>
                              <div>
                                <div>{token.symbol}</div>
                                <div className="text-xs text-emerald-400/60">{token.name}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-emerald-400">{token.price}</td>
                          <td
                            className={`px-3 py-3 ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {token.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Assistant Prompt */}
            <div className="mt-8 bg-emerald-400/10 border border-emerald-400/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-400/20 p-3 rounded-full">
                  <Bot className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-cyber text-emerald-400 mb-2">TradesXBT Assistant</h2>
                  <p className="text-emerald-400/80 mb-4">
                    Looking for personalized trading insights? Ask TradesXBT for token analysis,
                    market insights, or trading recommendations.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/platform/token-analysis"
                      className="px-4 py-2 bg-emerald-400 text-sapphire-900 font-cyber uppercase tracking-wide text-sm hover:bg-emerald-500 transition-colors"
                    >
                      Token Analysis
                    </Link>
                    <Link
                      href="/platform/market-analysis"
                      className="px-4 py-2 border border-emerald-400 text-emerald-400 font-cyber uppercase tracking-wide text-sm hover:bg-emerald-400/10 transition-colors"
                    >
                      Market Analysis
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
