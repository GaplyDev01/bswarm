'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import TradingViewWidget from '@/components/TradingViewWidget';

interface TradingChartsProps {
  className?: string;
}

export function TradingCharts({ className = '' }: TradingChartsProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'line'> | ('area' > 'candlestick');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [tradingPair, setTradingPair] = useState<string>('SOLUSDT');

  const popularPairs = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
    { value: 'RAYUSDT', label: 'RAY/USDT' },
    { value: 'BONKUSDT', label: 'BONK/USDT' },
    { value: 'JUPUSDT', label: 'JUP/USDT' },
  ];

  const timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Advanced Charts</h2>
          <p className="text-muted-foreground">
            Analyze market trends with professional-grade charts
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={tradingPair} onValueChange={setTradingPair}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select pair" />
            </SelectTrigger>
            <SelectContent>
              {popularPairs.map(pair => (
                <SelectItem key={pair.value} value={pair.value}>
                  {pair.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-1 overflow-hidden border-border bg-card">
        <div className="h-[600px] rounded-md overflow-hidden">
          <TradingViewWidget
            symbol={tradingPair}
            theme="dark"
            chartType={chartType === 'candlestick' ? 'candlestick' : chartType}
            autosize
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-3">Market Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-medium">$3.24T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-medium">$128.7B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTC Dominance</span>
              <span className="font-medium">52.4%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-3">Top Gainers (24h)</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">JUP</span>
              <span className="font-medium text-green-500">+14.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BONK</span>
              <span className="font-medium text-green-500">+9.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RAY</span>
              <span className="font-medium text-green-500">+7.5%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-3">Top Losers (24h)</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MSOL</span>
              <span className="font-medium text-red-500">-4.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PYTH</span>
              <span className="font-medium text-red-500">-3.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ORCA</span>
              <span className="font-medium text-red-500">-2.8%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
