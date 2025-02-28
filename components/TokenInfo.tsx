// @ts-nocheck
'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart,
  Calendar,
  Users,
  Shield,
  Activity,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage, getPriceChangeColor } from '@/lib/utils';

interface TokenInfoProps {
  tokenData: Record<string, unknown>;
}

export function TokenInfo({ tokenData }: TokenInfoProps) {
  if (!tokenData) return null;

// @ts-ignore
  const isPositive24h = tokenData.price_change_percentage_24h >= 0;
// @ts-ignore
  const isPositive7d = tokenData.price_change_percentage_7d >= 0;
// @ts-ignore
  const isPositive30d = tokenData.price_change_percentage_30d >= 0;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Token Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
// @ts-ignore
          <img src={tokenData.image} alt={tokenData.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center">
// @ts-ignore
              {tokenData.name}
              <span className="ml-2 px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">
// @ts-ignore
                {tokenData.symbol.toUpperCase()}
              </span>
            </h2>
            <div className="flex items-center mt-1">
              <span className="text-lg font-mono font-medium text-foreground">
// @ts-ignore
                {formatCurrency(tokenData.current_price)}
              </span>
              <span
// @ts-ignore
                className={`ml-2 flex items-center text-sm ${getPriceChangeColor(tokenData.price_change_percentage_24h)}`}
              >
                {isPositive24h ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
// @ts-ignore
                {formatPercentage(tokenData.price_change_percentage_24h)} (24h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Stats */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            Market Cap
          </div>
// @ts-ignore
          <div className="font-medium">{formatCurrency(tokenData.market_cap, 'USD', true)}</div>
          <div className="text-xs text-muted-foreground mt-1">
// @ts-ignore
            Rank #{tokenData.market_cap_rank || 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <BarChart className="h-3 w-3 mr-1" />
            Volume (24h)
          </div>
// @ts-ignore
          <div className="font-medium">{formatCurrency(tokenData.volume_24h, 'USD', true)}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Activity className="h-3 w-3 mr-1" />
            Price Change
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between">
              <span className="text-xs">24h:</span>
              <span
// @ts-ignore
                className={`text-xs ${getPriceChangeColor(tokenData.price_change_percentage_24h)}`}
              >
// @ts-ignore
                {formatPercentage(tokenData.price_change_percentage_24h)}
              </span>
            </div>
            {tokenData.price_change_percentage_7d && (
              <div className="flex justify-between">
                <span className="text-xs">7d:</span>
                <span
// @ts-ignore
                  className={`text-xs ${getPriceChangeColor(tokenData.price_change_percentage_7d)}`}
                >
// @ts-ignore
                  {formatPercentage(tokenData.price_change_percentage_7d)}
                </span>
              </div>
            )}
            {tokenData.price_change_percentage_30d && (
              <div className="flex justify-between">
                <span className="text-xs">30d:</span>
                <span
// @ts-ignore
                  className={`text-xs ${getPriceChangeColor(tokenData.price_change_percentage_30d)}`}
                >
// @ts-ignore
                  {formatPercentage(tokenData.price_change_percentage_30d)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            All Time High
          </div>
// @ts-ignore
          <div className="font-medium">{formatCurrency(tokenData.ath)}</div>
          <div className="text-xs text-muted-foreground mt-1">
// @ts-ignore
            {new Date(tokenData.ath_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Supply Info */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Circulating Supply
          </div>
          <div className="font-medium">
// @ts-ignore
            {formatNumber(tokenData.circulating_supply)} {tokenData.symbol.toUpperCase()}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Total Supply
          </div>
          <div className="font-medium">
// @ts-ignore
            {tokenData.total_supply ? formatNumber(tokenData.total_supply) : 'N/A'}{' '}
// @ts-ignore
            {tokenData.symbol.toUpperCase()}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Max Supply
          </div>
          <div className="font-medium">
// @ts-ignore
            {tokenData.max_supply ? formatNumber(tokenData.max_supply) : '∞'}{' '}
// @ts-ignore
            {tokenData.symbol.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Description */}
      {tokenData.description && (
        <div className="p-4 border-b border-border">
// @ts-ignore
          <div className="text-sm text-muted-foreground line-clamp-3">{tokenData.description}</div>
        </div>
      )}

      {/* Links and Chat Button */}
      <div className="p-4 flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {tokenData.links && (
            <>
// @ts-ignore
              {tokenData.links.homepage && (
                <a
// @ts-ignore
                  href={tokenData.links.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  Website
                </a>
              )}
// @ts-ignore
              {tokenData.links.twitter && (
                <a
// @ts-ignore
                  href={tokenData.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  Twitter
                </a>
              )}
// @ts-ignore
              {tokenData.links.github && (
                <a
// @ts-ignore
                  href={tokenData.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  GitHub
                </a>
              )}
// @ts-ignore
              {tokenData.links.reddit && (
                <a
// @ts-ignore
                  href={tokenData.links.reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  Reddit
                </a>
              )}
// @ts-ignore
              {tokenData.links.telegram && (
                <a
// @ts-ignore
                  href={tokenData.links.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  Telegram
                </a>
              )}
            </>
          )}
        </div>

        <a
// @ts-ignore
          href={`/ai-chat?token=${tokenData.symbol.toLowerCase()}&name=${tokenData.name}&price=${tokenData.current_price}&market_cap=${tokenData.market_cap}&change_24h=${tokenData.price_change_percentage_24h}`}
          className="px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <path d="M12 2c-4.4 0-8 3.6-8 8a7.64 7.64 0 0 0 3 6l-2 2h6l1 3 1-3h6l-2-2a7.64 7.64 0 0 0 3-6c0-4.4-3.6-8-8-8Z"></path>
          </svg>
// @ts-ignore
          Chat with AI about {tokenData.symbol.toUpperCase()}
        </a>
      </div>
    </div>
  );
}
