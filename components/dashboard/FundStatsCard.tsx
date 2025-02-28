import React from 'react';
import { LineChart, BarChart, TrendingUp, Users, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface PerformanceHistory {
  period: string;
  return: number;
}

interface FundStatsProps {
  aum: number; // Assets Under Management
  monthlyReturn: number;
  yearToDateReturn: number;
  inceptionReturn: number;
  performanceHistory: PerformanceHistory[];
  investorCount: number;
  className?: string;
}

export const FundStatsCard: React.FC<FundStatsProps> = ({
  aum,
  monthlyReturn,
  yearToDateReturn,
  inceptionReturn,
  performanceHistory,
  investorCount,
  className = '',
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return '$' + (value / 1000000000).toFixed(2) + 'B';
    } else if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(2) + 'K';
    }
    return '$' + value.toFixed(2);
  };

  const getReturnColorClass = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getReturnPrefix = (value: number) => {
    return value >= 0 ? '+' : '';
  };

  // Simple chart representation
  const maxValue = Math.max(...performanceHistory.map(item => Math.abs(item.return)));
  const chartHeight = 60; // pixels

  const normalizeValue = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  return (
    <div
      className={`backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-cyber text-emerald-400">Hedge Fund Performance</h3>
          <div className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs flex items-center gap-1">
            <BarChart className="w-3 h-3" />
            STATS
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-emerald-400/60">Assets Under Management</div>
              <DollarSign className="w-4 h-4 text-emerald-400/60" />
            </div>
            <div className="text-xl font-cyber text-emerald-400">{formatCurrency(aum)}</div>
          </div>

          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-emerald-400/60">Investors</div>
              <Users className="w-4 h-4 text-emerald-400/60" />
            </div>
            <div className="text-xl font-cyber text-emerald-400">{investorCount}</div>
          </div>
        </div>

        <div className="bg-sapphire-900/40 rounded-lg p-4 mb-6">
          <div className="text-sm text-emerald-400/80 mb-4">Returns</div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <div className="text-xs text-emerald-400/60 mb-1">Monthly</div>
              <div className={`text-lg font-medium ${getReturnColorClass(monthlyReturn)}`}>
                {getReturnPrefix(monthlyReturn)}
                {monthlyReturn.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-emerald-400/60 mb-1">YTD</div>
              <div className={`text-lg font-medium ${getReturnColorClass(yearToDateReturn)}`}>
                {getReturnPrefix(yearToDateReturn)}
                {yearToDateReturn.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-emerald-400/60 mb-1">Since Inception</div>
              <div className={`text-lg font-medium ${getReturnColorClass(inceptionReturn)}`}>
                {getReturnPrefix(inceptionReturn)}
                {inceptionReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sapphire-900/40 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-emerald-400/80">Historical Performance</div>
            <LineChart className="w-4 h-4 text-emerald-400/60" />
          </div>

          <div className="relative h-[60px] mb-2">
            {performanceHistory.map((item, index) => {
              const height = normalizeValue(item.return);
              const barWidth = 100 / performanceHistory.length;

              return (
                <div
                  key={index}
                  className={`absolute bottom-0 w-[${barWidth}%] ${item.return >= 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                  style={{
                    height: `${Math.abs(height)}px`,
                    left: `${index * barWidth}%`,
                    width: `${barWidth - 2}%`,
                    borderTop: `2px solid ${item.return >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`,
                    bottom: item.return < 0 ? 'auto' : '0',
                    top: item.return < 0 ? '50%' : 'auto',
                  }}
                ></div>
              );
            })}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-emerald-400/20"></div>
          </div>

          <div className="flex justify-between text-xs text-emerald-400/60">
            {performanceHistory.map((item, index) => (
              <div key={index}>{item.period}</div>
            ))}
          </div>
        </div>

        <Link
          href="/analytics"
          className="w-full flex justify-center items-center py-2 px-4 bg-sapphire-900/60 border border-emerald-400/30 text-emerald-400 rounded-md font-cyber text-sm hover:bg-emerald-400/10 transition-colors"
        >
          DETAILED ANALYTICS <Info className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};
