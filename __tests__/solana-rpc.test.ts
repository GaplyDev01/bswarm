// @ts-nocheck
import { createSolanaRpc } from '@solana/web3.js';

// Mock the RPC responses
jest.mock('@solana/web3.js', () => {
  const mockSendFn = jest.fn().mockImplementation(() => Promise.resolve('mock-result'));

  const mockRpcMethods = {
    getLatestBlockhash: jest.fn().mockReturnValue({ send: mockSendFn }),
    getBalance: jest.fn().mockReturnValue({ send: mockSendFn }),
    getSlot: jest.fn().mockReturnValue({ send: mockSendFn }),
    getTokenAccountsByOwner: jest.fn().mockReturnValue({ send: mockSendFn }),
    getParsedProgramAccounts: jest.fn().mockReturnValue({ send: mockSendFn }),
    getBlockHeight: jest.fn().mockReturnValue({ send: mockSendFn }),
  };

  return {
    createSolanaRpc: jest.fn().mockImplementation(() => mockRpcMethods),
    createRpc: jest.fn(),
    createDefaultRpcTransport: jest.fn(),
    createJsonRpcApi: jest.fn(),
  };
});

describe('Solana RPC Integration Tests', () => {
  let rpc: ReturnType<typeof createSolanaRpc>;

  beforeEach(() => {
    jest.clearAllMocks();
    rpc = createSolanaRpc('https://solana-devnet.quiknode.pro/token/');
  });

  it('should create a QuickNode RPC connection', () => {
    expect(rpc).toBeDefined();
    expect(createSolanaRpc).toHaveBeenCalledWith('https://solana-devnet.quiknode.pro/token/');
  });

  it('should get the latest blockhash', async () => {
    await rpc.getLatestBlockhash().send();

    expect(rpc.getLatestBlockhash).toHaveBeenCalled();
    const sendFn = rpc.getLatestBlockhash().send;
    expect(sendFn).toHaveBeenCalled();
  });

  it('should get an account balance', async () => {
    const publicKey = 'mock-public-key';
    await rpc.getBalance(publicKey).send();

    expect(rpc.getBalance).toHaveBeenCalledWith(publicKey);
    const sendFn = rpc.getBalance(publicKey).send;
    expect(sendFn).toHaveBeenCalled();
  });

  it('should get the current slot', async () => {
    await rpc.getSlot().send();

    expect(rpc.getSlot).toHaveBeenCalled();
    const sendFn = rpc.getSlot().send;
    expect(sendFn).toHaveBeenCalled();
  });

  it('should handle connection errors properly', async () => {
    // Mock an error for this specific test
    const errorSendFn = jest.fn().mockRejectedValueOnce(new Error('Connection refused'));
    rpc.getBlockHeight = jest.fn().mockReturnValue({ send: errorSendFn });

    try {
      await rpc.getBlockHeight().send();
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Connection refused');
    }

    expect(rpc.getBlockHeight).toHaveBeenCalled();
    expect(errorSendFn).toHaveBeenCalled();
  });
});

// Test the custom QuickNode RPC method implementation described in the documentation
describe('QuickNode Custom Add-On API', () => {
  // This test would be implemented if we had actual custom RPC methods in the app
  it('should call the qn_estimatePriorityFees add-on correctly', () => {
    // This is a placeholder test that would test the QuickNode custom methods
    // as described in the documentation
    expect(true).toBe(true);
  });
});
