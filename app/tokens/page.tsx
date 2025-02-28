// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { logger } from '@/lib/logger';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

// Mock data until API integration is complete
const mockTokens: Token[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 102.45,
    change24h: 5.23,
    volume24h: 1245678901,
    marketCap: 45678901234,
  },
  {
    id: 'bonk',
    name: 'Bonk',
    symbol: 'BONK',
    price: 0.000015,
    change24h: -2.12,
    volume24h: 45678901,
    marketCap: 1234567890,
  },
  {
    id: 'serum',
    name: 'Serum',
    symbol: 'SRM',
    price: 0.76,
    change24h: 1.34,
    volume24h: 34567890,
    marketCap: 345678901,
  },
];

export default function TokenExplorer() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API fetch
    const fetchTokens = async () => {
      try {
        // In a real app, fetch from an API:
        // const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem');
        // const data = await response.json();
        // setTokens(data);

        // Using mock data for now
        setTimeout(() => {
          setTokens(mockTokens);
          setLoading(false);
        }, 500);
      } catch (error) {
        logger.error('Error fetching tokens:', error);
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const filteredTokens = tokens.filter(
    token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Token Explorer</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full md:w-1/3 p-2 rounded-md border border-border bg-background text-foreground"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Name</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h Change</th>
                  <th className="text-right p-4 hidden md:table-cell">24h Volume</th>
                  <th className="text-right p-4 hidden md:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map(token => (
                  <tr key={token.id} className="border-b border-border hover:bg-card">
                    <td className="p-4">
                      <Link href={`/tokens/${token.id}`} className="flex items-center">
                        <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-muted-foreground">{token.symbol}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-right font-medium">
                      $
                      {token.price.toLocaleString(undefined, {
                        minimumFractionDigits: token.price < 0.01 ? 6 : 2,
                        maximumFractionDigits: token.price < 0.01 ? 6 : 2,
                      })}
                    </td>
                    <td
                      className={`p-4 text-right ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {token.change24h >= 0 ? '+' : ''}
                      {token.change24h.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      ${(token.volume24h / 1000000).toFixed(2)}M
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      ${(token.marketCap / 1000000000).toFixed(2)}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
