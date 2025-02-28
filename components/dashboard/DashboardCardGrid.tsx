import React, { useState } from 'react';
import { Grip, X } from 'lucide-react';
import { AgentProfileCard } from './AgentProfileCard';
import { InvestmentTotalsCard } from './InvestmentTotalsCard';
import { TradingSignalsCard } from './TradingSignalsCard';
import { SocialStatsCard } from './SocialStatsCard';
import { FundStatsCard } from './FundStatsCard';
import { TokenSearch } from '@/components/TokenSearch';
import { TokenInfo } from '@/components/TokenInfo';
import { EnhancedTokenChat } from '@/components/EnhancedTokenChat';
import { logger } from '@/lib/logger';

// Mock data for demonstration
const mockTradingSignals = [
  {
    token: 'Solana',
    tokenSymbol: 'SOL',
    direction: 'buy' as const,
    price: 122.45,
    targetPrice: 135.8,
    stopLoss: 115.3,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    confidence: 87,
    timeframe: '4H',
  },
  {
    token: 'Raydium',
    tokenSymbol: 'RAY',
    direction: 'sell' as const,
    price: 0.874,
    targetPrice: 0.785,
    stopLoss: 0.912,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    confidence: 73,
    timeframe: '1D',
  },
];

const mockSocialPosts = [
  {
    content:
      'Our AI predicts a bullish movement for $SOL in the next 24 hours based on on-chain data and social sentiment.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: 152,
    comments: 24,
    shares: 38,
    url: 'https://twitter.com/TradesXBT/status/1',
  },
  {
    content:
      'Just released: New trading signal for $RAY with 73% confidence. Check it out on the dashboard!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 98,
    comments: 12,
    shares: 25,
    url: 'https://twitter.com/TradesXBT/status/2',
  },
];

const mockPerformanceHistory = [
  { period: 'Jan', return: 8.4 },
  { period: 'Feb', return: -3.2 },
  { period: 'Mar', return: 5.7 },
  { period: 'Apr', return: 12.1 },
  { period: 'May', return: -2.3 },
  { period: 'Jun', return: 9.8 },
];

interface DashboardCardGridProps {
  config: {
    layout: string;
    visibleCards: string[];
    cardOrder: string[];
  };
  onUpdateConfig: (newConfig: Event) => void;
  selectedToken: Event;
  onSelectToken: (token: Event) => void;
  customizationMode: boolean;
  onToggleCustomizationMode: () => void;
  // TODO: Replace 'any' with a more specific type
  detailedTokenData?: unknown;
}

export function DashboardCardGrid({
  config,
  onUpdateConfig,
  selectedToken,
  onSelectToken,
  customizationMode,
  onToggleCustomizationMode,
  detailedTokenData,
}: DashboardCardGridProps) {
  const [draggingCard, setDraggingCard] = useState<string | null>(null);

  // Determine responsive column layout based on config
  const getGridColsClass = () => {
    switch (config.layout) {
      case 'compact':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'wide':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';
      default: // default layout
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Toggle card visibility
  const toggleCardVisibility = (cardId: string) => {
    const newVisibleCards = config.visibleCards.includes(cardId)
      ? config.visibleCards.filter(id => id !== cardId)
      : [...config.visibleCards, cardId];

    const newCardOrder = config.visibleCards.includes(cardId)
      ? config.cardOrder.filter(id => id !== cardId)
      : [...config.cardOrder, cardId];

    onUpdateConfig({
      ...config,
      visibleCards: newVisibleCards,
      cardOrder: newCardOrder,
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (!customizationMode) return;
    setDraggingCard(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    // Add ghost image effect
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.4';
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    if (!customizationMode) return;
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    if (!customizationMode || !draggingCard) return;
    e.preventDefault();

    const draggedCardId = e.dataTransfer.getData('text/plain');
    if (draggedCardId === targetCardId) return;

    const draggedIndex = config.cardOrder.indexOf(draggedCardId);
    const targetIndex = config.cardOrder.indexOf(targetCardId);

    const newCardOrder = [...config.cardOrder];
    newCardOrder.splice(draggedIndex, 1);
    newCardOrder.splice(targetIndex, 0, draggedCardId);

    onUpdateConfig({
      ...config,
      cardOrder: newCardOrder,
    });
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    if (!customizationMode) return;
    setDraggingCard(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  // Render card based on ID
  const renderCard = (cardId: string) => {
    const cardProps = {
      draggable: customizationMode,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, cardId),
      onDragOver: handleDragOver,
      onDrop: (e: React.DragEvent) => handleDrop(e, cardId),
      onDragEnd: handleDragEnd,
    };

    // Overlay for customization mode
    const customizationOverlay = customizationMode ? (
      <div className="absolute inset-0 bg-sapphire-900/50 backdrop-blur-sm flex items-center justify-center z-10">
        <button
          onClick={() => toggleCardVisibility(cardId)}
          className="p-2 bg-red-500/80 rounded-full"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-2 left-2 cursor-move">
          <Grip className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
    ) : null;

    switch (cardId) {
      case 'agentProfile':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <AgentProfileCard
              name="TradesXBT"
              role="AI Trading Specialist"
              specialization="Solana Token Analysis"
              status="active"
              performance={{ monthly: 18.7, allTime: 142.3 }}
              className="h-full"
            />
          </div>
        );

      case 'investmentTotals':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <InvestmentTotalsCard
              totalInvested={25000}
              currentValue={32450}
              percentageChange={29.8}
              nextDistributionDate="March 15, 2025"
              nextDistributionAmount={1200}
              investmentStartDate="Jan 10, 2024"
              className="h-full"
            />
          </div>
        );

      case 'tradingSignals':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <TradingSignalsCard signals={mockTradingSignals} className="h-full" />
          </div>
        );

      case 'socialStats':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <SocialStatsCard
              followersCount={12500}
              postsCount={347}
              engagementRate={4.8}
              recentPosts={mockSocialPosts}
              className="h-full"
            />
          </div>
        );

      case 'fundStats':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <FundStatsCard
              aum={8500000}
              monthlyReturn={9.8}
              yearToDateReturn={34.5}
              inceptionReturn={142.3}
              performanceHistory={mockPerformanceHistory}
              investorCount={248}
              className="h-full"
            />
          </div>
        );

      case 'tokenSearch':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <div className="backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden h-full p-6">
              <h3 className="text-xl font-cyber text-emerald-400 mb-4">Token Search</h3>
              <TokenSearch onSelectToken={onSelectToken} />
            </div>
          </div>
        );

      case 'tokenInfo':
        logger.log('TokenInfo card rendering with data:', detailedTokenData);
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <div className="backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden h-full p-6">
              <h3 className="text-xl font-cyber text-emerald-400 mb-4">Token Details</h3>
              {detailedTokenData ? (
                <TokenInfo tokenData={detailedTokenData} />
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Search and select a token to see detailed information
                </div>
              )}
            </div>
          </div>
        );

      case 'aiTokenChat':
        return (
          <div key={cardId} className="relative h-full" {...cardProps}>
            {customizationOverlay}
            <div className="backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden h-full p-6">
              <h3 className="text-xl font-cyber text-emerald-400 mb-4">AI Token Chat</h3>
              <EnhancedTokenChat tokenData={selectedToken} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Available cards list for adding to dashboard
  const availableCards = [
    { id: 'agentProfile', label: 'Agent Profile' },
    { id: 'investmentTotals', label: 'Investment Totals' },
    { id: 'tradingSignals', label: 'Trading Signals' },
    { id: 'socialStats', label: 'Social Stats' },
    { id: 'fundStats', label: 'Fund Stats' },
    { id: 'tokenSearch', label: 'Token Search' },
    { id: 'tokenInfo', label: 'Token Details' },
    { id: 'aiTokenChat', label: 'AI Token Chat' },
  ];

  return (
    <div>
      {/* Customization Controls */}
      {customizationMode && (
        <div className="mb-6 p-4 bg-sapphire-800/50 border border-emerald-400/30 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-cyber text-emerald-400">Customize Dashboard</h3>
            <button
              onClick={onToggleCustomizationMode}
              className="px-4 py-2 bg-emerald-400 text-sapphire-900 rounded-md text-sm font-medium"
            >
              Save Layout
            </button>
          </div>

          <div>
            <p className="text-sm text-emerald-400/80 mb-2">Layout Style:</p>
            <div className="flex gap-2 mb-4">
              {['default', 'compact', 'wide'].map(layout => (
                <button
                  key={layout}
                  onClick={() => onUpdateConfig({ ...config, layout })}
                  className={`px-3 py-1 text-xs rounded-md ${
                    config.layout === layout
                      ? 'bg-emerald-400 text-sapphire-900'
                      : 'bg-sapphire-900/40 text-emerald-400/80 hover:bg-sapphire-800'
                  }`}
                >
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </button>
              ))}
            </div>

            <p className="text-sm text-emerald-400/80 mb-2">Available Cards:</p>
            <div className="flex flex-wrap gap-2">
              {availableCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => toggleCardVisibility(card.id)}
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                    config.visibleCards.includes(card.id)
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                      : 'bg-sapphire-900/40 text-emerald-400/60 hover:bg-sapphire-800'
                  }`}
                >
                  {config.visibleCards.includes(card.id) ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <span>+</span>
                  )}
                  {card.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-emerald-400/60 mt-4">
              Drag and drop cards to rearrange. Click the X to remove from dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div className={`grid ${getGridColsClass()} gap-6`}>
        {config.cardOrder
          .filter(cardId => config.visibleCards.includes(cardId))
          .map(cardId => renderCard(cardId))}
      </div>
    </div>
  );
}
