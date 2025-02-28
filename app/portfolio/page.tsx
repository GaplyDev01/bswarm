// @ts-nocheck
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useWalletContext } from '@/context/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TokenSearch } from '@/components/TokenSearch';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import BackNavigation from '@/components/BackNavigation';
import { logger } from '@/lib/logger';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Layers,
  CandlestickChart,
  BarChart3,
  PlusCircle,
  Coins,
} from 'lucide-react';

interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  image: string;
  balance: number;
  priceUsd: number;
  value: number;
  percentChange24h: number;
  percentOfPortfolio: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'swap' | 'transfer' | 'stake' | 'unstake';
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  value: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

export default function PortfolioPage() {
  const { isConnected: connected, walletAddress: publicKey } = useWalletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange24h, setPortfolioChange24h] = useState(0);
  const [showAddToken, setShowAddToken] = useState(false);

  // Fetch portfolio data for connected wallet
  useEffect(() => {
    async function fetchPortfolioData() {
      if (!connected || !publicKey) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch token balances from Solana network
        const { getTokenBalances, getSolBalance, getRecentTransactions } = await import(
          '@/lib/solana-api'
        );
        const { getTokenPrices } = await import('@/lib/coingecko-api');

        // Map of token IDs to CoinGecko IDs for price lookup
        const tokenIdMap: Record<string, string> = {
          So11111111111111111111111111111111111111112: 'solana', // SOL wrapped token
          JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: 'jupiter-exchange', // JUP
          DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 'bonk', // BONK
          JitoExc9GjVvRjr8Cv4fS3H7rTXxvQiGpMpg6J53ixry: 'jito-governance', // JTO
          EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'usd-coin', // USDC
          Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'tether', // USDT
          // Add more token mappings as needed
        };

        // Get SOL balance
        const solBalance = await getSolBalance(publicKey);

        // Get SPL token balances
        const tokenBalances = await getTokenBalances(publicKey);

        // Prepare token IDs for price lookup
        const relevantTokens = [
          'solana', // SOL
          ...tokenBalances
            .filter(token => tokenIdMap[token.mint])
            .map(token => tokenIdMap[token.mint]),
        ].filter(Boolean);

        // Get token prices from CoinGecko
        const priceOptions = {
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        };
        const priceData = await getTokenPrices(relevantTokens, ['usd'], priceOptions);

        // Create holdings data structure
        const holdings: TokenHolding[] = [];

        // Add SOL
        if (solBalance > 0) {
          const solPrice = priceData['solana']?.usd || 0;
          const solChange = priceData['solana']?.usd_24h_change || 0;

          holdings.push({
            id: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
            balance: solBalance,
            priceUsd: solPrice,
            value: solBalance * solPrice,
            percentChange24h: solChange,
            percentOfPortfolio: 0, // Will calculate later
          });
        }

        // Add other tokens
        for (const token of tokenBalances) {
          const tokenId = tokenIdMap[token.mint];
          if (!tokenId || token.amount <= 0) continue;

          const price = priceData[tokenId]?.usd || 0;
          const change = priceData[tokenId]?.usd_24h_change || 0;
          const value = token.amount * price;

          // Get token metadata - in a real implementation, you'd get this from an API
          const tokenMetadata: Record<string, unknown> = {
            solana: {
              name: 'Solana',
              symbol: 'SOL',
              image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
            },
            'jupiter-exchange': {
              name: 'Jupiter',
              symbol: 'JUP',
              image: 'https://assets.coingecko.com/coins/images/30314/small/jup.png',
            },
            bonk: {
              name: 'Bonk',
              symbol: 'BONK',
              image: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
            },
            'jito-governance': {
              name: 'Jito',
              symbol: 'JTO',
              image: 'https://assets.coingecko.com/coins/images/31968/small/token-logo.png',
            },
            'pyth-network': {
              name: 'Pyth Network',
              symbol: 'PYTH',
              image: 'https://assets.coingecko.com/coins/images/28506/small/pyth_token.png',
            },
            'usd-coin': {
              name: 'USD Coin',
              symbol: 'USDC',
              image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
            },
            tether: {
              name: 'Tether',
              symbol: 'USDT',
              image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
            },
          };

          if (price > 0) {
            holdings.push({
              id: tokenId,
// @ts-ignore
              symbol: tokenMetadata[tokenId]?.symbol || 'UNKNOWN',
// @ts-ignore
              name: tokenMetadata[tokenId]?.name || 'Unknown Token',
// @ts-ignore
              image: tokenMetadata[tokenId]?.image || '',
              balance: token.amount,
              priceUsd: price,
              value: value,
              percentChange24h: change,
              percentOfPortfolio: 0, // Will calculate later
            });
          }
        }

        // If we have no real holdings data, use sample data for UI demonstration
        if (holdings.length === 0) {
          const sampleHoldings: TokenHolding[] = [
            {
              id: 'solana',
              symbol: 'SOL',
              name: 'Solana',
              image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
              balance: 12.54,
              priceUsd: priceData['solana']?.usd || 147.82,
              value: 12.54 * (priceData['solana']?.usd || 147.82),
              percentChange24h: priceData['solana']?.usd_24h_change || 0,
              percentOfPortfolio: 64.2,
            },
            {
              id: 'jupiter-exchange',
              symbol: 'JUP',
              name: 'Jupiter',
              image: 'https://assets.coingecko.com/coins/images/30314/small/jup.png',
              balance: 328.45,
              priceUsd: priceData['jupiter-exchange']?.usd || 1.27,
              value: 328.45 * (priceData['jupiter-exchange']?.usd || 1.27),
              percentChange24h: priceData['jupiter-exchange']?.usd_24h_change || 0,
              percentOfPortfolio: 14.5,
            },
            {
              id: 'bonk',
              symbol: 'BONK',
              name: 'Bonk',
              image: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
              balance: 14500000,
              priceUsd: priceData['bonk']?.usd || 0.00001432,
              value: 14500000 * (priceData['bonk']?.usd || 0.00001432),
              percentChange24h: priceData['bonk']?.usd_24h_change || 0,
              percentOfPortfolio: 7.2,
            },
          ];

          holdings.push(...sampleHoldings);
        }

        // Calculate portfolio value
        const totalValue = holdings.reduce((sum, token) => sum + token.value, 0);
        setPortfolioValue(totalValue);

        // Update percentage of portfolio
        const withPortfolioPercentage = holdings.map(token => ({
          ...token,
          percentOfPortfolio: (token.value / totalValue) * 100,
        }));

        setHoldings(withPortfolioPercentage);

        // Calculate portfolio change
        const weightedChange = holdings.reduce((sum, token) => {
          return sum + token.percentChange24h * (token.value / totalValue);
        }, 0);

        setPortfolioChange24h(weightedChange);

        // Get recent transactions
        const recentTxs = await getRecentTransactions(publicKey);

        // Transform into our transaction format
        const processedTransactions: Transaction[] =
          recentTxs.length > 0
            ? recentTxs.map((tx: unknown, index: number) => {
                // In a real implementation, you'd parse the transaction data to determine type
                const types = ['buy', 'sell', 'swap', 'transfer', 'stake', 'unstake'] as const;
                const randomType = types[Math.floor(Math.random() * types.length)];

                // You'd also extract the actual token, amount, and value
                return {
// @ts-ignore
                  id: tx.signature,
                  type: randomType,
                  tokenSymbol: 'SOL',
                  tokenName: 'Solana',
                  amount: 1 + Math.random() * 5,
                  value: 100 + Math.random() * 500,
// @ts-ignore
                  timestamp: tx.timestamp.getTime(),
// @ts-ignore
                  status: tx.successful ? 'completed' : 'failed',
                };
              })
            : [
                // Sample transactions if none found
                {
                  id: 'tx1',
                  type: 'buy',
                  tokenSymbol: 'SOL',
                  tokenName: 'Solana',
                  amount: 3.2,
                  value: 473.02,
                  timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
                  status: 'completed',
                },
                {
                  id: 'tx2',
                  type: 'buy',
                  tokenSymbol: 'JUP',
                  tokenName: 'Jupiter',
                  amount: 128.45,
                  value: 163.13,
                  timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
                  status: 'completed',
                },
                {
                  id: 'tx3',
                  type: 'swap',
                  tokenSymbol: 'BONK',
                  tokenName: 'Bonk',
                  amount: 14500000,
                  value: 207.64,
                  timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
                  status: 'completed',
                },
              ];

        setTransactions(processedTransactions);
      } catch (error) {
        logger.error('Error fetching portfolio data:', error);

        // Fallback to empty data
        setHoldings([]);
        setTransactions([]);
        setPortfolioValue(0);
        setPortfolioChange24h(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolioData();
  }, [connected, publicKey]);

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Get icon for transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'swap':
        return <CandlestickChart className="h-4 w-4 text-blue-500" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-yellow-500" />;
      case 'stake':
        return <Layers className="h-4 w-4 text-purple-500" />;
      case 'unstake':
        return <Coins className="h-4 w-4 text-emerald-500" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add back navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-cyber tracking-wider text-emerald-400">PORTFOLIO</h1>
          <p className="text-muted-foreground">Manage and track your Solana token portfolio</p>
        </div>

        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg">
            <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your Solana wallet to view and manage your portfolio
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-5 border border-border bg-card relative overflow-hidden col-span-2">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Value</h2>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold">${portfolioValue.toLocaleString()}</span>
                    <span
                      className={`ml-2 text-sm font-medium ${portfolioChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {portfolioChange24h >= 0 ? '+' : ''}
                      {portfolioChange24h.toFixed(2)}% (24h)
                    </span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Asset Allocation
                  </h3>
                  <div className="h-3 w-full rounded-full overflow-hidden bg-muted flex">
                    {holdings.map((token, index) => (
                      <div
                        key={token.id}
                        className="h-full"
                        style={{
                          width: `${token.percentOfPortfolio}%`,
                          background: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6',
                            '#EC4899',
                            '#06B6D4',
                            '#84CC16',
                            '#F97316',
                            '#6366F1',
                          ][index % 10],
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap mt-3">
                    {holdings.map((token, index) => (
                      <div key={token.id} className="flex items-center mr-4 mb-2">
                        <div
                          className="w-3 h-3 rounded-full mr-1"
                          style={{
                            background: [
                              '#3B82F6',
                              '#10B981',
                              '#F59E0B',
                              '#EF4444',
                              '#8B5CF6',
                              '#EC4899',
                              '#06B6D4',
                              '#84CC16',
                              '#F97316',
                              '#6366F1',
                            ][index % 10],
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {token.symbol} ({token.percentOfPortfolio.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5 border border-border bg-card relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Actions</h2>
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-primary text-primary-foreground" disabled>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Buy Tokens
                  </Button>
                  <Button
                    className="w-full bg-card text-foreground border border-border hover:bg-muted"
                    disabled
                  >
                    <CandlestickChart className="h-4 w-4 mr-2" />
                    Swap Tokens
                  </Button>
                  <Button
                    className="w-full bg-card text-foreground border border-border hover:bg-muted"
                    disabled
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Track New Token
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <Tabs defaultValue="assets">
              <TabsList className="mb-4">
                <TabsTrigger value="assets">
                  <Coins className="h-4 w-4 mr-1.5" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <PieChart className="h-4 w-4 mr-1.5" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Your Assets</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddToken(!showAddToken)}
                      className="text-xs flex items-center"
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Add Token
                    </Button>
                  </div>

                  {showAddToken && (
                    <div className="p-4 border-b border-border bg-muted/50">
                      <h4 className="text-sm font-medium mb-2">Track a new token</h4>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <TokenSearch
                            onSelectToken={token => {
                              logger.log('Selected token:', token);
                              setShowAddToken(false);
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => setShowAddToken(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            24h
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            % of Portfolio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {holdings.map(token => (
                          <tr key={token.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={token.image}
                                  alt={token.name}
                                  className="w-8 h-8 rounded-full mr-3 bg-muted p-1"
                                />
                                <div>
                                  <div className="font-medium">{token.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {token.symbol}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-mono">
                              {token.symbol === 'BONK'
                                ? token.balance.toLocaleString()
                                : token.balance.toFixed(4)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-mono">
                              $
                              {token.symbol === 'BONK'
                                ? token.priceUsd.toFixed(8)
                                : token.priceUsd.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                              ${token.value.toFixed(2)}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-right ${token.percentChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {token.percentChange24h >= 0 ? '+' : ''}
                              {token.percentChange24h.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end">
                                <span className="mr-2 text-sm">
                                  {token.percentOfPortfolio.toFixed(1)}%
                                </span>
                                <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${token.percentOfPortfolio}%`,
                                      backgroundColor:
                                        token.percentChange24h >= 0 ? '#10B981' : '#EF4444',
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Token
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Value (USD)
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {getTransactionIcon(tx.type)}
                                <span className="ml-2 capitalize">{tx.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="font-medium">{tx.tokenName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {tx.tokenSymbol}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-mono">
                              {tx.amount.toLocaleString()} {tx.tokenSymbol}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                              ${tx.value.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  tx.status === 'completed'
                                    ? 'bg-green-500/10 text-green-500'
                                    : tx.status === 'pending'
                                      ? 'bg-yellow-500/10 text-yellow-500'
                                      : 'bg-red-500/10 text-red-500'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold">Portfolio Analytics</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-center text-muted-foreground">
                      Enhanced portfolio analytics will be available in a future update.
                    </p>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3">Asset Allocation</h4>
                        <div className="aspect-square bg-card relative rounded-full overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0">
                            {holdings.map((token, index) => {
                              // Simple pie chart segments
                              const startAngle =
                                holdings
                                  .slice(0, index)
                                  .reduce((sum, t) => sum + t.percentOfPortfolio, 0) * 3.6; // 3.6 = 360 / 100
                              const endAngle = startAngle + token.percentOfPortfolio * 3.6;
                              return (
                                <div
                                  key={token.id}
                                  style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    background: [
                                      '#3B82F6',
                                      '#10B981',
                                      '#F59E0B',
                                      '#EF4444',
                                      '#8B5CF6',
                                      '#EC4899',
                                      '#06B6D4',
                                      '#84CC16',
                                      '#F97316',
                                      '#6366F1',
                                    ][index % 10],
                                    clipPath: `conic-gradient(from ${startAngle}deg, transparent 0%, transparent 0%, currentColor 0%, currentColor 100%, transparent 100%)`,
                                  }}
                                />
                              );
                            })}
                          </div>
                          <div className="w-2/3 h-2/3 rounded-full bg-background flex items-center justify-center z-10">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{holdings.length}</div>
                              <div className="text-xs text-muted-foreground">Assets</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {holdings.map((token, index) => (
                            <div key={token.id} className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  background: [
                                    '#3B82F6',
                                    '#10B981',
                                    '#F59E0B',
                                    '#EF4444',
                                    '#8B5CF6',
                                    '#EC4899',
                                    '#06B6D4',
                                    '#84CC16',
                                    '#F97316',
                                    '#6366F1',
                                  ][index % 10],
                                }}
                              />
                              <div className="flex justify-between items-center w-full">
                                <span className="text-xs">{token.symbol}</span>
                                <span className="text-xs font-medium">
                                  {token.percentOfPortfolio.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border border-border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3">Performance</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>24h Change</span>
                              <span
                                className={
                                  portfolioChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                                }
                              >
                                {portfolioChange24h >= 0 ? '+' : ''}
                                {portfolioChange24h.toFixed(2)}%
                              </span>
                            </div>
                            <Progress
                              value={50 + portfolioChange24h}
                              max={100}
                              className={`h-2 ${portfolioChange24h >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            />
                          </div>

                          <div className="pt-4 border-t border-border">
                            <h5 className="text-sm font-medium mb-3">Top Performers (24h)</h5>
                            <div className="space-y-2">
                              {[...holdings]
                                .sort((a, b) => b.percentChange24h - a.percentChange24h)
                                .slice(0, 3)
                                .map(token => (
                                  <div key={token.id} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs mr-2">
                                        {token.symbol.substring(0, 2)}
                                      </div>
                                      <span className="text-sm">{token.name}</span>
                                    </div>
                                    <span
                                      className={`text-sm ${token.percentChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                      {token.percentChange24h >= 0 ? '+' : ''}
                                      {token.percentChange24h.toFixed(2)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
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
