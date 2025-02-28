import React from 'react';
import { X, Layout, Layers, Check } from 'lucide-react';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    layout: string;
    visibleCards: string[];
    cardOrder: string[];
  };
  onUpdateConfig: (newConfig: Event) => void;
}

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  // List of all available cards
  const availableCards = [
    { id: 'agentProfile', label: 'AI Agent Profile' },
    { id: 'investmentTotals', label: 'Investment Totals' },
    { id: 'tradingSignals', label: 'Trading Signals' },
    { id: 'socialStats', label: 'Social Media Stats' },
    { id: 'fundStats', label: 'Fund Performance' },
    { id: 'tokenSearch', label: 'Token Search' },
  ];

  // Available layout options
  const layoutOptions = [
    { id: 'default', label: 'Default (3 columns)' },
    { id: 'compact', label: 'Compact (4 columns)' },
    { id: 'wide', label: 'Wide (2 columns)' },
  ];

  // Toggle card visibility
  const toggleCardVisibility = (cardId: string) => {
    if (config.visibleCards.includes(cardId)) {
      // Remove card from visible cards and card order
      const newVisibleCards = config.visibleCards.filter(id => id !== cardId);
      const newCardOrder = config.cardOrder.filter(id => id !== cardId);
      onUpdateConfig({
        ...config,
        visibleCards: newVisibleCards,
        cardOrder: newCardOrder,
      });
    } else {
      // Add card to visible cards and card order
      onUpdateConfig({
        ...config,
        visibleCards: [...config.visibleCards, cardId],
        cardOrder: [...config.cardOrder, cardId],
      });
    }
  };

  // Handle layout selection
  const handleLayoutChange = (layoutId: string) => {
    onUpdateConfig({
      ...config,
      layout: layoutId,
    });
  };

  // Reset to default configuration
  const resetToDefault = () => {
    onUpdateConfig({
      layout: 'default',
      visibleCards: ['agentProfile', 'tradingSignals', 'tokenSearch', 'fundStats', 'socialStats'],
      cardOrder: ['agentProfile', 'tradingSignals', 'tokenSearch', 'fundStats', 'socialStats'],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-sapphire-900 border border-emerald-400/30 rounded-lg w-full max-w-md mx-4 md:mx-0 overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-cyber text-emerald-400">Dashboard Settings</h3>
            <button
              onClick={onClose}
              className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Layout Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-emerald-400" />
              <h4 className="text-emerald-400 font-medium">Layout</h4>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {layoutOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleLayoutChange(option.id)}
                  className={`flex items-center justify-between px-4 py-2 rounded-md ${
                    config.layout === option.id
                      ? 'bg-emerald-400/20 border border-emerald-400/30'
                      : 'bg-sapphire-800/60 hover:bg-sapphire-800 border border-transparent'
                  }`}
                >
                  <span
                    className={
                      config.layout === option.id ? 'text-emerald-400' : 'text-emerald-400/70'
                    }
                  >
                    {option.label}
                  </span>
                  {config.layout === option.id && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Card Visibility */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-emerald-400 font-medium">Visible Cards</h4>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => toggleCardVisibility(card.id)}
                  className={`flex items-center justify-between px-4 py-2 rounded-md ${
                    config.visibleCards.includes(card.id)
                      ? 'bg-emerald-400/20 border border-emerald-400/30'
                      : 'bg-sapphire-800/60 hover:bg-sapphire-800 border border-transparent'
                  }`}
                >
                  <span
                    className={
                      config.visibleCards.includes(card.id)
                        ? 'text-emerald-400'
                        : 'text-emerald-400/70'
                    }
                  >
                    {card.label}
                  </span>
                  {config.visibleCards.includes(card.id) && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-sapphire-800 hover:bg-sapphire-700 text-emerald-400/80 rounded-md text-sm"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-sapphire-900 rounded-md text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
