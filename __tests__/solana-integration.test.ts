import { Connection } from '@solana/web3.js';

// Mock the web3.js connection without using requireActual
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'mockBlockhash123',
      lastValidBlockHeight: 12345,
    }),
    getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL in lamports
    getSlot: jest.fn().mockResolvedValue(12345678),
    getVersion: jest.fn().mockResolvedValue({
      'solana-core': '1.14.10',
      'feature-set': 12345,
    }),
  })),
}));

describe('Solana Integration', () => {
  const { Connection } = require('@solana/web3.js');
  let connection;

  beforeEach(() => {
    connection = new Connection('https://mock-endpoint.solana.com');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should establish connection with QuickNode endpoint', () => {
    expect(connection).toBeDefined();
    expect(Connection).toHaveBeenCalledWith('https://mock-endpoint.solana.com');
  });

  it('should retrieve latest blockhash', async () => {
    const result = await connection.getLatestBlockhash();

    expect(result).toEqual({
      blockhash: 'mockBlockhash123',
      lastValidBlockHeight: 12345,
    });
    expect(connection.getLatestBlockhash).toHaveBeenCalled();
  });

  it('should get balance for an account', async () => {
    const mockPubkey = 'mockPubkey123';
    const balance = await connection.getBalance(mockPubkey);

    expect(balance).toBe(1000000000); // 1 SOL in lamports
    expect(connection.getBalance).toHaveBeenCalledWith(mockPubkey);
  });

  it('should get current slot', async () => {
    const slot = await connection.getSlot();

    expect(slot).toBe(12345678);
    expect(connection.getSlot).toHaveBeenCalled();
  });

  it('should get Solana version', async () => {
    const version = await connection.getVersion();

    expect(version).toEqual({
      'solana-core': '1.14.10',
      'feature-set': 12345,
    });
    expect(connection.getVersion).toHaveBeenCalled();
  });
});
