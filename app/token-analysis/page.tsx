'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BackNavigation from '@/components/BackNavigation';
import { logger } from '@/lib/logger';

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  marketCap: number;
  description: string;
  website: string;
  explorer: string;
  social?: {
    twitter?: string;
    telegram?: string;
    reddit?: string;
  };
}

export default function TokenAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'technicals'> | ('social' > 'overview');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mock price history data - in a real app, fetch from API
  const priceHistory = [
    { date: 'Jan', price: 64 },
    { date: 'Feb', price: 59 },
    { date: 'Mar', price: 80 },
    { date: 'Apr', price: 78 },
    { date: 'May', price: 63 },
    { date: 'Jun', price: 56 },
    { date: 'Jul', price: 85 },
    { date: 'Aug', price: 95 },
    { date: 'Sep', price: 110 },
    { date: 'Oct', price: 135 },
    { date: 'Nov', price: 120 },
    { date: 'Dec', price: 145 },
  ];

  // Animation state
  const [showDetails, setShowDetails] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    const walletConnected = localStorage.getItem('walletConnected');
    if (!walletConnected) {
      router.push('/');
    } else {
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        // In a real app, fetch token data from API
        fetchTokenData(tokenParam.toLowerCase());
      } else {
        router.push('/dashboard');
      }
    }

    // Staggered animations
    const detailsTimer = setTimeout(() => setShowDetails(true), 300);
    const chartTimer = setTimeout(() => setShowChart(true), 600);
    const metricsTimer = setTimeout(() => setShowMetrics(true), 900);

    return () => {
      clearTimeout(detailsTimer);
      clearTimeout(chartTimer);
      clearTimeout(metricsTimer);
    };
  }, [router, searchParams]);

  const fetchTokenData = async (tokenId: string) => {
    setLoading(true);
    try {
      // In a production app, use the actual API
      // const data = await getTokenData(tokenId)

      // For demo purposes, using mock data
      const mockData: TokenData = {
        id: tokenId,
        name: tokenId === 'sol' ? 'Solana' : tokenId === 'bonk' ? 'Bonk' : 'Unknown Token',
        symbol: tokenId === 'sol' ? 'SOL' : tokenId === 'bonk' ? 'BONK' : tokenId.toUpperCase(),
        price: tokenId === 'sol' ? 142.78 : tokenId === 'bonk' ? 0.00001547 : 0,
        change_24h: tokenId === 'sol' ? 8.45 : tokenId === 'bonk' ? 12.3 : 0,
        volume_24h: tokenId === 'sol' ? 2460000000 : tokenId === 'bonk' ? 287000000 : 0,
        marketCap: tokenId === 'sol' ? 62500000000 : tokenId === 'bonk' ? 980000000 : 0,
        description:
          tokenId === 'sol'
            ? 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.'
            : 'BONK is the first Solana dog coin for the people, by the people.',
        website: tokenId === 'sol' ? 'https://solana.com' : 'https://bonkcoin.com',
        explorer: 'https://explorer.solana.com',
        social: {
          twitter: tokenId === 'sol' ? 'solana' : 'bonkcoin',
          telegram: tokenId === 'sol' ? 'solana' : 'bonkcoin',
          reddit: tokenId === 'sol' ? 'solana' : 'bonkcoin',
        },
      };

      setTokenData(mockData);
    } catch (error) {
      logger.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(decimals) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    } else if (num < 0.0001) {
      return num.toExponential(decimals);
    } else {
      return num.toFixed(decimals);
    }
  };

  // Generate chart path for the price history
  const generateChartPath = () => {
    const maxPrice = Math.max(...priceHistory.map(point => point.price));
    const minPrice = Math.min(...priceHistory.map(point => point.price));
    const range = maxPrice - minPrice;

    const width = 1000;
    const height = 200;
    const padding = 10;

    const xStep = (width - 2 * padding) / (priceHistory.length - 1);

    const points = priceHistory.map((point, i) => {
      const x = padding + i * xStep;
      const normalizedPrice = (point.price - minPrice) / range;
      const y = height - padding - normalizedPrice * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  if (!token || loading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] justify-center items-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-30 animate-spin"></div>
          <div className="h-8 w-64 bg-gray-800 rounded"></div>
          <div className="h-4 w-40 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/grid-pattern.svg')] bg-repeat z-0"></div>
      <div
        className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-bl from-purple-900/30 to-transparent rounded-bl-full blur-3xl"
        style={{ filter: 'blur(120px)' }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-1/2 h-screen bg-gradient-to-tr from-blue-900/20 to-transparent rounded-tr-full blur-3xl"
        style={{ filter: 'blur(120px)' }}
      ></div>

      <main className="flex-1 p-4 sm:p-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          {/* Top Section */}
          <BackNavigation backTo="/dashboard" label="Back to Dashboard" />
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-full bg-gradient-to-br from-[#6200EA] to-[#00E676] p-[2px]">
                <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  {tokenData && (
                    <span className="text-white font-bold text-lg">
                      {tokenData.symbol.slice(0, 1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl sm:text-5xl font-bold text-white">
                  {tokenData?.name}
                  <span className="ml-2 text-xl text-gray-400">{tokenData?.symbol}</span>
                </h1>
                <div className="flex items-center mt-1 space-x-3">
                  <span className="text-2xl font-bold text-white">
                    ${tokenData?.price.toFixed(tokenData?.price < 0.01 ? 8 : 2)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${tokenData?.change_24h && tokenData.change_24h >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                  >
                    {tokenData?.change_24h && tokenData.change_24h >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(tokenData?.change_24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => window.open(tokenData?.website, '_blank')}
                className="bg-[#6200EA]/80 hover:bg-[#6200EA] text-white backdrop-blur-sm border border-white/10 px-4 py-2 h-auto"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                Website
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-transparent hover:bg-white/10 text-white border border-white/20 px-4 py-2 h-auto backdrop-blur-sm"
              >
                Dashboard
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 px-1 text-base font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-[#00E676] border-b-2 border-[#00E676]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('technicals')}
                className={`pb-2 px-1 text-base font-medium transition-colors ${
                  activeTab === 'technicals'
                    ? 'text-[#00E676] border-b-2 border-[#00E676]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Technical Analysis
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`pb-2 px-1 text-base font-medium transition-colors ${
                  activeTab === 'social'
                    ? 'text-[#00E676] border-b-2 border-[#00E676]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Social Sentiment
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div
              className={`lg:col-span-2 space-y-6 transform transition-all duration-500 ease-out ${showDetails ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
            >
              {/* Price Chart */}
              <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white text-lg font-medium">Price Chart</h2>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20">
                      1D
                    </button>
                    <button className="px-2 py-1 text-xs bg-[#6200EA]/50 text-white rounded">
                      1W
                    </button>
                    <button className="px-2 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20">
                      1M
                    </button>
                    <button className="px-2 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20">
                      1Y
                    </button>
                  </div>
                </div>
                <div
                  className={`h-[300px] relative transform transition-all duration-700 ease-out ${showChart ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    {/* Chart grid */}
                    <g className="grid">
                      {[0, 1, 2, 3, 4].map(i => (
                        <line
                          key={i}
                          x1="0"
                          y1={i * 50}
                          x2="1000"
                          y2={i * 50}
                          stroke="#ffffff20"
                          strokeWidth="1"
                        />
                      ))}
                    </g>

                    {/* Price line */}
                    <path
                      d={generateChartPath()}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_4px_rgba(0,230,118,0.5)]"
                    />

                    {/* Area fill */}
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                    </linearGradient>
                    <path d={`${generateChartPath()} L 990,200 L 10,200 Z`} fill="url(#gradient)" />

                    {/* Animated marker that follows the line */}
                    <circle
                      cx={priceHistory.length * 83 - 50}
                      cy="50"
                      r="6"
                      fill="#00E676"
                      className="animate-pulse drop-shadow-[0_0_8px_rgba(0,230,118,0.8)]"
                    />
                  </svg>

                  {/* Price labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-400">
                    {priceHistory
                      .filter((_, i) => i % 2 === 0)
                      .map((point, i) => (
                        <span key={i}>{point.date}</span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Token Details */}
              {activeTab === 'overview' && (
                <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">About {tokenData?.name}</h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">{tokenData?.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Market Cap</p>
                      <p className="text-white text-lg font-medium">
                        ${formatNumber(tokenData?.marketCap || 0)}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">24h Volume</p>
                      <p className="text-white text-lg font-medium">
                        ${formatNumber(tokenData?.volume_24h || 0)}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Rank</p>
                      <p className="text-white text-lg font-medium">#12</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Price Change</p>
                      <p
                        className={`text-lg font-medium ${tokenData?.change_24h && tokenData.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {tokenData?.change_24h && tokenData.change_24h >= 0 ? '+' : ''}
                        {tokenData?.change_24h || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Analysis */}
              {activeTab === 'technicals' && (
                <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">Technical Analysis</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">RSI (14)</p>
                      <p className="text-white text-lg font-medium">67.8</p>
                      <p className="text-xs text-yellow-500">Slightly Overbought</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">MACD</p>
                      <p className="text-white text-lg font-medium">+3.45</p>
                      <p className="text-xs text-green-500">Bullish</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">MA (50/200)</p>
                      <p className="text-white text-lg font-medium">Cross Up</p>
                      <p className="text-xs text-green-500">Golden Cross</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white text-lg font-medium mb-3">Support & Resistance</h3>
                    <div className="h-12 relative bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-md">
                      <div className="absolute h-full w-px bg-white left-1/3 opacity-30"></div>
                      <div className="absolute h-full w-px bg-white left-2/3 opacity-30"></div>
                      <div className="absolute top-full mt-1 left-[10%] text-xs text-gray-400">
                        $125
                      </div>
                      <div className="absolute top-full mt-1 left-[38%] text-xs text-gray-400">
                        $142
                      </div>
                      <div className="absolute top-full mt-1 left-[75%] text-xs text-gray-400">
                        $160
                      </div>

                      <div className="absolute h-8 w-8 rounded-full bg-white/20 border-2 border-white top-1/2 left-[38%] transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center">
                        <span className="text-xs text-white">Now</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white text-lg font-medium mb-3">Signals Overview</h3>
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Buy Signals:</span>
                        <span className="text-green-400 font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Neutral Signals:</span>
                        <span className="text-yellow-400 font-medium">4</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sell Signals:</span>
                        <span className="text-red-400 font-medium">2</span>
                      </div>

                      <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                          style={{ width: '80%' }}
                        ></div>
                      </div>
                      <p className="text-center text-sm text-green-400 mt-2">
                        Strong Buy Recommendation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Sentiment */}
              {activeTab === 'social' && (
                <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">Social Sentiment</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-sm">Twitter</p>
                        <svg
                          className="w-6 h-6 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05-.78-.83-1.9-1.36-3.16-1.36-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                        </svg>
                      </div>
                      <p className="text-white text-lg font-medium">4.3/5</p>
                      <p className="text-xs text-green-500">87% Positive Sentiment</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-sm">Reddit</p>
                        <svg
                          className="w-6 h-6 text-orange-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.04.01-.19-.08-.27-.09-.08-.21-.05-.3-.03-.13.03-2.2 1.4-6.22 4.12-.59.4-1.12.6-1.59.59-.53-.01-1.54-.3-2.28-.55-.92-.31-1.64-.47-1.58-.99.03-.27.38-.54 1.03-.83 4.03-1.75 6.72-2.91 8.08-3.48 3.85-1.61 4.65-1.9 5.17-1.9.12 0 .37.03.54.17.14.12.18.3.2.5.02.14.01.29-.01.41z" />
                        </svg>
                      </div>
                      <p className="text-white text-lg font-medium">3.8/5</p>
                      <p className="text-xs text-green-500">72% Positive Mentions</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-sm">Telegram</p>
                        <svg
                          className="w-6 h-6 text-blue-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.04.01-.19-.08-.27-.09-.08-.21-.05-.3-.03-.13.03-2.2 1.4-6.22 4.12-.59.4-1.12.6-1.59.59-.53-.01-1.54-.3-2.28-.55-.92-.31-1.64-.47-1.58-.99.03-.27.38-.54 1.03-.83 4.03-1.75 6.72-2.91 8.08-3.48 3.85-1.61 4.65-1.9 5.17-1.9.12 0 .37.03.54.17.14.12.18.3.2.5.02.14.01.29-.01.41z" />
                        </svg>
                      </div>
                      <p className="text-white text-lg font-medium">4.1/5</p>
                      <p className="text-xs text-green-500">82% Positive Discussions</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 mb-6">
                    <h3 className="text-white text-lg font-medium mb-3">Sentiment Analysis</h3>
                    <div className="flex items-end h-32 space-x-4">
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-green-500/80 w-full rounded-t-md"
                          style={{ height: '60%' }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">Very Positive</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-green-400/80 w-full rounded-t-md"
                          style={{ height: '25%' }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">Positive</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-yellow-400/80 w-full rounded-t-md"
                          style={{ height: '10%' }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">Neutral</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-red-400/80 w-full rounded-t-md"
                          style={{ height: '4%' }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">Negative</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-red-500/80 w-full rounded-t-md"
                          style={{ height: '1%' }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">Very Negative</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white text-lg font-medium mb-3">Recent Mentions</h3>

                    <div className="space-y-4">
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                              T
                            </div>
                            <span className="ml-2 text-gray-400 text-sm">@crypto_whale</span>
                          </div>
                          <span className="text-xs text-gray-500">2h ago</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {tokenData?.symbol} looking extremely bullish on the 4h chart. Key
                          resistance at $160 about to be tested. 🚀
                        </p>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white">
                              R
                            </div>
                            <span className="ml-2 text-gray-400 text-sm">
                              r/{tokenData?.symbol.toLowerCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">5h ago</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          The ecosystem growth for {tokenData?.name} is incredible. Over 300 new
                          dApps in the last quarter alone!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div
              className={`space-y-6 transform transition-all duration-500 ease-out ${showMetrics ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
            >
              <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">Market Metrics</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap Rank</span>
                    <span className="text-white font-medium">#12</span>
                  </div>
                  <div className="h-px bg-gray-800"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white font-medium">
                      ${formatNumber(tokenData?.marketCap || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-800"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white font-medium">
                      ${formatNumber(tokenData?.volume_24h || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-800"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volume / Market Cap</span>
                    <span className="text-white font-medium">
                      {tokenData?.marketCap
                        ? ((tokenData.volume_24h / tokenData.marketCap) * 100).toFixed(2)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-px bg-gray-800"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Circulating Supply</span>
                    <span className="text-white font-medium">
                      {tokenData?.symbol === 'SOL' ? '545M' : '658T'} {tokenData?.symbol}
                    </span>
                  </div>
                  <div className="h-px bg-gray-800"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Supply</span>
                    <span className="text-white font-medium">
                      {tokenData?.symbol === 'SOL' ? '569M' : '900T'} {tokenData?.symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">Trade {tokenData?.symbol}</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-3 rounded-lg shadow-lg hover:from-green-500 hover:to-green-400 transition-all">
                      Buy
                    </button>
                    <div className="w-4"></div>
                    <button className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-3 rounded-lg shadow-lg hover:from-red-500 hover:to-red-400 transition-all">
                      Sell
                    </button>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Best Price:</span>
                      <span className="text-white">
                        ${tokenData?.price.toFixed(tokenData.price < 0.01 ? 8 : 2)} on Jupiter
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Slippage:</span>
                      <span className="text-white">0.35%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M12 16V8m-4 4h8m5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="text-white text-lg font-semibold">AI Trade Assistant</h2>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">
                    Get personalized trading insights powered by our AI analysis.
                  </p>

                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-500/20">
                    <p className="text-gray-200 text-sm">
                      <span className="text-purple-400 font-medium">TradesXBT AI:</span> Based on
                      current price action and on-chain metrics, {tokenData?.symbol} is showing
                      strong bullish signals. Recommend scaling in positions with a stop loss at
                      $125.
                    </p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Signal Strength</span>
                      <span className="text-green-400 font-medium">Strong Buy</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-300 h-2.5 rounded-full"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
