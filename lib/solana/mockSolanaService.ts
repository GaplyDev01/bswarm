import { useAppStore } from '../store';
import { generateId } from '../utils';
import { logger } from '../logger';
import { SolanaService } from './types';
import { TokenInfo, WalletBalance } from './index';
import { TradeDetails, TransactionDetails } from './types';

export class MockSolanaService implements SolanaService {
  private static instance: MockSolanaService;
  private endpoint: string;
  private connected: boolean = false;
  private walletAddress: string | null = null;

  private constructor() {
    const { rpcEndpoint } = useAppStore.getState();
    this.endpoint = rpcEndpoint || 'https://api.devnet.solana.com';
    logger.info('Initialized MockSolanaService');
  }

  public static getInstance(): MockSolanaService {
    if (!MockSolanaService.instance) {
      MockSolanaService.instance = new MockSolanaService();
    }
    return MockSolanaService.instance;
  }

  // Optional method to change the endpoint
  public setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
    logger.info(`Changed RPC endpoint to: ${endpoint}`);
  }

  // Connect wallet (simulation)
  public async connectWallet(publicKey?: string): Promise<{ success: boolean; address: string | null }> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.connected = true;
        // Use provided key or generate a mock one
        this.walletAddress = publicKey || 'ABCDEFGhijklmnopqrstuvwxyz123456789ABCDE';

        // Update store
        const { setWalletState } = useAppStore.getState();
        setWalletState(true, this.walletAddress, 12.45);

        logger.info(`Connected mock wallet with address: ${this.walletAddress}`);
        resolve({ success: true, address: this.walletAddress });
      }, 500);
    });
  }

  // Disconnect wallet
  public async disconnectWallet(): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.connected = false;
        this.walletAddress = null;

        // Update store
        const { setWalletState } = useAppStore.getState();
        setWalletState(false, null, 0);

        logger.info('Disconnected mock wallet');
        resolve(true);
      }, 300);
    });
  }

  // Get token list
  public async getTokenList(): Promise<TokenInfo[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockTokens: TokenInfo[] = [
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
        
        logger.info(`Returning ${mockTokens.length} mock tokens`);
        resolve(mockTokens);
      }, 500);
    });
  }

  // Get wallet balances
  public async getWalletBalances(): Promise<WalletBalance[]> {
    if (!this.connected || !this.walletAddress) {
      return Promise.reject('Wallet not connected');
    }

    return new Promise(resolve => {
      setTimeout(() => {
        const mockBalances: WalletBalance[] = [
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
        
        logger.info(`Returning ${mockBalances.length} mock token balances`);
        resolve(mockBalances);
      }, 500);
    });
  }

  // Execute a trade
  public async executeTrade(
    token: string,
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<{ success: boolean; trade: unknown }> {
    if (!this.connected || !this.walletAddress) {
      return Promise.reject('Wallet not connected');
    }

    return new Promise(resolve => {
      setTimeout(() => {
        const trade: TradeDetails = {
          id: generateId(),
          tokenSymbol: token,
          tokenName: token,
          type,
          amount,
          price,
          timestamp: Date.now(),
          status: 'open',
        };

        // Add trade to store
        const { addTrade } = useAppStore.getState();
        addTrade(trade);

        logger.info(`Executed mock ${type} trade for ${amount} ${token}`);
        resolve({ success: true, trade });
      }, 800);
    });
  }

  // Get transaction history
  public async getTransactionHistory(): Promise<unknown[]> {
    if (!this.connected || !this.walletAddress) {
      return Promise.reject('Wallet not connected');
    }

    return new Promise(resolve => {
      setTimeout(() => {
        const mockTransactions: TransactionDetails[] = [
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
        
        logger.info(`Returning ${mockTransactions.length} mock transactions`);
        resolve(mockTransactions);
      }, 600);
    });
  }
}

// Export singleton instance
export default MockSolanaService.getInstance();

// Create a new instance for testing or special cases
export function createMockSolanaService(): SolanaService {
  return MockSolanaService.getInstance();
}