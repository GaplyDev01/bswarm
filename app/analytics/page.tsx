'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import MetricsChart from '@/components/metrics/MetricsChart';
import BackNavigation from '@/components/BackNavigation';

// Mock data generator for demo purposes
const generateMockData = (days: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();

  for (let i = 0; i < days; i++) {
    // Go back 'days' number of days and create a data point for each day
    const date = new Date();
    date.setDate(now.getDate() - (days - i));

    // Add some random movement to the value
    const change = (Math.random() - 0.5) * volatility;
    currentValue = Math.max(0.1, currentValue * (1 + change));

    data.push({
      timestamp: date.toISOString(),
      value: currentValue,
      volume: currentValue * (0.5 + Math.random()),
    });
  }

  return data;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [timeframe, setTimeframe] = useState<'7d' | '30d'> | ('90d' > '30d');
  const [metricType, setMetricType] = (useState < 'price') | ('volume' >> 'price');
  const [chartData, setChartData] = useState<unknown[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // Generate mock data based on selected timeframe
  useEffect(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    setChartData(generateMockData(days, 100, 0.05));
  }, [timeframe]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Welcome, {user?.firstName || user?.username || 'Trader'}. View your performance
              metrics.
            </p>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <div className="bg-[#0A0A0A] rounded-md p-1 inline-flex">
              {(['7d', '30d', '90d'] as const).map(option => (
                <button
                  key={option}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    timeframe === option
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setTimeframe(option)}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="bg-[#0A0A0A] rounded-md p-1 inline-flex">
              {(['price', 'volume'] as const).map(option => (
                <button
                  key={option}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    metricType === option
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setMetricType(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0D0D0D] rounded-lg border border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">
            {metricType === 'price' ? 'Price History' : 'Volume Analysis'}
          </h2>
          <div className="h-[400px]">
            <MetricsChart
              data={chartData}
              type={metricType === 'price' ? 'area' : 'bar'}
              height={350}
              yDataKey={metricType === 'price' ? 'value' : 'volume'}
              color={metricType === 'price' ? '#3B82F6' : '#10B981'}
              tooltipFormatter={value => `$${value.toFixed(2)}`}
              showGrid
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D0D0D] rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Performance Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Portfolio Value</span>
                  <span className="text-white font-medium">$1,245.87</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Total Profit/Loss</span>
                  <span className="text-green-500 font-medium">+$102.32 (8.2%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-medium">73%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Top Asset Performance</span>
                  <span className="text-green-500 font-medium">BONK +12.3%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0D0D0D] rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Trading Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-gray-800">
                <div>
                  <div className="text-gray-400 text-sm">Total Trades</div>
                  <div className="text-white text-xl font-medium">12</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Avg. Trade Size</div>
                  <div className="text-white text-xl font-medium">$42.67</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Trade Frequency</div>
                  <div className="text-white text-xl font-medium">1.4/day</div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Recent Trades</h3>
                <div className="space-y-2">
                  {[
                    { token: 'SOL', type: 'buy', amount: 0.5, price: 142.78, time: '2h ago' },
                    {
                      token: 'BONK',
                      type: 'sell',
                      amount: 5000,
                      price: 0.00001547,
                      time: '5h ago',
                    },
                    { token: 'JUP', type: 'buy', amount: 12.5, price: 1.24, time: '1d ago' },
                  ].map((trade, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-black/20 rounded-md p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`px-2 py-1 rounded text-xs ${
                            trade.type === 'buy'
                              ? 'bg-green-900/30 text-green-500'
                              : 'bg-red-900/30 text-red-500'
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </div>
                        <div className="text-white">{trade.token}</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {trade.amount} @ $
                        {trade.price < 0.01 ? trade.price.toFixed(8) : trade.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{trade.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
