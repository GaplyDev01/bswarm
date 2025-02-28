import { NextRequest } from 'next/server';
import { createMockRequest, mockEnv } from './helpers/testHelpers';

// Manual mocks for the GET and POST handlers
const mockGET = jest.fn();
const mockPOST = jest.fn();

// Mock the module path resolution
jest.mock(
  '@/app/api/solana/route',
  () => ({
    GET: mockGET,
    POST: mockPOST,
  }),
  { virtual: true }
);

// Mock the implementation of our custom v2 library
jest.mock('../lib/solana/v2', () => {
  const mockRpc = {
    getLatestBlockhash: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 12345,
      }),
    }),
    getBlockHeight: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue(54321),
    }),
    getBalance: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue(1000000000),
    }),
    getHealth: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue('ok'),
    }),
    getTokenAccountsByOwner: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({
        value: [
          {
            pubkey: 'mock-pubkey',
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'mock-mint',
                    owner: 'mock-owner',
                    tokenAmount: {
                      amount: '100',
                      decimals: 9,
                      uiAmount: 0.0000001,
                    },
                  },
                },
              },
            },
          },
        ],
      }),
    }),
    getTransaction: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({
        slot: 123456,
        meta: {
          fee: 5000,
          status: { Ok: null },
        },
      }),
    }),
  };

  return {
    createSolanaRpc: jest.fn().mockReturnValue(mockRpc),
  };
});

// Mock PublicKey from @solana/web3.js
jest.mock('@solana/web3.js', () => ({
  PublicKey: class MockPublicKey {
    constructor(value: string) {
      if (value === 'invalid-address') {
        throw new Error('Invalid public key');
      }
    }
  },
}));

// Mock environment variables
mockEnv({ NEXT_PUBLIC_SOLANA_RPC_URL: 'https://mock-rpc.solana.test' });

// Import the actual implementation to test (needs to happen after mocks)
const { GET, POST } = jest.requireActual('../app/api/solana/route');

// Setup mock implementations that call the real functions but with our mocked context
beforeEach(() => {
  mockGET.mockImplementation(GET);
  mockPOST.mockImplementation(POST);
});

describe('Solana API Route', () => {
  describe('GET handler', () => {
    it('should return latest blockhash', async () => {
      const request = createMockRequest('/api/solana', { action: 'blockhash' });
      const response = await GET(request as NextRequest);
      const data = await response.json();

      expect(data).toEqual({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 12345,
      });
    });

    it('should return block height', async () => {
      const request = createMockRequest('/api/solana', { action: 'blockheight' });
      const response = await GET(request as NextRequest);
      const data = await response.json();

      expect(data).toEqual({
        blockheight: 54321,
      });
    });

    it('should return account balance', async () => {
      const request = createMockRequest('/api/solana', {
        action: 'balance',
        address: 'mock-address',
      });
      const response = await GET(request as NextRequest);
      const data = await response.json();

      expect(data).toEqual({
        balance: 1000000000,
      });
    });

    it('should return 400 when address is missing for balance action', async () => {
      const request = createMockRequest('/api/solana', { action: 'balance' });
      const response = await GET(request as NextRequest);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Address is required for balance action');
    });

    it('should return node health status', async () => {
      const request = createMockRequest('/api/solana', { action: 'health' });
      const response = await GET(request as NextRequest);
      const data = await response.json();

      expect(data).toEqual({
        health: 'ok',
      });
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('/api/solana', { action: 'invalid' });
      const response = await GET(request as NextRequest);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid action');
    });

    it('should handle RPC errors', async () => {
      // Mock implementation for this specific test to throw an error
      jest.requireMock('../lib/solana/v2').createSolanaRpc.mockReturnValueOnce({
        getLatestBlockhash: () => ({
          send: jest.fn().mockRejectedValue(new Error('RPC connection error')),
        }),
      });

      const request = createMockRequest('/api/solana', { action: 'blockhash' });
      const response = await GET(request as NextRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('RPC error');
      expect(data.message).toBe('RPC connection error');
    });

    it('should handle missing RPC URL', async () => {
      mockEnv({ NEXT_PUBLIC_SOLANA_RPC_URL: undefined });

      const request = createMockRequest('/api/solana', { action: 'blockhash' });
      const response = await GET(request as NextRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Solana RPC URL not configured');

      // Restore the mock RPC URL for subsequent tests
      mockEnv({ NEXT_PUBLIC_SOLANA_RPC_URL: 'https://mock-rpc.solana.test' });
    });
  });

  describe('POST handler', () => {
    it('should fetch token accounts by owner', async () => {
      const request = createMockRequest('/api/solana', null, {
        method: 'POST',
        body: JSON.stringify({
          action: 'tokenAccounts',
          owner: 'mock-owner-address',
        }),
      });
      const response = await POST(request as NextRequest);
      const data = await response.json();

      expect(data).toHaveProperty('accounts');
      expect(data.accounts).toHaveProperty('value');
    });

    it('should require owner parameter for tokenAccounts action', async () => {
      const request = createMockRequest('/api/solana', null, {
        method: 'POST',
        body: JSON.stringify({
          action: 'tokenAccounts',
        }),
      });
      const response = await POST(request as NextRequest);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Owner address is required');
    });

    it('should fetch transaction details', async () => {
      const request = createMockRequest('/api/solana', null, {
        method: 'POST',
        body: JSON.stringify({
          action: 'transaction',
          signature: 'mock-transaction-signature',
        }),
      });
      const response = await POST(request as NextRequest);
      const data = await response.json();

      expect(data).toHaveProperty('transaction');
      expect(data.transaction).toHaveProperty('slot');
      expect(data.transaction).toHaveProperty('meta');
    });

    it('should require signature parameter for transaction action', async () => {
      const request = createMockRequest('/api/solana', null, {
        method: 'POST',
        body: JSON.stringify({
          action: 'transaction',
        }),
      });
      const response = await POST(request as NextRequest);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Transaction signature is required');
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('/api/solana', null, {
        method: 'POST',
        body: JSON.stringify({
          action: 'invalid',
        }),
      });
      const response = await POST(request as NextRequest);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid action');
    });
  });
});
