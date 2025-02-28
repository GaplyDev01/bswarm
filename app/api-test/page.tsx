// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  useMarketData,
  useTrendingTokens,
  useTokenData,
  useTokenSearch,
} from '@/hooks/useMarketData';
import { CryptoCard } from '@/components/ui/crypto-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageNavigation from '@/components/PageNavigation';
import { createSafeHtml } from '@/lib/utils';

export default function ApiTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState('solana');
  const [chartDays, setChartDays] = useState('7');

  // Fetch data using our custom hooks
  const { data: marketData, error: marketError, isLoading: marketLoading } = useMarketData();
  const {
    data: trendingData,
    error: trendingError,
    isLoading: trendingLoading,
  } = useTrendingTokens();
  const {
    data: tokenData,
    error: tokenError,
    isLoading: tokenLoading,
  } = useTokenData(selectedToken, { days: parseInt(chartDays, 10) });
  const {
    data: searchData,
    error: searchError,
    isLoading: searchLoading,
  } = useTokenSearch({ query: searchQuery });

  return (
    <div className="p-6 min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <PageNavigation />

        <h1 className="text-2xl font-bold mb-6">API Testing Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trending Tokens Section */}
          <CryptoCard className="p-4">
            <h2 className="text-xl font-semibold mb-4">Trending Solana Tokens</h2>

            {trendingLoading ? (
              <div className="text-gray-400">Loading trending tokens...</div>
            ) : trendingError ? (
              <div className="text-red-400">Error: {trendingError.message}</div>
            ) : (
              <div className="space-y-2">
                {trendingData?.tokens?.length > 0 ? (
                  trendingData.tokens.map((token: any) => (
                    <div key={token.id} className="flex items-center p-2 bg-black/20 rounded-lg">
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center mr-3">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No trending Solana tokens found</div>
                )}
              </div>
            )}
          </CryptoCard>

          {/* Token Search Section */}
          <CryptoCard className="p-4">
            <h2 className="text-xl font-semibold mb-4">Token Search</h2>

            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Search for tokens..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button variant="default">Search</Button>
            </div>

            {searchLoading ? (
              <div className="text-gray-400">Searching...</div>
            ) : searchError ? (
              <div className="text-red-400">Error: {searchError.message}</div>
            ) : searchData?.results?.length > 0 ? (
              <div className="space-y-2">
                {searchData.results.map((token: any) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-2 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30"
                    onClick={() => setSelectedToken(token.id)}
                  >
                    <div className="flex items-center">
                      <img
                        src={token.thumb}
                        alt={token.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${token.price}</div>
                      <div
                        className={`text-xs ${token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {token.price_change_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="text-gray-400">No tokens found for "{searchQuery}"</div>
            ) : null}
          </CryptoCard>

          {/* Token Details Section */}
          <CryptoCard className="p-4 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Token Details</h2>

              <Select value={chartDays} onValueChange={setChartDays}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="7 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tokenLoading ? (
              <div className="text-gray-400">Loading token data...</div>
            ) : tokenError ? (
              <div className="text-red-400">Error: {tokenError.message}</div>
            ) : tokenData ? (
              <div>
                <div className="flex items-center mb-4">
                  {tokenData.image?.small && (
                    <img
                      src={tokenData.image.small}
                      alt={tokenData.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium">
                      {tokenData.name} ({tokenData.symbol})
                    </h3>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Price:</span>
                      <span className="font-medium">
                        ${tokenData.market_data?.current_price?.toFixed(4)}
                      </span>
                      <span
                        className={`ml-2 ${tokenData.market_data?.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {tokenData.market_data?.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Market Cap</div>
                    <div className="font-medium">
                      ${tokenData.market_data?.market_cap?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Volume (24h)</div>
                    <div className="font-medium">
                      ${tokenData.market_data?.total_volume?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Circulating Supply</div>
                    <div className="font-medium">
                      {tokenData.market_data?.circulating_supply?.toLocaleString()}{' '}
                      {tokenData.symbol}
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-lg mb-4">
                  <div className="text-sm text-gray-400 mb-1">Description</div>
                  <div className="text-sm max-h-24 overflow-y-auto">
                    {tokenData.description ? (
                      <div
                        dangerouslySetInnerHTML={createSafeHtml(
                          tokenData.description.substring(0, 300) + '...'
                        )}
                      />
                    ) : (
                      <span className="text-gray-400">No description available</span>
                    )}
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Chart Data Available</div>
                  <div className="text-sm">
                    {tokenData.chart_data ? (
                      <div>
                        <div>Price Points: {tokenData.chart_data.prices?.length}</div>
                        <div>Market Cap Points: {tokenData.chart_data.market_caps?.length}</div>
                        <div>Volume Points: {tokenData.chart_data.total_volumes?.length}</div>
                        <div>Timeframe: {tokenData.chart_data.timeframe}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No chart data available</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Select a token to view details</div>
            )}
          </CryptoCard>

          {/* Market Data Section */}
          <CryptoCard className="p-4 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Solana Market Overview</h2>

            {marketLoading ? (
              <div className="text-gray-400">Loading market data...</div>
            ) : marketError ? (
              <div className="text-red-400">Error: {marketError.message}</div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Total Market Cap</div>
                    <div className="font-medium">
                      ${marketData?.metrics?.total_market_cap?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">24h Volume</div>
                    <div className="font-medium">
                      ${marketData?.metrics?.total_volume_24h?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Gainers</div>
                    <div className="font-medium text-green-400">
                      {marketData?.metrics?.positive_performers_24h}
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Losers</div>
                    <div className="font-medium text-red-400">
                      {marketData?.metrics?.negative_performers_24h}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Top Performer</div>
                    {marketData?.metrics?.best_performer ? (
                      <div className="flex items-center">
                        <img
                          src={marketData.metrics.best_performer.image}
                          alt={marketData.metrics.best_performer.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">
                            {marketData.metrics.best_performer.name}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">
                              ${marketData.metrics.best_performer.price.toFixed(4)}
                            </span>
                            <span className="text-xs text-green-400 ml-2">
                              +{marketData.metrics.best_performer.change.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400">No data available</div>
                    )}
                  </div>

                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Worst Performer</div>
                    {marketData?.metrics?.worst_performer ? (
                      <div className="flex items-center">
                        <img
                          src={marketData.metrics.worst_performer.image}
                          alt={marketData.metrics.worst_performer.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">
                            {marketData.metrics.worst_performer.name}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">
                              ${marketData.metrics.worst_performer.price.toFixed(4)}
                            </span>
                            <span className="text-xs text-red-400 ml-2">
                              {marketData.metrics.worst_performer.change.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400">No data available</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CryptoCard>
        </div>
      </div>
    </div>
  );
}
