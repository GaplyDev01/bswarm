import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';

interface InvestmentTotalsProps {
  totalInvested: number;
  currentValue: number;
  percentageChange: number;
  nextDistributionDate?: string;
  nextDistributionAmount?: number;
  investmentStartDate?: string;
  className?: string;
}

export const InvestmentTotalsCard: React.FC<InvestmentTotalsProps> = ({
  totalInvested,
  currentValue,
  percentageChange,
  nextDistributionDate,
  nextDistributionAmount,
  investmentStartDate,
  className = '',
}) => {
  const isPositive = percentageChange >= 0;
  const formattedInvested = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalInvested);
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(currentValue);
  const formattedDistribution = nextDistributionAmount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        nextDistributionAmount
      )
    : 'N/A';

  return (
    <div
      className={`backdrop-blur-md bg-sapphire-800/30 border border-emerald-400/30 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-cyber text-emerald-400">Investment Portfolio</h3>
          <div className="px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs">
            Investor
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-emerald-400/60">Invested</div>
              <DollarSign className="w-4 h-4 text-emerald-400/60" />
            </div>
            <div className="text-xl font-cyber text-emerald-400">{formattedInvested}</div>
          </div>

          <div className="bg-sapphire-900/40 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-emerald-400/60">Current Value</div>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-xl font-cyber text-emerald-400">{formattedValue}</div>
            <div className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}
              {percentageChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {(nextDistributionDate || investmentStartDate) && (
          <div className="border-t border-emerald-400/10 pt-4 mb-4">
            {nextDistributionDate && (
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-emerald-400/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  Next Distribution
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-emerald-400">{formattedDistribution}</div>
                  <div className="text-xs text-emerald-400/60">{nextDistributionDate}</div>
                </div>
              </div>
            )}

            {investmentStartDate && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-400/60 text-sm">
                  <Clock className="w-4 h-4" />
                  Investing Since
                </div>
                <div className="text-emerald-400 text-sm">{investmentStartDate}</div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 py-2 px-4 bg-emerald-400 text-sapphire-900 rounded-md font-cyber text-sm hover:bg-emerald-300 transition-colors">
            DEPOSIT
          </button>
          <button className="flex-1 py-2 px-4 border border-emerald-400 text-emerald-400 rounded-md font-cyber text-sm hover:bg-emerald-400/10 transition-colors">
            WITHDRAW
          </button>
        </div>
      </div>
    </div>
  );
};
