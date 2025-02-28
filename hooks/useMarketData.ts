// @ts-nocheck
'use client';

import useSWR from 'swr';

interface MarketDataParams {
  category?: string;
  order?: string;
  perPage?: number;
  page?: number;
  sparkline?: boolean;
  priceChangePercentage?: string;
}

interface TokenParams {
  days?: number;
}

interface SearchParams {
  query: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await response.text();
    throw error;
  }
  return response.json();
};

/**
 * Hook to fetch market data for Solana tokens
 */
export function useMarketData(params: MarketDataParams = {}) {
  const {
    category = 'solana-ecosystem',
    order = 'market_cap_desc',
    perPage = 50,
    page = 1,
    sparkline = true,
    priceChangePercentage = '24h',
  } = params;

  const queryParams = new URLSearchParams({
    category,
    order,
    per_page: String(perPage),
    page: String(page),
    sparkline: String(sparkline),
    price_change_percentage: priceChangePercentage,
  });

  const url = `/api/market/data?${queryParams}`;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch trending tokens
 */
export function useTrendingTokens() {
  return useSWR('/api/market/trending', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 120000, // 2 minutes
  });
}

/**
 * Hook to fetch token data
 */
export function useTokenData(tokenId: string, params: TokenParams = {}) {
  const { days = 7 } = params;
  const url = tokenId ? `/api/token/${tokenId}?days=${days}` : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });
}

/**
 * Hook to search for tokens
 */
export function useTokenSearch(params: SearchParams) {
  const { query } = params;
  const url = query && query.length >= 2 ? `/api/search?q=${encodeURIComponent(query)}` : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 10000, // 10 seconds
  });
}
