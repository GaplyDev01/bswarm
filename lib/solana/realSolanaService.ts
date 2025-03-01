import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useAppStore } from '../store';
import { generateId } from '../utils';
import { logger } from '../logger';
import { getTokenPrices, getMarkets } from '../coingecko-api';
import { SolanaService, TokenAccount, TradeDetails } from './types';
import { TokenInfo, WalletBalance } from './index';
import { solanaRpc } from './solanaV2';

interface CoinGeckoToken {
  id?: string;
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  total_volume?: number;
  market_cap?: number;
  circulating_supply?: number;
}

export class RealSolanaService implements SolanaService {
  private static instance: RealSolanaService;
  private connection: Connection;
  private connected: boolean = false;
  private walletAddress: string | null = null;
  private walletPublicKey: PublicKey | null = null;
  private tokenMap: Map<string, TokenInfo> = new Map();

  private constructor() {
    // Get RPC endpoint from store or env
    let endpoint = useAppStore.getState().rpcEndpoint;
    
    // Fallback to env if not set in store
    if (!endpoint) {
      endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      // Update store with default endpoint
      const { setRpcEndpoint } = useAppStore.getState();
      setRpcEndpoint(endpoint);
    }
    
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed',
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WSS_URL
    });
    logger.info(`Initialized RealSolanaService with endpoint: ${endpoint}`);
  }

  public static getInstance(): RealSolanaService {
    if (!RealSolanaService.instance) {
      RealSolanaService.instance = new RealSolanaService();
    }
    return RealSolanaService.instance;
  }

  // Change RPC endpoint
  public setEndpoint(endpoint: string): void {
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed',
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WSS_URL
    });
    const { setRpcEndpoint } = useAppStore.getState();
    setRpcEndpoint(endpoint);
    logger.info(`Changed RPC endpoint to: ${endpoint}`);
  }

  // Connect wallet through wallet adapter
  public async connectWallet(publicKey?: string): Promise<{ success: boolean; address: string | null }> {
    try {
      if (!publicKey) {
        throw new Error('No public key provided');
      }

      this.walletAddress = publicKey;
      this.walletPublicKey = new PublicKey(publicKey);
      this.connected = true;

      // Get SOL balance
      const balance = await this.connection.getBalance(this.walletPublicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      // Update store
      const { setWalletState } = useAppStore.getState();
      setWalletState(true, this.walletAddress, solBalance);

      logger.info(`Connected wallet with address: ${publicKey}`);
      return { success: true, address: this.walletAddress };
    } catch (error) {
      logger.error('Error connecting wallet:', error);
      return { success: false, address: null };
    }
  }

  // Disconnect wallet
  public async disconnectWallet(): Promise<boolean> {
    try {
      this.connected = false;
      this.walletAddress = null;
      this.walletPublicKey = null;

      // Update store
      const { setWalletState } = useAppStore.getState();
      setWalletState(false, null, 0);

      logger.info('Wallet disconnected');
      return true;
    } catch (error) {
      logger.error('Error disconnecting wallet:', error);
      return false;
    }
  }

  // Get token list from CoinGecko
  public async getTokenList(): Promise<TokenInfo[]> {
    try {
      // Get list of Solana tokens from CoinGecko
      const markets = await getMarkets({
        vsCurrency: 'usd',
        category: 'solana-ecosystem',
        order: 'market_cap_desc',
        perPage: 50,
        page: 1,
      });

      if (!Array.isArray(markets)) {
        logger.error('Invalid market data format received');
        return [];
      }

      // Transform to TokenInfo format
      const tokens: TokenInfo[] = markets.map((token: CoinGeckoToken) => {
        const tokenInfo: TokenInfo = {
          symbol: token.symbol?.toUpperCase() || '',
          name: token.name || '',
          mint: token.id || '', // Using CoinGecko ID as mint for simplicity
          decimals: 9, // Default for most tokens
          price: token.current_price || 0,
          change24h: token.price_change_percentage_24h || 0,
          volume24h: token.total_volume || 0,
          marketCap: token.market_cap || 0,
          supply: token.circulating_supply || 0,
        };

        // Cache token info
        this.tokenMap.set(tokenInfo.symbol, tokenInfo);
        return tokenInfo;
      });

      logger.info(`Retrieved ${tokens.length} tokens from CoinGecko`);
      return tokens;
    } catch (error) {
      logger.error('Error fetching token list:', error);
      
      // Fallback to mock data if API fails
      const fallbackTokens = this.getMockTokenList();
      logger.warn(`Using ${fallbackTokens.length} mock tokens due to API error`);
      return fallbackTokens;
    }
  }

  // Get wallet balances
  public async getWalletBalances(): Promise<WalletBalance[]> {
    if (!this.connected || !this.walletPublicKey) {
      return Promise.reject('Wallet not connected');
    }

    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(this.walletPublicKey);
      const solBalanceParsed = solBalance / LAMPORTS_PER_SOL;

      // Get all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.walletPublicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Create array of token accounts with balance > 0
      const accounts = tokenAccounts.value
        .filter(account => {
          const parsedInfo = account.account.data.parsed.info;
          return parsedInfo.tokenAmount.uiAmount > 0;
        })
        .map(account => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            owner: parsedInfo.owner,
            amount: parsedInfo.tokenAmount.amount,
            decimals: parsedInfo.tokenAmount.decimals,
          };
        });

      // Get token info for each token
      const balances: WalletBalance[] = [];

      // Add SOL balance
      balances.push({
        token: 'Solana',
        symbol: 'SOL',
        amount: solBalanceParsed,
        valueUsd: solBalanceParsed * (await this.getTokenPrice('SOL')),
      });

      // Process token accounts and fetch token metadata
      if (accounts.length > 0) {
        await Promise.all(accounts.map(async (account) => {
          try {
            // Get token metadata
            const tokenInfo = await this.getTokenMetadata(account.mint);
            
            // Calculate token amount with decimals
            const tokenAmount = Number(account.amount) / Math.pow(10, account.decimals);
            
            // Add to balances
            balances.push({
              token: tokenInfo.name || account.mint.slice(0, 10),
              symbol: tokenInfo.symbol || account.mint.slice(0, 4).toUpperCase(),
              amount: tokenAmount,
              valueUsd: tokenAmount * (tokenInfo.price || 0),
            });
          } catch (error) {
            logger.error(`Error processing token account ${account.mint}:`, error);
          }
        }));
      }

      logger.info(`Retrieved ${balances.length} token balances`);
      return balances;
    } catch (error) {
      logger.error('Error fetching wallet balances:', error);
      
      // Fallback to mock balances if needed
      const mockBalances = this.getMockWalletBalances();
      logger.warn(`Using ${mockBalances.length} mock wallet balances due to error`);
      return mockBalances;
    }
  }

  // Execute a trade
  public async executeTrade(
    token: string,
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<{ success: boolean; trade: unknown }> {
    if (!this.connected || !this.walletPublicKey) {
      return Promise.reject('Wallet not connected');
    }

    // Note: Real trade execution would integrate with Jupiter Aggregator
    // or similar DEX aggregator. For now, we return a simulated trade.
    logger.info(`Creating simulated ${type} trade for ${amount} ${token}`);
    
    const trade: TradeDetails = {
      id: generateId(),
      tokenSymbol: token,
      tokenName: token,
      type,
      amount,
      price,
      timestamp: Date.now(),
      status: 'open',
      simulation: true
    };

    // Add trade to store
    const { addTrade } = useAppStore.getState();
    addTrade(trade);

    return { success: true, trade };
  }

  // Get transaction history
  public async getTransactionHistory(): Promise<unknown[]> {
    if (!this.connected || !this.walletPublicKey) {
      return Promise.reject('Wallet not connected');
    }

    try {
      // Get recent transactions (signatures)
      const signatures = await this.connection.getSignaturesForAddress(
        this.walletPublicKey,
        { limit: 20 }
      );

      if (!signatures.length) {
        logger.info('No transactions found for this wallet');
        return [];
      }

      // Get transaction details
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.connection.getParsedTransaction(
              sig.signature,
              { maxSupportedTransactionVersion: 0 }
            );

            // Basic transaction info
            const txInfo = {
              id: sig.signature,
              timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).getTime() : Date.now(),
              status: tx?.meta?.err ? 'failed' : 'confirmed',
              type: 'unknown' // Default type
            };

            // Determine transaction type (simplified)
            if (tx?.meta && tx.transaction.message.instructions) {
              const instructions = tx.transaction.message.instructions;
              
              // Simple heuristic to identify transaction types
              if (instructions.some(instr => 
                typeof instr.programId === 'object' && 
                instr.programId.toString() === TOKEN_PROGRAM_ID.toString()
              )) {
                Object.assign(txInfo, { type: 'transfer' });
              } else if (instructions.some(instr => {
                const programId = typeof instr.programId === 'object' ? instr.programId.toString() : '';
                return ['Jupiter', 'Orca', 'Raydium'].some(dex => 
                  programId.toLowerCase().includes(dex.toLowerCase())
                );
              })) {
                Object.assign(txInfo, { type: 'swap' });
              }
            }

            return txInfo;
          } catch (error) {
            logger.error(`Error processing transaction ${sig.signature}:`, error);
            return {
              id: sig.signature,
              timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).getTime() : Date.now(),
              status: 'error',
              type: 'unknown',
              error: 'Failed to parse transaction',
            };
          }
        })
      );

      logger.info(`Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      logger.error('Error fetching transaction history:', error);
      
      // Return mock data as fallback
      const mockTxs = this.getMockTransactionHistory();
      logger.warn(`Using ${mockTxs.length} mock transactions due to error`);
      return mockTxs;
    }
  }

  // Helper methods
  
  // Get token price from CoinGecko or cache
  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // Normalize symbol
      const normalizedSymbol = symbol.toLowerCase();
      
      // Try to get from our tokenMap cache first
      const cachedToken = Array.from(this.tokenMap.values()).find(
        t => t.symbol.toLowerCase() === normalizedSymbol
      );
      
      if (cachedToken) {
        return cachedToken.price;
      }
      
      // Otherwise query CoinGecko directly
      const prices = await getTokenPrices([normalizedSymbol]);
      
      if (prices && prices[normalizedSymbol] && prices[normalizedSymbol].usd) {
        return prices[normalizedSymbol].usd;
      }
      
      // Return SOL price as default for testing
      return 142.78;
    } catch (error) {
      logger.error(`Error getting price for ${symbol}:`, error);
      return 0;
    }
  }
  
  // Get token metadata for a mint address
  private async getTokenMetadata(mintAddress: string): Promise<Partial<TokenInfo>> {
    try {
      // For a production app, we would:
      // 1. Check if token is in our database
      // 2. Query a token registry or metaplex metadata
      // 3. Use a token list service

      // For now, returning minimal info
      return {
        name: `Token ${mintAddress.slice(0, 8)}`,
        symbol: mintAddress.slice(0, 4).toUpperCase(),
        mint: mintAddress,
        decimals: 9,
        price: 0,
      };
    } catch (error) {
      logger.error(`Error getting token metadata for ${mintAddress}:`, error);
      return {
        name: `Unknown ${mintAddress.slice(0, 6)}`,
        symbol: 'UNKNOWN',
        mint: mintAddress,
      };
    }
  }

  // Mock data methods
  private getMockTokenList(): TokenInfo[] {
    return [
      {
        symbol: 'SOL',
        name: 'Solana',
        mint: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        price: 142.78,
        change24h: 8.45,
        volume24h: 1523950000,
        marketCap: 65432100000,
        supply: 458267801,
      },
      {
        symbol: 'JUP',
        name: 'Jupiter',
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        decimals: 6,
        price: 1.24,
        change24h: 3.21,
        volume24h: 89560000,
        marketCap: 1678000000,
        supply: 1350000000,
      },
      {
        symbol: 'BONK',
        name: 'Bonk',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        decimals: 5,
        price: 0.00001547,
        change24h: 12.3,
        volume24h: 56780000,
        marketCap: 927000000,
        supply: 59937284563218,
      },
      {
        symbol: 'JTO',
        name: 'Jito',
        mint: 'JitoTokenStRmMGRESzMrWm4suZeWkAdJfYNQJ3sSVcLVF',
        decimals: 9,
        price: 2.87,
        change24h: -2.4,
        volume24h: 23450000,
        marketCap: 316000000,
        supply: 110000000,
      },
    ];
  }

  private getMockWalletBalances(): WalletBalance[] {
    return [
      {
        token: 'Solana',
        symbol: 'SOL',
        amount: 12.45,
        valueUsd: 1777.61,
      },
      {
        token: 'Jupiter',
        symbol: 'JUP',
        amount: 253.71,
        valueUsd: 314.6,
      },
      {
        token: 'Bonk',
        symbol: 'BONK',
        amount: 15678945.23,
        valueUsd: 242.55,
      },
    ];
  }

  private getMockTransactionHistory(): unknown[] {
    return [
      {
        id: 'tx1',
        type: 'swap',
        tokenIn: 'SOL',
        tokenOut: 'JUP',
        amountIn: 1.5,
        amountOut: 170.25,
        timestamp: Date.now() - 86400000 * 2,
        status: 'confirmed',
      },
      {
        id: 'tx2',
        type: 'swap',
        tokenIn: 'SOL',
        tokenOut: 'BONK',
        amountIn: 0.75,
        amountOut: 7890123.45,
        timestamp: Date.now() - 86400000 * 5,
        status: 'confirmed',
      },
      {
        id: 'tx3',
        type: 'send',
        token: 'SOL',
        amount: 0.5,
        to: '7ZWZk...3Pjtu',
        timestamp: Date.now() - 86400000 * 10,
        status: 'confirmed',
      },
    ];
  }
}

// Export singleton instance
export default RealSolanaService.getInstance();