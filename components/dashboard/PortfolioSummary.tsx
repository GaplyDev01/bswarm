// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Plus, Wallet } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useWalletContext } from '@/context/WalletContext';
import Link from 'next/link';

interface PortfolioSummaryProps {
  className?: string;
}

// Mock portfolio data
const mockPortfolioData = {
  totalBalance: 32450.75,
  changePercent24h: 3.2,
  allocation: [
    { name: 'SOL', percent: 45, value: 14602.84, change24h: 4.2 },
    { name: 'RAY', percent: 15, value: 4867.61, change24h: 1.8 },
    { name: 'JUP', percent: 10, value: 3245.08, change24h: 6.7 },
    { name: 'BONK', percent: 5, value: 1622.54, change24h: -2.4 },
    { name: 'USDC', percent: 25, value: 8112.69, change24h: 0 },
  ],
  recentTransactions: [
    {
      type: 'buy',
      token: 'SOL',
      amount: 5.2,
      value: 624.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
    {
      type: 'sell',
      token: 'BONK',
      amount: 12500,
      value: 81.25,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
    {
      type: 'buy',
      token: 'JUP',
      amount: 150,
      value: 345.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ],
};

export function PortfolioSummary({ className = '' }: PortfolioSummaryProps) {
  const { connected } = useWalletContext();
  const [activeTab, setActiveTab] = useState('overview');

  // Format date to relative time (e.g., '2 days ago')
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Portfolio Overview</h2>
          <p className="text-muted-foreground">Track and manage your cryptocurrency investments</p>
        </div>

        <div className="flex gap-2">
          {!connected ? (
            <Button>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <Link href="/portfolio">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Manage Portfolio
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6 border-border">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Portfolio Value</p>
                <h3 className="text-3xl font-bold">
                  {formatCurrency(mockPortfolioData.totalBalance)}
                </h3>
                <div className="flex items-center mt-1">
                  {mockPortfolioData.changePercent24h > 0 ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {formatPercentage(mockPortfolioData.changePercent24h)}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" />
                      {formatPercentage(Math.abs(mockPortfolioData.changePercent24h))}
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-sm ml-2">24h</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Top Performer</p>
                  <p className="font-medium">JUP</p>
                  <Badge variant="success" className="mt-1">
                    +6.7%
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Worst Performer</p>
                  <p className="font-medium">BONK</p>
                  <Badge variant="destructive" className="mt-1">
                    -2.4%
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-border">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trading">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy Tokens
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    View Wallet
                  </Link>
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-border md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Top Holdings</h3>
              <div className="space-y-4">
                {mockPortfolioData.allocation.slice(0, 3).map(token => (
                  <div key={token.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{token.name}</span>
                      <span>{formatCurrency(token.value)}</span>
                    </div>
                    <Progress value={token.percent} className="h-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{token.percent}% of portfolio</span>
                      {token.change24h > 0 ? (
                        <span className="text-green-500">+{token.change24h}%</span>
                      ) : token.change24h < 0 ? (
                        <span className="text-red-500">{token.change24h}%</span>
                      ) : (
                        <span className="text-gray-500">0%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            <div className="space-y-6">
              {mockPortfolioData.allocation.map(token => (
                <div key={token.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{token.name}</span>
                    <span>{formatCurrency(token.value)}</span>
                  </div>
                  <Progress value={token.percent} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{token.percent}% of portfolio</span>
                    {token.change24h > 0 ? (
                      <span className="text-green-500">+{token.change24h}%</span>
                    ) : token.change24h < 0 ? (
                      <span className="text-red-500">{token.change24h}%</span>
                    ) : (
                      <span className="text-gray-500">0%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {mockPortfolioData.recentTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                    >
                      {tx.type === 'buy' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.token}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getRelativeTime(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {tx.amount} {tx.token}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(tx.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
