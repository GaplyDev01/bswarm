// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bell,
  BellOff,
  ArrowUp,
  ArrowDown,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart4,
  ExternalLink,
  Eye,
  Brain,
  CheckCircle,
  Filter,
  Info,
  Download,
  Calendar,
  Settings,
  RefreshCw,
  Zap,
} from 'lucide-react';

import {
  generateTradingSignals,
  updateSignalPerformance,
  TradingSignal as AITradingSignal,
} from '@/lib/trading-signals';

import {
  CryptoCard,
  CryptoCardHeader,
  CryptoCardContent,
  CryptoCardFooter,
} from '@/components/ui/crypto-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BackNavigation from '@/components/BackNavigation';

import { formatCurrency, formatPercentage, getPriceChangeColor, getRandomInt } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { logger } from '@/lib/logger';

// Signal interface
interface Signal {
  id: string;
  token: string;
  tokenSymbol: string;
  type: 'buy' | 'sell';
  confidence: number;
  timeframe: string;
  price: number;
  targetPrice: number;
  stopLoss: number;
  change: number;
  timestamp: number;
  status: 'active' | 'completed' | 'failed';
  reasoning: string[];
  category: 'breakout' | 'trend' | 'reversal' | 'oscillator';
}

// Mock data
const mockSignals: Signal[] = [
  {
    id: 'sig1',
    token: 'Solana',
    tokenSymbol: 'SOL',
    type: 'buy',
    confidence: 87,
    timeframe: '4h',
    price: 142.78,
    targetPrice: 158.5,
    stopLoss: 136.4,
    change: 11.0,
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    status: 'active',
    reasoning: [
      'Breakout from key resistance level at $140',
      'Increased volume confirming momentum',
      'Positive RSI divergence on 4h chart',
      'Overall market uptrend supporting movement',
    ],
    category: 'breakout',
  },
  {
    id: 'sig2',
    token: 'Jupiter',
    tokenSymbol: 'JUP',
    type: 'buy',
    confidence: 76,
    timeframe: '1d',
    price: 1.24,
    targetPrice: 1.45,
    stopLoss: 1.15,
    change: 16.9,
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    status: 'active',
    reasoning: [
      'Forming cup and handle pattern',
      'Volume increasing on upward movements',
      'Support level established at $1.15',
      'Strong fundamentals with upcoming feature launch',
    ],
    category: 'trend',
  },
  {
    id: 'sig3',
    token: 'Jito',
    tokenSymbol: 'JTO',
    type: 'sell',
    confidence: 68,
    timeframe: '1h',
    price: 2.87,
    targetPrice: 2.65,
    stopLoss: 3.05,
    change: -7.7,
    timestamp: Date.now() - 3600000 * 8, // 8 hours ago
    status: 'active',
    reasoning: [
      'Double top pattern formation at $3.05',
      'Declining volume on recent rallies',
      'RSI showing overbought conditions',
      'Significant resistance at the $3.10 level',
    ],
    category: 'reversal',
  },
  {
    id: 'sig4',
    token: 'Render',
    tokenSymbol: 'RNDR',
    type: 'buy',
    confidence: 92,
    timeframe: '1d',
    price: 6.78,
    targetPrice: 8.2,
    stopLoss: 6.2,
    change: 20.9,
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    status: 'completed',
    reasoning: [
      'Strong breakout from consolidation pattern',
      'Increasing buy pressure from institutional investors',
      'Positive MACD crossover on daily chart',
      'Support from 50-day moving average',
    ],
    category: 'breakout',
  },
  {
    id: 'sig5',
    token: 'Bonk',
    tokenSymbol: 'BONK',
    type: 'sell',
    confidence: 72,
    timeframe: '4h',
    price: 0.00001547,
    targetPrice: 0.0000132,
    stopLoss: 0.0000165,
    change: -14.7,
    timestamp: Date.now() - 86400000, // 1 day ago
    status: 'failed',
    reasoning: [
      'Bearish divergence on RSI',
      'Declining volume profile',
      'Rejection at key Fibonacci level',
      'Historical resistance zone',
    ],
    category: 'oscillator',
  },
];

export default function SignalsPage() {
  const router = useRouter();
  const [aiSignals, setAISignals] = useState<AITradingSignal[]>([]);
  const [signals, setSignals] = useState<Signal[]>(mockSignals);
  const [subscribedSignals, setSubscribedSignals] = useState<string[]>(['sig1', 'sig2']);
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [loadingAISignals, setLoadingAISignals] = useState(true);

  // Load AI-generated signals
  useEffect(() => {
    const loadAISignals = async () => {
      setLoadingAISignals(true);
      try {
        const newSignals = await generateTradingSignals(5);
        setAISignals(newSignals);
      } catch (error) {
        logger.error('Failed to load AI signals:', error);
      } finally {
        setLoadingAISignals(false);
      }
    };

    loadAISignals();

    // Setup refresh interval
    const intervalId = setInterval(loadAISignals, 60 * 60 * 1000); // Refresh every hour

    return () => clearInterval(intervalId);
  }, []);

  // Filter signals based on active tab and filter
  const filteredSignals = signals.filter(signal => {
    if (activeTab === 'subscribed' && !subscribedSignals.includes(signal.id)) {
      return false;
    }

    if (activeTab === 'active' && signal.status !== 'active') {
      return false;
    }

    if (activeTab === 'completed' && signal.status !== 'completed') {
      return false;
    }

    if (activeFilter && signal.category !== activeFilter) {
      return false;
    }

    return true;
  });

  // Toggle subscription
  const toggleSubscription = (signalId: string) => {
    if (subscribedSignals.includes(signalId)) {
      setSubscribedSignals(subscribedSignals.filter(id => id !== signalId));
    } else {
      setSubscribedSignals([...subscribedSignals, signalId]);
    }
  };

  // View signal details
  const viewSignalDetails = (signal: Signal) => {
    setSelectedSignal(signal);
  };

  // Close signal details
  const closeSignalDetails = () => {
    setSelectedSignal(null);
  };

  // Handle signal action (trade based on signal)
  const handleSignalAction = (signal: Signal) => {
    router.push(`/trading?token=${signal.tokenSymbol.toLowerCase()}`);
  };

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

        {/* Header Card */}
        <CryptoCard className="mb-6" variant="neon" hover="glow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00FF80]/20 to-purple-500/20 rounded-xl border border-[#00FF80]/30 flex items-center justify-center mr-4">
                <Brain size={24} className="text-[#00FF80]" />
              </div>
              <div>
                <h2 className="text-xl font-medium">AI Trading Signals</h2>
                <p className="text-gray-400">Real-time trading opportunities powered by our AI</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter size={14} className="mr-1" />
                  Customize
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </CryptoCard>

        {/* AI-Generated Signals Section */}
        <CryptoCard className="mb-6" variant="neon">
          <CryptoCardHeader>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#00FF80]/10 border border-[#00FF80]/30 flex items-center justify-center mr-3">
                <Brain size={20} className="text-[#00FF80]" />
              </div>
              <div>
                <h3 className="text-lg font-medium">AI-Generated Trade Signals</h3>
                <p className="text-sm text-gray-400">Real-time algorithmic trading signals</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={async () => {
                setLoadingAISignals(true);
                try {
                  const newSignals = await generateTradingSignals(5);
                  setAISignals(newSignals);
                } finally {
                  setLoadingAISignals(false);
                }
              }}
              disabled={loadingAISignals}
            >
              <RefreshCw size={14} className={`mr-1 ${loadingAISignals ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CryptoCardHeader>

          <CryptoCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingAISignals ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-4 h-[300px] animate-pulse">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 mr-3"></div>
                          <div>
                            <div className="h-5 bg-gray-800 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-800 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="h-12 bg-gray-800 rounded"></div>
                        <div className="h-12 bg-gray-800 rounded"></div>
                        <div className="h-12 bg-gray-800 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-800 rounded w-full"></div>
                        <div className="h-3 bg-gray-800 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-800 rounded w-4/6"></div>
                      </div>
                      <div className="h-8 bg-gray-800 rounded mt-6"></div>
                    </div>
                  ))
              ) : aiSignals.length > 0 ? (
                aiSignals.slice(0, 3).map((signal, index) => (
                  <div
                    key={index}
                    className={`bg-black/30 backdrop-blur-sm rounded-lg border ${
                      signal.type === 'buy'
                        ? 'border-green-500/20'
                        : signal.type === 'sell'
                          ? 'border-red-500/20'
                          : 'border-gray-500/20'
                    } p-4 hover:bg-black/40 transition-all cursor-pointer`}
                    onClick={() => router.push(`/trading?token=${signal.token.toLowerCase()}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-lg ${
                            signal.type === 'buy'
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                              : 'bg-red-900/30 text-red-400 border border-red-500/30'
                          } flex items-center justify-center mr-3`}
                        >
                          {signal.type === 'buy' ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{signal.token}</h3>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${
                                signal.type === 'buy'
                                  ? 'bg-green-900/20 text-green-400 border-green-500/20'
                                  : 'bg-red-900/20 text-red-400 border-red-500/20'
                              }`}
                            >
                              {signal.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">{signal.tokenName}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Timer size={14} className="mr-1" />
                        <span>{signal.timeframe}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                        <div className="text-sm font-medium">
                          ${signal.entryPrice.toFixed(signal.entryPrice < 1 ? 6 : 2)}
                        </div>
                      </div>
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xs text-gray-400 mb-1">Target</div>
                        <div
                          className={`text-sm font-medium ${
                            signal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          ${signal.targetPrice.toFixed(signal.targetPrice < 1 ? 6 : 2)}
                        </div>
                      </div>
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                        <div className="text-sm font-medium text-red-400">
                          ${signal.stopLoss.toFixed(signal.stopLoss < 1 ? 6 : 2)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-300 mb-4 line-clamp-2">
                      {signal.reasoning}
                    </div>

                    <Button
                      className={`w-full text-xs ${
                        signal.type === 'buy'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      size="sm"
                    >
                      {signal.type === 'buy' ? 'Apply Buy Signal' : 'Apply Sell Signal'}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-6 text-center">
                  <Info size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>No AI signals available. Try refreshing.</p>
                </div>
              )}
            </div>
            {aiSignals.length > 3 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => router.push('/signals/ai')}>
                  View All AI Signals
                </Button>
              </div>
            )}
          </CryptoCardContent>
        </CryptoCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Signals List */}
          <div className="md:col-span-2">
            <CryptoCard>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="all">All Signals</TabsTrigger>
                    <TabsTrigger value="subscribed">Subscribed</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <div className="flex space-x-2 mt-3 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className={activeFilter === 'breakout' ? 'bg-white/10' : ''}
                      onClick={() =>
                        setActiveFilter(activeFilter === 'breakout' ? null : 'breakout')
                      }
                    >
                      Breakout
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={activeFilter === 'trend' ? 'bg-white/10' : ''}
                      onClick={() => setActiveFilter(activeFilter === 'trend' ? null : 'trend')}
                    >
                      Trend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={activeFilter === 'reversal' ? 'bg-white/10' : ''}
                      onClick={() =>
                        setActiveFilter(activeFilter === 'reversal' ? null : 'reversal')
                      }
                    >
                      Reversal
                    </Button>
                  </div>
                </div>

                <TabsContent value="all" className="mt-0">
                  <div className="space-y-4">
                    {filteredSignals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Sparkles size={32} className="mb-3 opacity-50" />
                        <h3 className="text-lg font-medium mb-1">No signals match your filters</h3>
                        <p className="text-sm text-center max-w-md">
                          Try changing your filter criteria or check back later for new signals
                        </p>
                      </div>
                    ) : (
                      filteredSignals.map(signal => (
                        <div
                          key={signal.id}
                          className={`rounded-lg p-4 border cursor-pointer hover:bg-white/5 transition-colors ${
                            signal.status === 'active'
                              ? 'border-white/10 bg-black/20'
                              : signal.status === 'completed'
                                ? 'border-green-500/20 bg-green-900/10'
                                : 'border-red-500/20 bg-red-900/10'
                          }`}
                          onClick={() => viewSignalDetails(signal)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className="mr-3">
                                <div
                                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                    signal.type === 'buy'
                                      ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                      : 'bg-red-900/30 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {signal.type === 'buy' ? (
                                    <TrendingUp size={20} />
                                  ) : (
                                    <TrendingDown size={20} />
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium">
                                    {signal.token} ({signal.tokenSymbol})
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 ${
                                      signal.category === 'breakout'
                                        ? 'bg-purple-900/20 text-purple-400 border-purple-500/20'
                                        : signal.category === 'trend'
                                          ? 'bg-blue-900/20 text-blue-400 border-blue-500/20'
                                          : signal.category === 'reversal'
                                            ? 'bg-amber-900/20 text-amber-400 border-amber-500/20'
                                            : 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20'
                                    }`}
                                  >
                                    {signal.category.charAt(0).toUpperCase() +
                                      signal.category.slice(1)}
                                  </Badge>
                                </div>

                                <div className="flex items-center mt-1">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      signal.type === 'buy'
                                        ? 'bg-green-900/20 text-green-400 border-green-500/20'
                                        : 'bg-red-900/20 text-red-400 border-red-500/20'
                                    }`}
                                  >
                                    {signal.type === 'buy' ? 'BUY' : 'SELL'}
                                  </Badge>
                                  <div className="ml-2 flex items-center">
                                    <Timer size={14} className="text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-400">
                                      {signal.timeframe}
                                    </span>
                                  </div>
                                  <div className="ml-2 flex items-center">
                                    <span className="text-sm text-gray-400">Confidence:</span>
                                    <span
                                      className={`ml-1 text-sm ${
                                        signal.confidence > 80
                                          ? 'text-green-400'
                                          : signal.confidence > 60
                                            ? 'text-blue-400'
                                            : 'text-amber-400'
                                      }`}
                                    >
                                      {signal.confidence}%
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Entry: </span>
                                    <span>{formatCurrency(signal.price)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Target: </span>
                                    <span
                                      className={
                                        signal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                                      }
                                    >
                                      {formatCurrency(signal.targetPrice)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Stop: </span>
                                    <span className="text-red-400">
                                      {formatCurrency(signal.stopLoss)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Potential: </span>
                                    <span className={getPriceChangeColor(signal.change)}>
                                      {formatPercentage(signal.change)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              className="text-gray-400 hover:text-white transition-colors"
                              onClick={e => {
                                e.stopPropagation();
                                toggleSubscription(signal.id);
                              }}
                            >
                              {subscribedSignals.includes(signal.id) ? (
                                <Bell size={18} className="text-[#00FF80]" />
                              ) : (
                                <BellOff size={18} />
                              )}
                            </button>
                          </div>

                          {signal.status === 'active' && (
                            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                              <div className="flex items-center">
                                <Sparkles size={14} className="text-[#00FF80] mr-1" />
                                <span className="text-sm">
                                  AI signal generated {new Date(signal.timestamp).toLocaleString()}
                                </span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSignalAction(signal);
                                }}
                              >
                                <BarChart4 size={14} className="mr-1" />
                                Trade
                              </Button>
                            </div>
                          )}

                          {signal.status === 'completed' && (
                            <div className="mt-3 pt-3 border-t border-green-500/20 flex justify-between items-center">
                              <div className="flex items-center">
                                <CheckCircle size={14} className="text-green-400 mr-1" />
                                <span className="text-sm text-green-400">
                                  Target reached! {formatPercentage(signal.change)} profit
                                </span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSignalAction(signal);
                                }}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </div>
                          )}

                          {signal.status === 'failed' && (
                            <div className="mt-3 pt-3 border-t border-red-500/20 flex justify-between items-center">
                              <div className="flex items-center">
                                <Info size={14} className="text-red-400 mr-1" />
                                <span className="text-sm text-red-400">Stop loss triggered</span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSignalAction(signal);
                                }}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="subscribed" className="mt-0">
                  {/* Same layout as 'all' tab but filtered for subscribed signals */}
                </TabsContent>

                <TabsContent value="active" className="mt-0">
                  {/* Same layout as 'all' tab but filtered for active signals */}
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  {/* Same layout as 'all' tab but filtered for completed signals */}
                </TabsContent>
              </Tabs>
            </CryptoCard>
          </div>

          {/* Signal Details or Stats */}
          <div>
            {selectedSignal ? (
              <CryptoCard
                variant={selectedSignal.type === 'buy' ? 'success' : 'danger'}
                className="sticky top-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Signal Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={closeSignalDetails}
                  >
                    &times;
                  </Button>
                </div>

                <div className="flex items-center mb-4">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center mr-3 ${
                      selectedSignal.type === 'buy'
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : 'bg-red-900/30 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {selectedSignal.type === 'buy' ? (
                      <TrendingUp size={20} />
                    ) : (
                      <TrendingDown size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {selectedSignal.token} ({selectedSignal.tokenSymbol})
                    </h3>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className={`${
                          selectedSignal.type === 'buy'
                            ? 'bg-green-900/20 text-green-400 border-green-500/20'
                            : 'bg-red-900/20 text-red-400 border-red-500/20'
                        }`}
                      >
                        {selectedSignal.type === 'buy' ? 'BUY' : 'SELL'}
                      </Badge>
                      <div className="ml-2 flex items-center">
                        <Timer size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">{selectedSignal.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Confidence</span>
                    <span
                      className={`${
                        selectedSignal.confidence > 80
                          ? 'text-green-400'
                          : selectedSignal.confidence > 60
                            ? 'text-blue-400'
                            : 'text-amber-400'
                      }`}
                    >
                      {selectedSignal.confidence}%
                    </span>
                  </div>
                  <Progress value={selectedSignal.confidence} max={100} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                    <div className="text-lg font-medium">
                      {formatCurrency(selectedSignal.price)}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Target Price</div>
                    <div
                      className={`text-lg font-medium ${
                        selectedSignal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(selectedSignal.targetPrice)}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                    <div className="text-lg font-medium text-red-400">
                      {formatCurrency(selectedSignal.stopLoss)}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Potential Return</div>
                    <div
                      className={`text-lg font-medium ${getPriceChangeColor(selectedSignal.change)}`}
                    >
                      {formatPercentage(selectedSignal.change)}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                  <div className="bg-black/20 rounded-lg p-3">
                    <ul className="space-y-2">
                      {selectedSignal.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={16} className="text-[#00FF80] mt-0.5 mr-2 shrink-0" />
                          <span className="text-sm">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Button
                    className={`w-full ${
                      selectedSignal.type === 'buy'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => handleSignalAction(selectedSignal)}
                  >
                    {selectedSignal.status === 'active' ? (
                      <>
                        <BarChart4 size={16} className="mr-2" />
                        Trade Now
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="mr-2" />
                        View Chart
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
                  <Info size={12} className="mr-1" />
                  Signal generated: {new Date(selectedSignal.timestamp).toLocaleString()}
                </div>
              </CryptoCard>
            ) : (
              // Statistics and Info Card
              <>
                <CryptoCard className="mb-6" variant="glass">
                  <h3 className="text-lg font-medium mb-4">Signal Performance</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-green-400">78%</span>
                    </div>
                    <Progress value={78} max={100} className="h-2 mb-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-2xl font-medium text-green-400">67</div>
                        <div className="text-xs text-gray-400">Profitable Signals</div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-2xl font-medium text-red-400">19</div>
                        <div className="text-xs text-gray-400">Unprofitable Signals</div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-2xl font-medium">214%</div>
                        <div className="text-xs text-gray-400">Annual ROI</div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-2xl font-medium">24.3%</div>
                        <div className="text-xs text-gray-400">Avg. Return per Signal</div>
                      </div>
                    </div>
                  </div>
                </CryptoCard>

                <CryptoCard variant="neon">
                  <h3 className="text-lg font-medium mb-4">How It Works</h3>

                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-[#00FF80] mr-3">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Advanced AI Analysis</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Our AI scans market data, on-chain metrics, sentiment, and technical
                          patterns to identify opportunities
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-[#00FF80] mr-3">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Signal Generation</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          High-confidence trading opportunities are delivered with specific entry,
                          target, and stop-loss levels
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-[#00FF80] mr-3">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Risk Management</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Each signal includes recommended position size and risk parameters for
                          optimal portfolio management
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-[#00FF80] mr-3">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium">Performance Tracking</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          We monitor all signals and provide transparent performance metrics for
                          accountability
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Sparkles size={16} className="mr-2" />
                    Upgrade to Premium Signals
                  </Button>
                </CryptoCard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
