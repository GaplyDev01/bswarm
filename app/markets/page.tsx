// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ArrowUp, ArrowDown, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CryptoCard } from '@/components/ui/crypto-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackNavigation from '@/components/BackNavigation';

import { formatCurrency, formatNumber, formatPercentage, getPriceChangeColor } from '@/lib/utils';
import SolanaService, { TokenInfo } from '@/lib/solana';
import { useAppStore } from '@/lib/store';
import { logger } from '@/lib/logger';

export default function MarketsPage() {
  const router = useRouter();
  const { setSelectedToken } = useAppStore();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('marketCap');
// @ts-ignore
  const [sortDirection, setSortDirection] = (useState < 'asc') | ('desc' >> 'desc');
  const [loading, setLoading] = useState(true);
  const [favoriteTokens, setFavoriteTokens] = useState<string[]>([]);

  // Fetch token data
  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true);
        const tokenList = await SolanaService.getTokenList();

        // Add more mock tokens for the markets page
        const extendedTokenList = [
          ...tokenList,
          {
            symbol: 'PYTH',
            name: 'Pyth Network',
            mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
            decimals: 6,
            price: 0.42,
            change24h: 0.8,
            volume24h: 12450000,
            marketCap: 389000000,
            supply: 926190476,
          },
          {
            symbol: 'RNDR',
            name: 'Render',
            mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7HRqb7di6wzpg4M',
            decimals: 8,
            price: 6.78,
            change24h: -1.2,
            volume24h: 89760000,
            marketCap: 2700000000,
            supply: 398230000,
          },
          {
            symbol: 'MANGO',
            name: 'Mango',
            mint: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
            decimals: 6,
            price: 0.23,
            change24h: 5.4,
            volume24h: 3450000,
            marketCap: 64400000,
            supply: 280000000,
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            decimals: 6,
            price: 1.0,
            change24h: 0.02,
            volume24h: 278900000,
            marketCap: 29650000000,
            supply: 29650000000,
          },
        ];

        setTokens(extendedTokenList);
      } catch (error) {
        logger.error('Failed to fetch tokens:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  // Toggle favorite token
  const toggleFavorite = (symbol: string) => {
    if (favoriteTokens.includes(symbol)) {
      setFavoriteTokens(favoriteTokens.filter(t => t !== symbol));
    } else {
      setFavoriteTokens([...favoriteTokens, symbol]);
    }
  };

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Filter and sort tokens
  const filteredTokens = tokens.filter(token => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return token.name.toLowerCase().includes(query) || token.symbol.toLowerCase().includes(query);
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let aValue = a[sortBy as keyof TokenInfo];
    let bValue = b[sortBy as keyof TokenInfo];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token.symbol);
    router.push(`/token-analysis?token=${token.symbol.toLowerCase()}`);
  };

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

        <CryptoCard className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  className="pl-10 bg-black/20 border-white/10"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-sm text-gray-400 font-medium">
                        <div className="flex items-center">
                          <span>Favorite</span>
                        </div>
                      </th>
                      <th className="text-left p-3 text-sm text-gray-400 font-medium">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange('name')}
                        >
                          <span>Token</span>
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        </div>
                      </th>
                      <th className="text-right p-3 text-sm text-gray-400 font-medium">
                        <div
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSortChange('price')}
                        >
                          <span>Price</span>
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        </div>
                      </th>
                      <th className="text-right p-3 text-sm text-gray-400 font-medium">
                        <div
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSortChange('change24h')}
                        >
                          <span>24h Change</span>
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        </div>
                      </th>
                      <th className="text-right p-3 text-sm text-gray-400 font-medium">
                        <div
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSortChange('volume24h')}
                        >
                          <span>24h Volume</span>
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        </div>
                      </th>
                      <th className="text-right p-3 text-sm text-gray-400 font-medium">
                        <div
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSortChange('marketCap')}
                        >
                          <span>Market Cap</span>
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        </div>
                      </th>
                      <th className="text-right p-3 text-sm text-gray-400 font-medium">
                        <span>Trade</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-gray-400">Loading tokens...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedTokens.map(token => (
                        <tr
                          key={token.symbol}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => handleTokenSelect(token)}
                        >
                          <td
                            className="p-3"
                            onClick={e => {
                              e.stopPropagation();
                              toggleFavorite(token.symbol);
                            }}
                          >
                            <Star
                              size={18}
                              className={`${favoriteTokens.includes(token.symbol) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-semibold">{token.symbol[0]}</span>
                              </div>
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-gray-400">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            {token.price < 0.01
                              ? formatNumber(token.price, 8)
                              : formatCurrency(token.price)}
                          </td>
                          <td className="p-3 text-right">
                            <div
                              className={`flex items-center justify-end ${getPriceChangeColor(token.change24h)}`}
                            >
                              {token.change24h > 0 ? (
                                <ArrowUp size={14} className="mr-1" />
                              ) : token.change24h < 0 ? (
                                <ArrowDown size={14} className="mr-1" />
                              ) : null}
                              {formatPercentage(token.change24h)}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(token.volume24h, 'USD', true)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(token.marketCap, 'USD', true)}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-purple-900/20"
                              onClick={e => {
                                e.stopPropagation();
                                router.push(`/trading?token=${token.symbol.toLowerCase()}`);
                              }}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              {favoriteTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Star size={32} className="text-gray-500 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No favorites yet</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    Click the star icon next to any token to add it to your favorites
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Same table as above but filtered by favorites */}
                </div>
              )}
            </TabsContent>

            <TabsContent value="gainers" className="mt-0">
              <div className="overflow-x-auto">
                {/* Same table filtered by positive 24h change and sorted */}
              </div>
            </TabsContent>

            <TabsContent value="losers" className="mt-0">
              <div className="overflow-x-auto">
                {/* Same table filtered by negative 24h change and sorted */}
              </div>
            </TabsContent>
          </Tabs>
        </CryptoCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <CryptoCard variant="glow" hover="scale">
            <h3 className="text-lg font-medium mb-3">Market Trends</h3>
            <p className="text-gray-400 mb-4">
              Stay updated with the latest market trends and insights from our AI analysis.
            </p>
            <div className="space-y-2 mb-4">
              <Badge
                variant="outline"
                className="bg-green-900/20 text-green-400 border-green-500/20"
              >
                Bullish Trend
              </Badge>
              <div className="text-sm text-gray-300">
                SOL showing strong recovery pattern with growing momentum
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Detailed Analysis
            </Button>
          </CryptoCard>

          <CryptoCard variant="sol" hover="scale">
            <h3 className="text-lg font-medium mb-3">Trade Alerts</h3>
            <p className="text-gray-400 mb-4">
              Get notified about potential trading opportunities based on market movements.
            </p>
            <div className="space-y-2 mb-4">
              <Badge
                variant="outline"
                className="bg-purple-900/20 text-purple-400 border-purple-500/20"
              >
                New Signal
              </Badge>
              <div className="text-sm text-gray-300">
                JUP/USDC breakout detected with increasing volume
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View All Alerts
            </Button>
          </CryptoCard>
        </div>
      </div>
    </div>
  );
}
