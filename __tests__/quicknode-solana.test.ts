// @ts-nocheck
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Create mock implementation first
const mockConnection = {
  getLatestBlockhash: jest.fn().mockResolvedValue({
    blockhash: 'mockBlockhash123',
    lastValidBlockHeight: 12345,
  }),
  getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL in lamports
  getSlot: jest.fn().mockResolvedValue(12345678),
  getTokenAccountsByOwner: jest.fn().mockResolvedValue({
    value: [
      {
        pubkey: { toBase58: () => 'mockTokenAccount1' },
        account: {
          data: {
            parsed: {
              info: {
                mint: 'mockMint1',
                owner: 'mockOwner1',
                tokenAmount: {
                  amount: '100000000',
                  decimals: 6,
                  uiAmount: 100,
                },
              },
            },
          },
        },
      },
    ],
  }),
};

// Mock the web3.js connection
jest.mock('@solana/web3.js', () => {
  const ConnectionMock = jest.fn().mockImplementation(() => mockConnection);

  return {
    Connection: ConnectionMock,
    clusterApiUrl: jest.fn().mockReturnValue('https://api.devnet.solana.com'),
    PublicKey: jest.fn().mockImplementation(address => ({
      toBase58: () => address,
      toString: () => address,
    })),
  };
});

// Mock environment variables
process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://solana-devnet.quiknode.pro/your-token/';
process.env.NEXT_PUBLIC_SOLANA_WSS_URL = 'wss://solana-devnet.quiknode.pro/your-token/';

describe('QuickNode Solana Integration', () => {
  let connection: Connection;
  const { Connection: ConnectionMock } = require('@solana/web3.js');

  beforeEach(() => {
    jest.clearAllMocks();
    connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'fallback');
  });

  it('should establish connection with QuickNode endpoint', () => {
    expect(connection).toBeDefined();
    expect(ConnectionMock).toHaveBeenCalledWith(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
  });

  it('should retrieve latest blockhash', async () => {
    const result = await connection.getLatestBlockhash();

    expect(result).toEqual({
      blockhash: 'mockBlockhash123',
      lastValidBlockHeight: 12345,
    });
    expect(mockConnection.getLatestBlockhash).toHaveBeenCalled();
  });

  it('should get balance for an account', async () => {
    const mockWalletAddress = new PublicKey('mockWalletAddress');
    const balance = await connection.getBalance(mockWalletAddress);

    expect(balance).toBe(1000000000); // 1 SOL in lamports
    expect(mockConnection.getBalance).toHaveBeenCalledWith(mockWalletAddress);
  });

  it('should get token accounts by owner', async () => {
    const mockWalletAddress = new PublicKey('mockWalletAddress');
    const mockTokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

    const accounts = await connection.getTokenAccountsByOwner(mockWalletAddress, {
      programId: mockTokenProgramId,
    });

    expect(accounts.value).toHaveLength(1);
    expect(accounts.value[0].pubkey.toBase58()).toBe('mockTokenAccount1');
    expect(accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount).toBe(100);
    expect(mockConnection.getTokenAccountsByOwner).toHaveBeenCalledWith(mockWalletAddress, {
      programId: mockTokenProgramId,
    });
  });

  // Custom test for QuickNode-specific functionality
  it('should handle QuickNode connection errors gracefully', async () => {
    // Mock a connection error
    mockConnection.getLatestBlockhash.mockRejectedValueOnce(
      new Error('QuickNode API rate limit exceeded')
    );

    try {
      await connection.getLatestBlockhash();
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('QuickNode API rate limit exceeded');
    }
  });

  // Test for QuickNode's reliability with reused connections
  it('should be able to reuse connections for multiple requests', async () => {
    await connection.getLatestBlockhash();
    await connection.getSlot();
    await connection.getBalance(new PublicKey('mockWalletAddress'));

    expect(mockConnection.getLatestBlockhash).toHaveBeenCalledTimes(1);
    expect(mockConnection.getSlot).toHaveBeenCalledTimes(1);
    expect(mockConnection.getBalance).toHaveBeenCalledTimes(1);

    // Connection should only be created once
    expect(ConnectionMock).toHaveBeenCalledTimes(1);
  });
});
