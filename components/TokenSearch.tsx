// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { getPriceChangeColor } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface TokenSearchProps {
  onSelectToken: (token: Token) => void;
}

export function TokenSearch({ onSelectToken }: TokenSearchProps) {
  const [query, setQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search for tokens when query changes
  useEffect(() => {
    async function searchTokens() {
      if (query.trim().length === 0) {
        setTokens([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        logger.log(`Searching for tokens with query: ${query}`);

        try {
          // Make fetch request timeout after 5 seconds
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          // Add more detailed error handling for the fetch operation
          const response = await fetch(`/api/token/search?query=${encodeURIComponent(query)}`, {
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          logger.log(`Search response status: ${response.status}, ok: ${response.ok}`);

          if (response.ok) {
            try {
              const data = await response.json();
              logger.log(`Found ${data.length} tokens:`, data);

              if (Array.isArray(data)) {
                setTokens(data);
              } else {
                logger.log('API returned invalid data format');
                setTokens([]);
              }
            } catch (jsonError) {
              logger.error('Error parsing JSON response:', jsonError);
              setTokens([]);
            }
          } else {
            // Get detailed error information
            try {
              const errorText = await response.text();
              logger.error(`Error response from search API (${response.status}): ${errorText}`);
            } catch (textError) {
              logger.error(`Could not read error response: ${textError}`);
            }

            // No fallback, just set empty tokens array
            logger.log('Search API error, no results available');
            setTokens([]);
          }
        } catch (fetchError) {
          logger.error('Fetch operation failed:', fetchError);
          // No fallback, just set empty tokens array
          logger.log('Fetch error, no results available');
          setTokens([]);
        }
      } catch (error) {
        logger.error('Error searching tokens:', error);
        // No fallback, set empty array
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(searchTokens, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle token selection
  function handleSelectToken(token: Token) {
    onSelectToken(token);
    setQuery('');
    setFocused(false);
  }

  // Clear search
  function clearSearch() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search for Solana tokens..."
          className="px-10 py-3 bg-background text-foreground border border-input rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {focused && query.trim().length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-1 w-full max-h-96 overflow-auto bg-card border border-border rounded-lg shadow-xl"
        >
          {loading && (
            <div className="py-4 px-3 text-center">
              <div className="flex justify-center items-center space-x-2">
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          )}

          {!loading && tokens.length === 0 && (
            <div className="py-4 px-3 text-center text-muted-foreground">
              No tokens found. Try a different search term.
            </div>
          )}

          {!loading &&
            tokens.map(token => (
              <div
                key={token.id}
                className="px-4 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                onClick={() => handleSelectToken(token)}
              >
                <div className="flex items-center">
                  <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-bold text-foreground">{token.name}</div>
                      <div className="font-mono text-foreground">
                        ${token.current_price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">{token.symbol.toUpperCase()}</div>
                      <div className={getPriceChangeColor(token.price_change_percentage_24h)}>
                        {token.price_change_percentage_24h > 0 ? '+' : ''}
                        {token.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
