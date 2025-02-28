// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

// API rate limiting and caching
const API_CACHE = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache
const RATE_LIMIT_WAIT = 15000; // Wait 15 seconds between API calls

let lastCallTimestamp = 0;

export async function fetchWithRateLimit(url: string, options = {}) {
  const now = Date.now();

  // Check cache first
  if (API_CACHE.has(url)) {
    const cached = API_CACHE.get(url)!;
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  // Respect rate limit
  const timeElapsed = now - lastCallTimestamp;
  if (timeElapsed < RATE_LIMIT_WAIT) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WAIT - timeElapsed));
  }

  // Make the API call
  try {
    lastCallTimestamp = Date.now();
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Cache the _result
    API_CACHE.set(url, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    logger.error('API fetch error:', error);
    throw error;
  }
}

// Helper to identify Solana tokens
function isSolanaToken(coin: unknown) {
  try {
// @ts-ignore
    if (coin.platforms && coin.platforms.solana) return true;
// @ts-ignore
    if (coin.item && coin.item.platforms && coin.item.platforms.solana) return true;
    return false;
  } catch (error) {
    logger.error('Error checking Solana token:', error);
    return false;
  }
}

// Token API hooks
export function useTokenSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTokens = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use our API instead of direct CoinGecko calls
        const response = await fetch(`/api/token/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setResults(data.tokens || []);
        } else {
          throw new Error(data.error || 'Search failed');
        }
      } catch (error) {
        logger.error('Search error:', error);
        setError(error instanceof Error ? error.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchTokens();
  }, [query]);

  return { results, isLoading, error };
}

export function useTrendingTokens() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use our API instead of direct CoinGecko calls
      const response = await fetch('/api/market/trending');

      if (!response.ok) {
        throw new Error(`Failed to fetch trending tokens: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTokens(data.tokens || []);
      } else {
        throw new Error(data.error || 'Failed to fetch trending tokens');
      }
    } catch (error) {
      logger.error('Failed to fetch trending tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch trending tokens');
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();

    // Refresh data periodically
    const interval = setInterval(fetchTrending, 60000); // Every minute
    return () => clearInterval(interval);
  }, [fetchTrending]);

  return { tokens, isLoading, error, refresh: fetchTrending };
}

export async function getTokenData(tokenId: string) {
  try {
    // Use our API instead of direct CoinGecko calls
    const response = await fetch(`/api/token/info?id=${encodeURIComponent(tokenId)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch token data: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch token data');
    }

    return data.token;
  } catch (error) {
    logger.error('Error fetching token data:', error);
    throw error;
  }
}

export async function getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    if (tokens.length === 0) return {};

    // Use our API instead of direct CoinGecko calls
    const response = await fetch(`/api/token/prices?ids=${tokens.join(',')}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch token prices: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch token prices');
    }

    return data.prices || {};
  } catch (error) {
    logger.error('Error fetching token prices:', error);
    throw error;
  }
}

// Trading API hooks
export function useAIStrategies() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/trading/strategies');

        if (!response.ok) {
          throw new Error(`Failed to fetch strategies: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setTemplates(data.templates || []);
        } else {
          throw new Error(data.error || 'Failed to fetch strategies');
        }
      } catch (error) {
        logger.error('Error fetching strategies:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch strategies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return { templates, isLoading, error };
}

export function useUserStrategies(userId: string) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/trading/user-strategies?userId=${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user strategies: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStrategies(data.strategies || []);
      } else {
        throw new Error(data.error || 'Failed to fetch user strategies');
      }
    } catch (error) {
      logger.error('Error fetching user strategies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user strategies');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return { strategies, isLoading, error, refresh: fetchStrategies };
}

export function useStrategyPositions(userStrategyId: string | null) {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!userStrategyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/trading/positions?userStrategyId=${encodeURIComponent(userStrategyId)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPositions(data.positions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch positions');
      }
    } catch (error) {
      logger.error('Error fetching positions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch positions');
    } finally {
      setIsLoading(false);
    }
  }, [userStrategyId]);

  useEffect(() => {
    fetchPositions();

    // Refresh positions regularly
    const interval = setInterval(fetchPositions, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPositions]);

  return { positions, isLoading, error, refresh: fetchPositions };
}

export function useAISignals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trading/signals');

      if (!response.ok) {
        throw new Error(`Failed to fetch signals: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSignals(data.signals || []);
      } else {
        throw new Error(data.error || 'Failed to fetch signals');
      }
    } catch (error) {
      logger.error('Error fetching signals:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch signals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();

    // Refresh signals regularly
    const interval = setInterval(fetchSignals, 60000); // Every minute
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return { signals, isLoading, error, refresh: fetchSignals };
}
