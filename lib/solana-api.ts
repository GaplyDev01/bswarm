// @ts-nocheck
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { logger } from '@/lib/logger';

// Initialize a connection to the Solana network
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

/**
 * Get the SOL balance for a wallet address
 */
export async function getSolBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    logger.error('Error fetching SOL balance:', error);
    return 0;
  }
}

/**
 * Get token balances for a wallet address
 * This is a simplified version - a real implementation would use
 * the Token Program or SPL Token extensions for a complete solution
 */
export async function getTokenBalances(address: string): Promise<any[]> {
  try {
    const publicKey = new PublicKey(address);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    return tokenAccounts.value.map(tokenAccount => {
      const accountData = tokenAccount.account.data.parsed.info;
      return {
        mint: accountData.mint,
        amount:
          Number(accountData.tokenAmount.amount) / Math.pow(10, accountData.tokenAmount.decimals),
        decimals: accountData.tokenAmount.decimals,
      };
    });
  } catch (error) {
    logger.error('Error fetching token balances:', error);
    return [];
  }
}

/**
 * Get recent transactions for a wallet address
 */
export async function getRecentTransactions(address: string): Promise<any[]> {
  try {
    const publicKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });

    const transactions = await Promise.all(
      signatures.map(async sig => {
        const tx = await connection.getParsedTransaction(sig.signature);
        return {
          signature: sig.signature,
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : new Date(),
          successful: tx?.meta?.err === null,
          // A real implementation would parse the transaction data more thoroughly
        };
      })
    );

    return transactions;
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Get market price data from CoinGecko API
 */
export async function getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    if (!tokens.length) return {};

    // Import the API function from coingecko-api.ts
    const { getTokenPrices: fetchTokenPrices } = await import('./coingecko-api');

    // Get prices from CoinGecko API
    const priceData = await fetchTokenPrices(tokens);

    // Convert the response to the expected format
    return Object.entries(priceData).reduce(
      (acc, [tokenId, data]) => {
        if (data && data.usd) {
          acc[tokenId] = data.usd;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    logger.error('Error fetching token prices:', error);
    // Fallback to empty object on error
    return {};
  }
}

/**
 * Get data for a specific token from CoinGecko API
 */
export async function getTokenData(tokenId: string): Promise<unknown> {
  try {
    if (!tokenId) return null;

    // Import the API function from coingecko-api.ts
    const { getTokenData: fetchTokenData } = await import('./coingecko-api');

    // Get detailed token data from CoinGecko API
    const tokenData = await fetchTokenData(tokenId);

    if (!tokenData) return null;

    // Transform to consistent format
    return {
      id: tokenData.id,
      name: tokenData.name,
// @ts-ignore
      symbol: tokenData.symbol.toUpperCase(),
// @ts-ignore
      price: tokenData.market_data?.current_price?.usd || 0,
// @ts-ignore
      change24h: tokenData.market_data?.price_change_percentage_24h || 0,
// @ts-ignore
      volume24h: tokenData.market_data?.total_volume?.usd || 0,
// @ts-ignore
      marketCap: tokenData.market_data?.market_cap?.usd || 0,
// @ts-ignore
      description: tokenData.description?.en || '',
// @ts-ignore
      website: tokenData.links?.homepage?.[0] || '',
// @ts-ignore
      explorer: tokenData.links?.blockchain_site?.[0] || '',
      social: {
// @ts-ignore
        twitter: tokenData.links?.twitter_screen_name || '',
// @ts-ignore
        telegram: tokenData.links?.telegram_channel_identifier || '',
// @ts-ignore
        reddit: tokenData.links?.subreddit_url || '',
      },
// @ts-ignore
      image: tokenData.image?.small || '',
    };
  } catch (error) {
    logger.error('Error fetching token data:', error);
    return null;
  }
}
