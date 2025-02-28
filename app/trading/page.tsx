// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  CircleDollarSign,
  Wallet as WalletIcon,
  Info,
  Paintbrush,
  Settings,
  Rocket,
  Brain,
  PanelLeft,
  Pencil,
  LineChart,
  Bot,
  Zap,
  Gauge,
  FileText,
  ShieldAlert,
  SlidersHorizontal,
  Calculator,
  TrendingUp,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import BackNavigation from '@/components/BackNavigation';

import {
  CryptoCard,
  CryptoCardHeader,
  CryptoCardContent,
  CryptoCardFooter,
} from '@/components/ui/crypto-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import TradingViewWidget from '@/components/TradingViewWidget';
import GooeyMenu from '@/components/ui/gooey-menu';
import ChartControls from '@/components/ui/chart-controls';
import AIStrategySettings from '@/components/ai-strategy-settings';
import FloatingToolbar from '@/components/ui/floating-toolbar';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { SignalCard } from '@/components/trading/SignalCard';

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getPriceChangeColor,
  generateId,
} from '@/lib/utils';
import SolanaService, { TokenInfo } from '@/lib/solana';
import { useAppStore } from '@/lib/store';
import { TradingSignal } from '@/lib/trading-signals';
import { logger } from '@/lib/logger';

export default function TradingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token')?.toUpperCase() || 'SOL';

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>('');
// @ts-ignore
  const [orderType, setOrderType] = (useState < 'market') | ('limit' >> 'market');
  const [limitPrice, setLimitPrice] = useState<string>('');
// @ts-ignore
  const [orderSide, setOrderSide] = (useState < 'buy') | ('sell' >> 'buy');
  const [sliderValue, setSliderValue] = useState([0]);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { connected, walletAddress, addTrade } = useAppStore();

  // Fetch tokens
  useEffect(() => {
    async function fetchTokens() {
      try {
        const tokenList = await SolanaService.getTokenList();
        setTokens(tokenList);

        // Find the default token
        const defaultToken = tokenList.find(t => t.symbol === tokenParam) || tokenList[0];
        setSelectedToken(defaultToken);

        if (orderType === 'limit') {
          setLimitPrice(defaultToken.price.toString());
        }
      } catch (error) {
        logger.error('Failed to fetch tokens:', error);
      }
    }

    fetchTokens();
  }, [tokenParam, orderType]);

  // Calculate total
  const calculateTotal = () => {
    if (!selectedToken || !amount || isNaN(parseFloat(amount))) return 0;

    const price =
      orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : selectedToken.price;
    return parseFloat(amount) * price;
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);

    if (!selectedToken) return;

    // Calculate percentage of max amount
    const maxAmount = orderSide === 'buy' ? 1000 : 10; // Mock values
    const calculatedAmount = (maxAmount * value[0]) / 100;

    setAmount(calculatedAmount.toFixed(calculatedAmount < 1 ? 6 : 2));
  };

  // Select token
  const handleSelectToken = (token: TokenInfo) => {
    setSelectedToken(token);
    setIsTokenDropdownOpen(false);

    if (orderType === 'limit') {
      setLimitPrice(token.price.toString());
    }
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!selectedToken || !amount || isNaN(parseFloat(amount))) return;

    try {
      setProcessing(true);

      const price = orderType === 'limit' ? parseFloat(limitPrice) : selectedToken.price;

      // Create position object for the API
      const position = {
        tokenSymbol: selectedToken.symbol,
        tokenName: selectedToken.name,
        type: orderSide,
        amount: parseFloat(amount),
        entryPrice: price,
        stopLoss: price * (orderSide === 'buy' ? 0.95 : 1.05), // Default 5% stop loss
        takeProfit: price * (orderSide === 'buy' ? 1.15 : 0.85), // Default 15% take profit
        isAiManaged: false, // Manual position
      };

      // Send to API
      try {
        const response = await fetch('/api/trading/positions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(position),
        });

        if (response.ok) {
          // Also add to local store for immediate feedback
          const trade = {
            id: generateId(),
            tokenSymbol: selectedToken.symbol,
            tokenName: selectedToken.name,
            type: orderSide,
            amount: parseFloat(amount),
            price,
            timestamp: Date.now(),
            status: 'open' as 'open' | 'closed' | 'canceled',
          };

          // Add to store
          addTrade(trade);

          // Refresh positions
          const positionsResponse = await fetch('/api/trading/positions');
          if (positionsResponse.ok) {
            setPositions(await positionsResponse.json());
          }
        } else {
          logger.error('Failed to create position:', await response.text());

          // Fallback to local store if API fails
          const trade = {
            id: generateId(),
            tokenSymbol: selectedToken.symbol,
            tokenName: selectedToken.name,
            type: orderSide,
            amount: parseFloat(amount),
            price,
            timestamp: Date.now(),
            status: 'open' as 'open' | 'closed' | 'canceled',
          };

          // Add to store
          addTrade(trade);
        }
      } catch (apiError) {
        logger.error('API error creating position:', apiError);

        // Fallback to local functionality if API is unavailable
        const trade = {
          id: generateId(),
          tokenSymbol: selectedToken.symbol,
          tokenName: selectedToken.name,
          type: orderSide,
          amount: parseFloat(amount),
          price,
          timestamp: Date.now(),
          status: 'open' as 'open' | 'closed' | 'canceled',
        };

        // Add to store
        addTrade(trade);
      }

      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      logger.error('Failed to submit order:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Trading actions and menu items
  const handleOpenAIChat = () => {
    logger.log('Opening AI trading assistant');
    // Implementation will go here
  };

  const handleOpenStrategy = () => {
    logger.log('Opening strategy settings');
    setShowStrategy(true);
  };

  // Get AI trading strategies and positions
  const [aiStrategies, setAiStrategies] = useState([]);
  const [userStrategies, setUserStrategies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);

  // Fetch AI trading data
  useEffect(() => {
    async function fetchAITradingData() {
      try {
        // Fetch strategies, positions and signals
        const strategiesResponse = await fetch('/api/trading/strategies');
        const userStrategiesResponse = await fetch('/api/trading/user-strategies');
        const positionsResponse = await fetch('/api/trading/positions');
        const signalsResponse = await fetch('/api/trading/signals');

        if (strategiesResponse.ok) setAiStrategies(await strategiesResponse.json());
        if (userStrategiesResponse.ok) setUserStrategies(await userStrategiesResponse.json());
        if (positionsResponse.ok) setPositions(await positionsResponse.json());
        if (signalsResponse.ok) {
          const data = await signalsResponse.json();
          setSignals(data);
        }
      } catch (error) {
        logger.error('Failed to fetch AI trading data:', error);
      }
    }

    fetchAITradingData();

    // If API endpoints aren't available yet, use mock data
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/trading-signals').then(module => {
        module.generateTradingSignals(3).then(mockSignals => {
          setSignals(mockSignals);
        });
      });
    }
  }, []);

  const handleTakeScreenshot = () => {
    logger.log('Taking chart screenshot');
    // Implementation will go here
  };

  const handleSaveLayout = () => {
    logger.log('Saving custom layout');
    // Implementation will go here
  };

  const handleShowHotkeys = () => {
    logger.log('Showing keyboard shortcuts');
    setShowKeyboardShortcuts(true);
  };

  // GooeyMenu items for trading actions
  const gooeyMenuItems = [
    {
      icon: <Brain size={18} className="text-[#00FF80]" />,
      label: 'AI Assistant',
      onClick: handleOpenAIChat,
    },
    {
      icon: <SlidersHorizontal size={18} className="text-[#00FF80]" />,
      label: 'Strategy Settings',
      onClick: handleOpenStrategy,
    },
    {
      icon: <Activity size={18} className="text-[#00FF80]" />,
      label: 'AI Trading Signals',
      onClick: () => {
        window.location.href = '/signals';
      },
    },
    {
      icon: <Paintbrush size={18} className="text-[#00FF80]" />,
      label: 'Drawing Tools',
      onClick: () => logger.log('Opening drawing tools'),
    },
    {
      icon: <FileText size={18} className="text-[#00FF80]" />,
      label: 'Trade Notes',
      onClick: () => logger.log('Opening trade notes'),
    },
    {
      icon: <Calculator size={18} className="text-[#00FF80]" />,
      label: 'Position Calculator',
      onClick: () => logger.log('Opening position calculator'),
    },
  ];

  // Floating toolbar tabs content
  const toolbarTabs = [
    {
      id: 'analysis',
      label: 'Analysis',
      icon: <LineChart size={16} />,
      content: (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <Gauge size={16} className="mr-2 text-[#00FF80]" />
            <span>RSI Analysis</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <TrendingUp size={16} className="mr-2 text-[#00FF80]" />
            <span>MACD Signals</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <LineChart size={16} className="mr-2 text-[#00FF80]" />
            <span>Moving Averages</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <Zap size={16} className="mr-2 text-[#00FF80]" />
            <span>Volatility</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <ShieldAlert size={16} className="mr-2 text-[#00FF80]" />
            <span>Risk Assessment</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-start">
            <Bot size={16} className="mr-2 text-[#00FF80]" />
            <span>AI Prediction</span>
          </Button>
        </div>
      ),
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: <Pencil size={16} />,
      content: (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-start"
            onClick={handleTakeScreenshot}
          >
            <Pencil size={16} className="mr-2 text-[#00FF80]" />
            <span>Screenshot</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-start"
            onClick={handleSaveLayout}
          >
            <PanelLeft size={16} className="mr-2 text-[#00FF80]" />
            <span>Save Layout</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-start"
            onClick={handleShowHotkeys}
          >
            <Zap size={16} className="mr-2 text-[#00FF80]" />
            <span>Keyboard Shortcuts</span>
          </Button>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Dark Mode</span>
            <Switch
              checked={darkMode}
              onCheckedChange={checked => {
                setDarkMode(checked);
                if (typeof document !== 'undefined') {
                  document.documentElement.classList.toggle('dark-theme', checked);
                  document.documentElement.classList.toggle('light-theme', !checked);
                  // Save preference to localStorage
                  localStorage.setItem('theme', checked ? 'dark' : 'light');
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Auto-refresh Data</span>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Sound Alerts</span>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">AI Trading Notifications</span>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Show Keyboard Shortcuts</span>
            <Button variant="outline" size="sm" className="h-7" onClick={handleShowHotkeys}>
              Show Shortcuts
            </Button>
          </div>
        </div>
      ),
    },
  ];

  // UI State
  const [showStrategy, setShowStrategy] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  // darkMode is already defined at the top of the component

  // AI Strategy settings handler
  const handleSaveAISettings = (settings: Event[]) => {
    logger.log('AI Strategy settings saved:', settings);
    // Here we would send these settings to the backend
    setShowStrategy(false);
  };

  // Custom keyboard shortcuts with actions
  const customShortcuts = [
    {
      key: 'b',
      description: 'Quick buy order',
      group: 'Trading',
      action: () => setOrderSide('buy'),
    },
    {
      key: 's',
      description: 'Quick sell order',
      group: 'Trading',
      action: () => setOrderSide('sell'),
    },
    {
      key: 'm',
      description: 'Market order',
      group: 'Trading',
      action: () => setOrderType('market'),
    },
    { key: 'l', description: 'Limit order', group: 'Trading', action: () => setOrderType('limit') },

    // Chart controls
    {
      key: '1',
      description: 'Line chart',
      group: 'Charts',
      action: () => logger.log('Changed to line chart'),
    },
    {
      key: '2',
      description: 'Candle chart',
      group: 'Charts',
      action: () => logger.log('Changed to candle chart'),
    },

    // Show/hide components
    {
      key: 'a',
      altKey: true,
      description: 'Show AI assistant',
      group: 'AI',
      action: handleOpenAIChat,
    },
    {
      key: 's',
      altKey: true,
      description: 'Show strategy settings',
      group: 'AI',
      action: handleOpenStrategy,
    },
  ];

  return (
    <div className="min-h-full p-6 relative">
      {/* Floating Toolbar */}
      <FloatingToolbar tabs={toolbarTabs} position="bottom" variant="neon" />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        shortcuts={customShortcuts}
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* AI Strategy Settings Dialog */}
      {showStrategy && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-[#00FF80]/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <Brain size={24} className="mr-2 text-[#00FF80]" />
                  AI Trading Strategy Settings
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowStrategy(false)}
                >
                  <X size={18} />
                </Button>
              </div>

              <AIStrategySettings
                onSave={async settings => {
                  logger.log('AI Strategy settings saved:', settings);
                  // Send settings to the backend
                  try {
                    setProcessing(true);

                    const response = await fetch('/api/trading/user-strategies', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
// @ts-ignore
                        name: `${settings.riskProfile.charAt(0).toUpperCase() + settings.riskProfile.slice(1)} Strategy`,
// @ts-ignore
                        description: `AI ${settings.aiLevel} strategy with ${settings.riskProfile} risk profile`,
                        settings: settings,
                        isActive: true,
                      }),
                    });

                    if (response.ok) {
                      // Refresh strategies
                      const userStrategiesResponse = await fetch('/api/trading/user-strategies');
                      if (userStrategiesResponse.ok) {
                        setUserStrategies(await userStrategiesResponse.json());
                      }

                      // Show success notification
                      logger.log('Strategy saved successfully');
                    } else {
                      logger.error('Failed to save strategy:', await response.text());
                    }
                  } catch (error) {
                    logger.error('Error saving AI strategy settings:', error);
                  } finally {
                    setProcessing(false);
                    setShowStrategy(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Back Navigation */}
      <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <CryptoCard className="h-[560px] flex flex-col relative">
            <CryptoCardHeader>
              <div className="flex items-center">
                {selectedToken && (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-semibold">{selectedToken.symbol[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-lg">{selectedToken.symbol}/USDC</span>
                        {selectedToken.change24h !== 0 && (
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              selectedToken.change24h > 0
                                ? 'bg-green-900/20 text-green-400 border-green-500/20'
                                : 'bg-red-900/20 text-red-400 border-red-500/20'
                            }`}
                          >
                            {selectedToken.change24h > 0 ? (
                              <ArrowUp size={12} className="mr-1" />
                            ) : (
                              <ArrowDown size={12} className="mr-1" />
                            )}
                            {formatPercentage(selectedToken.change24h)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatCurrency(selectedToken.price)}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div>
                <Button size="sm" variant="outline" className="h-8">
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </Button>
              </div>
            </CryptoCardHeader>

            <CryptoCardContent className="flex-1 mt-4 -mx-5 relative">
              <div className="h-full w-full">
                <TradingViewWidget symbol={`${selectedToken?.symbol || 'SOL'}USDC`} />
              </div>

              {/* Chart Controls */}
              <ChartControls
                variant="neon"
                position="top"
                orientation="horizontal"
                onChartTypeChange={type => logger.log('Chart type changed:', type)}
                onTimeframeChange={tf => logger.log('Timeframe changed:', tf)}
                onIndicatorAdd={indicator => logger.log('Added indicator:', indicator)}
              />

              {/* Gooey Menu for trading actions */}
              <GooeyMenu
                mainIcon={<Rocket size={20} />}
                items={gooeyMenuItems}
                position="bottom-right"
                direction="radial"
                variant="neon"
                size="md"
              />
            </CryptoCardContent>
          </CryptoCard>

          {/* Trading Signals & AI Recommendations */}
          <CryptoCard className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">AI Trading Signals</h3>
              <Badge
                variant="outline"
                className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/30"
              >
                <Brain size={12} className="mr-1.5" />
                AI-Powered
              </Badge>
            </div>

            {signals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {signals.slice(0, 3).map(signal => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onApply={signal => {
                      // Set the order form with this signal
                      if (signal.token && selectedToken?.symbol !== signal.token) {
                        const matchingToken = tokens.find(t => t.symbol === signal.token);
                        if (matchingToken) {
                          setSelectedToken(matchingToken);
                        }
                      }

                      setOrderSide(signal.type === 'buy' ? 'buy' : 'sell');

                      // Set a default amount
                      if (signal.type === 'buy') {
                        setAmount('1.0');
                      } else {
                        setAmount('0.5');
                      }

                      // For limit orders, set the price
                      if (orderType === 'limit') {
                        setLimitPrice(signal.entryPrice.toString());
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-400">Loading AI trading signals...</p>
              </div>
            )}

            <div className="mt-4 text-right">
              <Button
                variant="link"
                className="text-[#00FF80] hover:text-[#00FF80]/80"
                onClick={() => (window.location.href = '/signals')}
              >
                View all signals →
              </Button>
            </div>
          </CryptoCard>

          {/* AI Active Positions */}
          <CryptoCard className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Active AI Positions</h3>
              <Badge
                variant={positions.length > 0 ? 'outline' : 'secondary'}
                className={
                  positions.length > 0
                    ? 'bg-green-900/20 text-green-400 border-green-500/20'
                    : 'bg-gray-900/20 text-gray-400'
                }
              >
                {positions.length > 0 ? (
                  <>
                    <CheckCircle2 size={12} className="mr-1.5" />
                    {positions.length} Active
                  </>
                ) : (
                  <>
                    <Info size={12} className="mr-1.5" />
                    No Active Positions
                  </>
                )}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-xs text-gray-400 font-medium">Token</th>
                    <th className="text-left p-3 text-xs text-gray-400 font-medium">Type</th>
                    <th className="text-left p-3 text-xs text-gray-400 font-medium">Entry Price</th>
                    <th className="text-right p-3 text-xs text-gray-400 font-medium">Current</th>
                    <th className="text-right p-3 text-xs text-gray-400 font-medium">PnL</th>
                    <th className="text-right p-3 text-xs text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length > 0 ? (
                    positions.map((position: unknown, index: number) => (
// @ts-ignore
                      <tr key={position.id || index} className="border-b border-white/5">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center mr-2">
                              <span className="text-xs font-medium">
// @ts-ignore
                                {position.tokenSymbol?.[0] || '?'}
                              </span>
                            </div>
// @ts-ignore
                            {position.tokenSymbol || 'Unknown'}
                          </div>
                        </td>
                        <td
// @ts-ignore
                          className={`p-3 ${position.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}
                        >
// @ts-ignore
                          {position.type === 'buy' ? 'Long' : 'Short'}
                        </td>
// @ts-ignore
                        <td className="p-3">{formatCurrency(position.entryPrice || 0)}</td>
                        <td className="p-3 text-right">
// @ts-ignore
                          {formatCurrency(position.currentPrice || 0)}
                        </td>
                        <td
                          className={`p-3 text-right ${
// @ts-ignore
                            (position.pnl || 0) > 0
                              ? 'text-green-400'
// @ts-ignore
                              : (position.pnl || 0) < 0
                                ? 'text-red-400'
                                : ''
                          }`}
                        >
// @ts-ignore
                          {formatPercentage(position.pnl || 0)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => {
                              // Close position via API
// @ts-ignore
                              fetch(`/api/trading/positions/${position.id}`, {
                                method: 'DELETE',
                              }).then(() => {
                                // Refresh positions
                                fetch('/api/trading/positions').then(res => {
                                  if (res.ok) res.json().then(setPositions);
                                });
                              });
                            }}
                          >
                            Close
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-white/5">
                      <td colSpan={6} className="p-6 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <AlertCircle size={24} className="mb-2" />
                          <p>No AI trading positions active.</p>
                          <p className="text-sm mt-1">
                            Configure your AI trading strategy to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CryptoCard>
        </div>

        {/* Order Form */}
        <div>
          <CryptoCard className="mb-6" variant={orderSide === 'buy' ? 'success' : 'danger'}>
            <Tabs value={orderSide} onValueChange={v => setOrderSide(v as 'buy' | 'sell')}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="buy" className="flex-1">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="flex-1">
                  Sell
                </TabsTrigger>
              </TabsList>

              <div className="mb-6">
                <Tabs value={orderType} onValueChange={v => setOrderType(v as 'market' | 'limit')}>
                  <TabsList className="w-full">
                    <TabsTrigger value="market" className="flex-1">
                      Market
                    </TabsTrigger>
                    <TabsTrigger value="limit" className="flex-1">
                      Limit
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <TabsContent value="buy" className="mt-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSubmitOrder();
                  }}
                >
                  <div className="space-y-4">
                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Token</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full p-3 bg-black/20 border border-white/10 rounded-md text-white"
                          onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                        >
                          {selectedToken ? (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-semibold">
                                  {selectedToken.symbol[0]}
                                </span>
                              </div>
                              <span>{selectedToken.symbol}</span>
                            </div>
                          ) : (
                            <span>Select token</span>
                          )}
                          <ChevronDown size={18} />
                        </button>

                        {isTokenDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-md z-10 max-h-60 overflow-y-auto">
                            {tokens.map(token => (
                              <div
                                key={token.symbol}
                                className="flex items-center p-2 hover:bg-white/5 rounded-md cursor-pointer"
                                onClick={() => handleSelectToken(token)}
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold">{token.symbol[0]}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span>{token.symbol}</span>
                                  <span className="text-xs text-gray-400">{token.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount</label>
                      <div className="relative">
                        <Input
                          type="text"
                          className="bg-black/20 border-white/10 pr-16"
                          placeholder="0.00"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          {selectedToken?.symbol}
                        </div>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="pt-2 pb-4">
                      <Slider
                        defaultValue={[0]}
                        max={100}
                        step={1}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        className={orderSide === 'buy' ? 'bg-green-900/20' : 'bg-red-900/20'}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Limit Price (only for limit orders) */}
                    {orderType === 'limit' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Limit Price</label>
                        <div className="relative">
                          <Input
                            type="text"
                            className="bg-black/20 border-white/10 pr-16"
                            placeholder="0.00"
                            value={limitPrice}
                            onChange={e => setLimitPrice(e.target.value)}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            USDC
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-black/20 rounded-md p-3 border border-white/5">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Price</span>
                        <span>
                          {orderType === 'market'
                            ? formatCurrency(selectedToken?.price || 0)
                            : limitPrice
                              ? formatCurrency(parseFloat(limitPrice))
                              : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                        <span>Fee (0.1%)</span>
                        <span>{formatCurrency(calculateTotal() * 0.001)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className={`w-full ${
                        orderSide === 'buy'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      disabled={
                        !selectedToken ||
                        !amount ||
                        isNaN(parseFloat(amount)) ||
                        parseFloat(amount) <= 0 ||
                        (orderType === 'limit' && (!limitPrice || isNaN(parseFloat(limitPrice)))) ||
                        !connected ||
                        processing
                      }
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Processing...
                        </div>
                      ) : orderSuccess ? (
                        <div className="flex items-center">Order Successful!</div>
                      ) : (
                        <div>
                          {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedToken?.symbol}
                        </div>
                      )}
                    </Button>

                    {!connected && (
                      <div className="flex items-center justify-center text-sm text-amber-400 mt-2">
                        <Info size={14} className="mr-1" />
                        Connect wallet to trade
                      </div>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="sell" className="mt-0">
                {/* Same form but for selling */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSubmitOrder();
                  }}
                >
                  {/* Same fields as buy form */}
                  <div className="space-y-4">
                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Token</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full p-3 bg-black/20 border border-white/10 rounded-md text-white"
                          onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                        >
                          {selectedToken ? (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-semibold">
                                  {selectedToken.symbol[0]}
                                </span>
                              </div>
                              <span>{selectedToken.symbol}</span>
                            </div>
                          ) : (
                            <span>Select token</span>
                          )}
                          <ChevronDown size={18} />
                        </button>

                        {isTokenDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-md z-10 max-h-60 overflow-y-auto">
                            {tokens.map(token => (
                              <div
                                key={token.symbol}
                                className="flex items-center p-2 hover:bg-white/5 rounded-md cursor-pointer"
                                onClick={() => handleSelectToken(token)}
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold">{token.symbol[0]}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span>{token.symbol}</span>
                                  <span className="text-xs text-gray-400">{token.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount</label>
                      <div className="relative">
                        <Input
                          type="text"
                          className="bg-black/20 border-white/10 pr-16"
                          placeholder="0.00"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          {selectedToken?.symbol}
                        </div>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="pt-2 pb-4">
                      <Slider
                        defaultValue={[0]}
                        max={100}
                        step={1}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        className={orderSide === 'buy' ? 'bg-green-900/20' : 'bg-red-900/20'}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Limit Price (only for limit orders) */}
                    {orderType === 'limit' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Limit Price</label>
                        <div className="relative">
                          <Input
                            type="text"
                            className="bg-black/20 border-white/10 pr-16"
                            placeholder="0.00"
                            value={limitPrice}
                            onChange={e => setLimitPrice(e.target.value)}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            USDC
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-black/20 rounded-md p-3 border border-white/5">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Price</span>
                        <span>
                          {orderType === 'market'
                            ? formatCurrency(selectedToken?.price || 0)
                            : limitPrice
                              ? formatCurrency(parseFloat(limitPrice))
                              : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                        <span>Fee (0.1%)</span>
                        <span>{formatCurrency(calculateTotal() * 0.001)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className={`w-full ${
                        orderSide === 'buy'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      disabled={
                        !selectedToken ||
                        !amount ||
                        isNaN(parseFloat(amount)) ||
                        parseFloat(amount) <= 0 ||
                        (orderType === 'limit' && (!limitPrice || isNaN(parseFloat(limitPrice)))) ||
                        !connected ||
                        processing
                      }
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Processing...
                        </div>
                      ) : orderSuccess ? (
                        <div className="flex items-center">Order Successful!</div>
                      ) : (
                        <div>
                          {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedToken?.symbol}
                        </div>
                      )}
                    </Button>

                    {!connected && (
                      <div className="flex items-center justify-center text-sm text-amber-400 mt-2">
                        <Info size={14} className="mr-1" />
                        Connect wallet to trade
                      </div>
                    )}
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CryptoCard>

          {/* Order Book */}
          <CryptoCard>
            <h3 className="text-lg font-medium mb-4">Order Book</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Price (USDC)</span>
                  <span>Amount</span>
                </div>

                {/* Sell orders (red) */}
                <div className="space-y-1">
                  {[1.05, 1.04, 1.03, 1.02, 1.01].map((multiplier, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-400">
                        {formatCurrency((selectedToken?.price || 0) * multiplier)}
                      </span>
                      <span>{(Math.random() * 10).toFixed(4)}</span>
                      <div
                        className="absolute right-0 h-6 bg-red-500/10"
                        style={{
                          width: `${20 + Math.random() * 30}%`,
                          transform: 'translateY(-4px)',
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Spread */}
                <div className="my-2 flex justify-between text-xs text-gray-400 border-y border-white/10 py-1">
                  <span>Spread</span>
                  <span>0.12%</span>
                </div>

                {/* Buy orders (green) */}
                <div className="space-y-1">
                  {[0.99, 0.98, 0.97, 0.96, 0.95].map((multiplier, index) => (
                    <div key={index} className="flex justify-between text-sm relative">
                      <span className="text-green-400">
                        {formatCurrency((selectedToken?.price || 0) * multiplier)}
                      </span>
                      <span>{(Math.random() * 10).toFixed(4)}</span>
                      <div
                        className="absolute right-0 h-6 bg-green-500/10"
                        style={{
                          width: `${20 + Math.random() * 30}%`,
                          transform: 'translateY(-4px)',
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-3">Market Activity</h4>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <CircleDollarSign size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-300">24h Volume</span>
                  </div>
                  <span>{formatCurrency(selectedToken?.volume24h || 0, 'USD', true)}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <WalletIcon size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-300">Market Orders</span>
                  </div>
                  <span>2,345</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-300">Last Updated</span>
                  </div>
                  <span className="text-sm">Just now</span>
                </div>
              </div>
            </div>
          </CryptoCard>
        </div>
      </div>
    </div>
  );
}
