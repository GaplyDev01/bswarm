import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Target,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TradingSignal } from '@/lib/trading-signals';

interface SignalCardProps {
  signal: TradingSignal;
  onApply?: (signal: TradingSignal) => void;
  className?: string;
}

export function SignalCard({ signal, onApply, className = '' }: SignalCardProps) {
  const isBuy = signal.type === 'buy';
  const isSell = signal.type === 'sell';
  const signalAge = Math.floor((Date.now() - signal.timestamp) / (1000 * 60)); // minutes

  // Format time ago
  const formatTimeAgo = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Format confidence as color and text
  const getConfidenceData = (confidence: number) => {
    if (confidence >= 80) return { color: 'text-green-400', text: 'Very High' };
    if (confidence >= 60) return { color: 'text-green-300', text: 'High' };
    if (confidence >= 40) return { color: 'text-yellow-300', text: 'Medium' };
    if (confidence >= 20) return { color: 'text-orange-300', text: 'Low' };
    return { color: 'text-red-300', text: 'Very Low' };
  };

  const confidenceData = getConfidenceData(signal.confidence);

  // Handle apply signal
  const handleApply = () => {
    if (onApply) {
      onApply(signal);
    }
  };

  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-lg border ${
        isBuy
          ? 'border-green-500/20 hover:border-green-500/30'
          : isSell
            ? 'border-red-500/20 hover:border-red-500/30'
            : 'border-gray-500/20 hover:border-gray-500/30'
      } p-4 transition-all ${className}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-lg ${
              isBuy ? 'bg-green-900/30' : isSell ? 'bg-red-900/30' : 'bg-gray-800'
            } flex items-center justify-center mr-3`}
          >
            {isBuy ? (
              <TrendingUp size={20} className="text-green-400" />
            ) : isSell ? (
              <TrendingDown size={20} className="text-red-400" />
            ) : (
              <BarChart2 size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg flex items-center">
              {signal.token}
              <span className="text-xs text-gray-400 ml-2">/ USDC</span>
              <Badge
                variant="outline"
                className={`ml-2 ${
                  isBuy
                    ? 'bg-green-900/20 text-green-400 border-green-500/20'
                    : isSell
                      ? 'bg-red-900/20 text-red-400 border-red-500/20'
                      : 'bg-gray-900/20 text-gray-400 border-gray-500/20'
                }`}
              >
                {isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD'}
              </Badge>
            </h3>
            <div className="text-sm text-gray-400">{signal.tokenName}</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <Clock size={14} className="mr-1" />
          <span>{formatTimeAgo(signalAge)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Entry Price</div>
          <div className="font-medium">{formatCurrency(signal.entryPrice)}</div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Target</div>
          <div className={`font-medium ${isBuy ? 'text-green-400' : isSell ? 'text-red-400' : ''}`}>
            {formatCurrency(signal.targetPrice)}
          </div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
          <div className="font-medium text-red-400">{formatCurrency(signal.stopLoss)}</div>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <div className="text-sm mr-2">Confidence:</div>
          <div className={`text-sm font-medium ${confidenceData.color}`}>
            {confidenceData.text} ({signal.confidence}%)
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-sm mr-2">Timeframe:</div>
          <div className="text-sm font-medium">{signal.timeframe}</div>
        </div>
      </div>

      {/* Indicators */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Indicators</div>
        <div className="flex flex-wrap gap-2">
          {signal.indicators.map((indicator, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`
                ${
                  indicator.signal === 'bullish'
                    ? 'bg-green-900/10 text-green-400 border-green-500/20'
                    : indicator.signal === 'bearish'
                      ? 'bg-red-900/10 text-red-400 border-red-500/20'
                      : 'bg-gray-900/10 text-gray-400 border-gray-500/20'
                }
              `}
            >
              {indicator.name}: {indicator.value}
              {indicator.signal === 'bullish' ? (
                <ArrowUpRight size={12} className="ml-1" />
              ) : indicator.signal === 'bearish' ? (
                <ArrowDownRight size={12} className="ml-1" />
              ) : null}
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-300 mb-4">{signal.reasoning}</div>

      {/* Performance (if available) */}
      {signal.performance && (
        <div
          className={`p-2 rounded mb-4 ${
            signal.performance.success
              ? 'bg-green-900/20 border border-green-500/20'
              : 'bg-red-900/20 border border-red-500/20'
          }`}
        >
          <div className="flex justify-between">
            <div className="text-sm">Status:</div>
            <div
              className={`text-sm font-medium ${
                signal.performance.success ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {signal.performance.success ? 'Target Reached' : 'Stop Loss Hit'}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm">P&L:</div>
            <div
              className={`text-sm font-medium ${
                (signal.performance.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatPercentage(signal.performance.pnl || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        className={`w-full ${
          isBuy
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : isSell
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
        }`}
        onClick={handleApply}
      >
        Apply {isBuy ? 'Buy' : isSell ? 'Sell' : 'Hold'} Signal
      </Button>
    </div>
  );
}
