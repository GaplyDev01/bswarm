import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

interface Signal {
  token: string;
  tokenSymbol: string;
  direction: 'buy' | 'sell';
  price: number;
  targetPrice: number;
  stopLoss: number;
  timestamp: string;
  confidence: number;
  timeframe: string;
}

interface TradingSignalsProps {
  signals: Signal[];
  className?: string;
}

export const TradingSignalsCard: React.FC<TradingSignalsProps> = ({ signals, className = '' }) => {
  const formatPrice = (price: number) => {
    // Handle different price formats based on value
    if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))}d ago`;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div
      className={`backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-cyber text-emerald-400">Latest Trading Signals</h3>
          <div className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            LIVE
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {signals.length > 0 ? (
            signals.map((signal, index) => (
              <div key={index} className="bg-sapphire-900/40 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-emerald-400">{signal.token}</div>
                  <div className="text-xs text-emerald-400/60">{signal.tokenSymbol}</div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {signal.direction === 'buy' ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-cyber">BUY</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-cyber">SELL</span>
                      </div>
                    )}
                    <span className="text-emerald-400/60 text-sm">
                      @ {formatPrice(signal.price)}
                    </span>
                  </div>

                  <div className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400/60" />
                    <span className="text-emerald-400/60">{formatTimestamp(signal.timestamp)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                  <div>
                    <div className="text-emerald-400/60">Target</div>
                    <div className="text-emerald-400">{formatPrice(signal.targetPrice)}</div>
                  </div>
                  <div>
                    <div className="text-emerald-400/60">Stop Loss</div>
                    <div className="text-emerald-400">{formatPrice(signal.stopLoss)}</div>
                  </div>
                  <div>
                    <div className="text-emerald-400/60">Confidence</div>
                    <div className={getConfidenceColor(signal.confidence)}>
                      {signal.confidence}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-emerald-400/60">
                  Timeframe: <span className="text-emerald-400">{signal.timeframe}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-emerald-400/60">
              No recent trading signals available
            </div>
          )}
        </div>

        <Link
          href="/signals"
          className="w-full flex justify-center items-center py-2 px-4 bg-sapphire-900/60 border border-emerald-400/30 text-emerald-400 rounded-md font-cyber text-sm hover:bg-emerald-400/10 transition-colors"
        >
          VIEW ALL SIGNALS <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};
