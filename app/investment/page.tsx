'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenSearch } from '@/components/TokenSearch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { useWalletContext } from '@/context/WalletContext';
import {
  Target,
  TrendingUp,
  Zap,
  Bot,
  BarChart4,
  BrainCircuit,
  ChevronRight,
  CandlestickChart,
  Wallet,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  targetReturn: string;
  timeline: string;
  aiPowered: boolean;
  popularityScore: number;
  color: string;
  icon: React.ReactNode;
}

interface AISignal {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  timestamp: number;
  price: number;
  reason: string;
}

export default function InvestmentPage() {
  const { isConnected: connected } = useWalletContext();
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('100');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);

  // Mock investment strategies
  const strategies: InvestmentStrategy[] = [
    {
      id: 'ai-growth',
      name: 'AI Growth Portfolio',
      description:
        'AI-powered strategy focusing on high-growth Solana tokens with strong fundamentals and momentum.',
      riskLevel: 'Medium',
      targetReturn: '15-25% annually',
      timeline: '3-6 months',
      aiPowered: true,
      popularityScore: 92,
      color: 'emerald',
      icon: <BrainCircuit />,
    },
    {
      id: 'momentum',
      name: 'Momentum Strategy',
      description:
        'Targets tokens showing strong upward price movement and volume with technical confirmation.',
      riskLevel: 'High',
      targetReturn: '20-35% annually',
      timeline: '1-3 months',
      aiPowered: true,
      popularityScore: 87,
      color: 'blue',
      icon: <TrendingUp />,
    },
    {
      id: 'core-hodl',
      name: 'Core Holding Strategy',
      description:
        'Long-term holding of established Solana ecosystem tokens with strong fundamentals.',
      riskLevel: 'Low',
      targetReturn: '10-15% annually',
      timeline: '1+ years',
      aiPowered: false,
      popularityScore: 79,
      color: 'purple',
      icon: <Target />,
    },
    {
      id: 'defi-yield',
      name: 'DeFi Yield Optimizer',
      description: 'Maximizes yield through strategic positions in Solana DeFi protocols.',
      riskLevel: 'Medium',
      targetReturn: '12-20% annually',
      timeline: '3-12 months',
      aiPowered: true,
      popularityScore: 83,
      color: 'yellow',
      icon: <Zap />,
    },
  ];

  // Mock AI signals
  const aiSignals: AISignal[] = [
    {
      id: 'signal-1',
      tokenName: 'Solana',
      tokenSymbol: 'SOL',
      type: 'buy',
      confidence: 87,
      timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      price: 147.82,
      reason: 'Positive momentum with increasing on-chain activity and developer engagement.',
    },
    {
      id: 'signal-2',
      tokenName: 'Jupiter',
      tokenSymbol: 'JUP',
      type: 'buy',
      confidence: 82,
      timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
      price: 1.27,
      reason: 'Strong volume growth and expanding market dominance in Solana DEX ecosystem.',
    },
    {
      id: 'signal-3',
      tokenName: 'Jito',
      tokenSymbol: 'JTO',
      type: 'hold',
      confidence: 65,
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 24 hours ago
      price: 3.85,
      reason: 'Consolidating after recent price increase; monitoring for next move.',
    },
    {
      id: 'signal-4',
      tokenName: 'Pyth Network',
      tokenSymbol: 'PYTH',
      type: 'sell',
      confidence: 71,
      timestamp: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
      price: 0.48,
      reason: 'Technical indicators suggest short-term overbought conditions.',
    },
  ];

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Handle investment submission
  const handleInvestment = () => {
    if (!connected) {
      alert('Please connect your wallet to invest');
      return;
    }

    if (!selectedToken) {
      alert('Please select a token to invest in');
      return;
    }

    if (!activeStrategyId) {
      alert('Please select an investment strategy');
      return;
    }

    setShowConfirmation(true);
  };

  // Get color for risk level
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'High':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  // Get color for signal type
  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      case 'hold':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-cyber tracking-wider text-emerald-400">AI INVESTMENT</h1>
          <p className="text-muted-foreground">
            AI-powered investment strategies for Solana tokens
          </p>
        </div>

        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg">
            <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your Solana wallet to access AI-powered investment strategies
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <>
            {/* Investment Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column - Investment Form */}
              <div className="lg:col-span-2">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-semibold">Create Investment</h2>
                  </div>
                  <div className="p-5 space-y-5">
                    {showConfirmation ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                            <CandlestickChart className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-semibold mb-1">Confirm Your Investment</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Review and confirm your investment details
                          </p>
                        </div>

                        <div className="space-y-4 border border-border rounded-lg p-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token</span>
                            <span className="font-medium">
                              {selectedToken?.name} ({selectedToken?.symbol})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Amount</span>
                            <span className="font-medium">${investmentAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Strategy</span>
                            <span className="font-medium">
                              {strategies.find(s => s.id === activeStrategyId)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Level</span>
                            <span
                              className={getRiskColor(
                                strategies.find(s => s.id === activeStrategyId)?.riskLevel ||
                                  'Medium'
                              )}
                            >
                              {strategies.find(s => s.id === activeStrategyId)?.riskLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">AI Powered</span>
                            <span className="font-medium">
                              {strategies.find(s => s.id === activeStrategyId)?.aiPowered
                                ? 'Yes'
                                : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated Return</span>
                            <span className="font-medium text-primary">
                              {strategies.find(s => s.id === activeStrategyId)?.targetReturn}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowConfirmation(false)}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button className="flex-1 bg-primary text-primary-foreground" disabled>
                            Confirm Investment
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Select Token</label>
                          <TokenSearch onSelectToken={setSelectedToken} />
                          {selectedToken && (
                            <div className="flex items-center p-2 bg-primary/5 rounded-md">
                              <img
                                src={selectedToken.image}
                                alt={selectedToken.name}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-medium">{selectedToken.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {selectedToken.symbol}
                                </div>
                              </div>
                              <div className="ml-auto text-right">
                                <div className="font-mono">
                                  ${selectedToken.current_price.toLocaleString()}
                                </div>
                                <div
                                  className={`text-xs ${selectedToken.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  {selectedToken.price_change_percentage_24h >= 0 ? '+' : ''}
                                  {selectedToken.price_change_percentage_24h.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Investment Amount</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-muted-foreground">$</span>
                            </div>
                            <Input
                              type="number"
                              value={investmentAmount}
                              onChange={e => setInvestmentAmount(e.target.value)}
                              className="pl-8"
                              placeholder="Enter amount in USD"
                            />
                          </div>
                          <div className="flex space-x-2">
                            {['100', '500', '1000', '5000'].map(amount => (
                              <Button
                                key={amount}
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => setInvestmentAmount(amount)}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Select Strategy</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {strategies.map(strategy => (
                              <div
                                key={strategy.id}
                                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                  activeStrategyId === strategy.id
                                    ? `border-${strategy.color}-500 bg-${strategy.color}-500/10`
                                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                }`}
                                onClick={() => setActiveStrategyId(strategy.id)}
                              >
                                <div className="flex items-start">
                                  <div
                                    className={`p-2 rounded-md bg-${strategy.color}-500/10 text-${strategy.color}-500 mr-3`}
                                  >
                                    {strategy.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-medium leading-none mb-1">
                                      {strategy.name}
                                    </h3>
                                    <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {strategy.description}
                                    </div>
                                    <div className="flex items-center text-xs space-x-3">
                                      <span className={getRiskColor(strategy.riskLevel)}>
                                        {strategy.riskLevel} Risk
                                      </span>
                                      <span className="text-primary">{strategy.targetReturn}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full bg-primary text-primary-foreground"
                          onClick={handleInvestment}
                          disabled={!selectedToken || !activeStrategyId}
                        >
                          Create Investment
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column - AI Signals */}
              <div className="lg:col-span-1">
                <Card className="border border-border bg-card overflow-hidden h-full">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 text-primary mr-2" />
                      <h2 className="text-xl font-semibold">TradesXBT Signals</h2>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {aiSignals.map(signal => (
                      <div key={signal.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{signal.tokenName}</div>
                          <div
                            className={`uppercase font-bold text-sm ${getSignalColor(signal.type)}`}
                          >
                            {signal.type}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {formatDate(signal.timestamp)}
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="text-xs mr-2">Confidence</div>
                          <div className="flex-1">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${signal.confidence}%`,
                                  backgroundColor:
                                    signal.confidence > 80
                                      ? '#10B981'
                                      : signal.confidence > 60
                                        ? '#F59E0B'
                                        : '#EF4444',
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs ml-2 font-medium">{signal.confidence}%</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{signal.reason}</div>
                        <div className="flex justify-between text-xs mt-3">
                          <div>
                            Price: <span className="font-mono">${signal.price}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-primary text-xs"
                            disabled
                          >
                            Details
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Strategies & History Tabs */}
            <Tabs defaultValue="strategies">
              <TabsList className="mb-4">
                <TabsTrigger value="strategies">
                  <Target className="h-4 w-4 mr-1.5" />
                  Strategies
                </TabsTrigger>
                <TabsTrigger value="history">
                  <BarChart4 className="h-4 w-4 mr-1.5" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <BrainCircuit className="h-4 w-4 mr-1.5" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="strategies">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold">Investment Strategies</h3>
                  </div>
                  <div className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Strategy
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Risk
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              AI Powered
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Target Return
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Popularity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {strategies.map(strategy => (
                            <tr
                              key={strategy.id}
                              className="hover:bg-muted/50 cursor-pointer"
                              onClick={() => setActiveStrategyId(strategy.id)}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className={`p-1.5 rounded-md bg-${strategy.color}-500/10 text-${strategy.color}-500 mr-3`}
                                  >
                                    {strategy.icon}
                                  </div>
                                  <div className="font-medium">{strategy.name}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {strategy.description}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                    strategy.riskLevel === 'Low'
                                      ? 'bg-green-500/10 text-green-500'
                                      : strategy.riskLevel === 'Medium'
                                        ? 'bg-yellow-500/10 text-yellow-500'
                                        : 'bg-red-500/10 text-red-500'
                                  }`}
                                >
                                  {strategy.riskLevel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {strategy.aiPowered ? (
                                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                    <Bot className="h-3 w-3 mr-1" />
                                    AI Powered
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                    Manual
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-primary font-medium">
                                {strategy.targetReturn}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end">
                                  <span className="mr-2 font-medium">
                                    {strategy.popularityScore}
                                  </span>
                                  <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${strategy.popularityScore}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-lg font-semibold">Strategy Performance</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-center text-muted-foreground mb-6">
                        Performance metrics will be available after making your first investment.
                      </p>

                      <div className="space-y-4">
                        {strategies.map(strategy => (
                          <div key={strategy.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`p-1.5 rounded-md bg-${strategy.color}-500/10 text-${strategy.color}-500 mr-2`}
                                >
                                  {strategy.icon}
                                </div>
                                <span className="text-sm font-medium">{strategy.name}</span>
                              </div>
                              <span className="text-sm text-primary font-medium">
                                {strategy.targetReturn.split('-')[1]}
                              </span>
                            </div>
                            <Progress value={70} max={100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-lg font-semibold">Market Conditions</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">Market Sentiment</h4>
                            <span className="text-sm text-green-500">Bullish</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Bearish</span>
                            <span>Neutral</span>
                            <span>Bullish</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">Market Volatility</h4>
                            <span className="text-sm text-yellow-500">Medium</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                              style={{ width: '50%' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">AI Confidence</h4>
                            <span className="text-sm text-green-500">High (87%)</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: '87%' }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <h4 className="text-sm font-medium mb-3">
                            Current Recommended Allocation
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center border border-border rounded-lg p-2">
                              <div className="text-2xl font-bold text-primary">60%</div>
                              <div className="text-xs text-muted-foreground text-center">
                                Large Cap
                              </div>
                            </div>
                            <div className="flex flex-col items-center border border-border rounded-lg p-2">
                              <div className="text-2xl font-bold text-primary">30%</div>
                              <div className="text-xs text-muted-foreground text-center">
                                Mid Cap
                              </div>
                            </div>
                            <div className="flex flex-col items-center border border-border rounded-lg p-2">
                              <div className="text-2xl font-bold text-primary">10%</div>
                              <div className="text-xs text-muted-foreground text-center">
                                Small Cap
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center">
                      <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-lg font-semibold">AI Market Insights</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="text-lg font-medium mb-2">Current Market Analysis</h4>
                        <p className="text-muted-foreground mb-4">
                          Market sentiment for Solana ecosystem is currently positive with strong
                          bullish indicators. On-chain metrics show increasing adoption and
                          transaction volume, suggesting continued growth potential.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-background p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                            <div className="font-medium text-green-500">Bullish</div>
                          </div>
                          <div className="bg-background p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Volatility</div>
                            <div className="font-medium text-yellow-500">Medium</div>
                          </div>
                          <div className="bg-background p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Trend</div>
                            <div className="font-medium text-green-500">Upward</div>
                          </div>
                          <div className="bg-background p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Risk</div>
                            <div className="font-medium text-yellow-500">Moderate</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-3">Token Opportunities</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                                SOL
                              </div>
                              <div>
                                <div className="font-medium">Solana</div>
                                <div className="text-xs text-muted-foreground">
                                  Layer 1 Blockchain
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-green-500">Strong Buy</div>
                              <div className="text-xs text-muted-foreground">93% Confidence</div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                                JUP
                              </div>
                              <div>
                                <div className="font-medium">Jupiter</div>
                                <div className="text-xs text-muted-foreground">DEX Aggregator</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-green-500">Buy</div>
                              <div className="text-xs text-muted-foreground">87% Confidence</div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                                JTO
                              </div>
                              <div>
                                <div className="font-medium">Jito</div>
                                <div className="text-xs text-muted-foreground">MEV Protocol</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-yellow-500">Hold</div>
                              <div className="text-xs text-muted-foreground">65% Confidence</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h4 className="text-lg font-medium mb-3">TradesXBT Recommendation</h4>
                        <p className="text-muted-foreground mb-4">
                          Based on current market conditions and AI analysis, the following
                          allocation strategy is recommended:
                        </p>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1">Recommended Strategy</div>
                              <div className="flex items-center text-primary">
                                <BrainCircuit className="h-4 w-4 mr-1.5" />
                                <span className="font-medium">AI Growth Portfolio</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Risk Level</div>
                              <div className="text-yellow-500">Medium</div>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setActiveStrategyId('ai-growth');
                              document
                                .getElementById('top')
                                ?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-primary text-primary-foreground"
                          >
                            Apply Strategy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
