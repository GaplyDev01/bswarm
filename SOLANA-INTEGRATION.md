# Solana Integration Implementation Guide

This document provides guidance on implementing and optimizing Solana blockchain integration within the BlockSwarms application.

## 1. Infrastructure Setup

### QuickNode Integration

#### Setup Process
1. **Create QuickNode Account and Endpoint**
   - Sign up at [QuickNode](https://www.quicknode.com/)
   - Create a dedicated Solana endpoint (mainnet/devnet/testnet based on environment)
   - Store HTTP and WSS endpoint URLs securely

2. **Environment Configuration**
   ```
   # Development (.env.local)
   NEXT_PUBLIC_SOLANA_RPC_URL="https://your-endpoint.solana-devnet.quiknode.pro/your-token/"
   NEXT_PUBLIC_SOLANA_WSS_URL="wss://your-endpoint.solana-devnet.quiknode.pro/your-token/"
   
   # Production environment variables should be configured in your deployment platform
   ```

3. **Connection Management**
   - Implement a connection provider to avoid redundant connections
   - Set up proper error handling and reconnection logic
   - Configure appropriate commitment levels based on use case

## 2. Core Dependencies

- **Web3.js 2.0**: `@solana/web3.js@2`
- **Wallet Adapter**: 
  - `@solana/wallet-adapter-react`
  - `@solana/wallet-adapter-react-ui`
  - `@solana/wallet-adapter-wallets`
- **State Management**: `jotai` or `zustand` for lightweight state management
- **Data Fetching**: `@tanstack/react-query` for caching and request management

## 3. Wallet Integration

1. **Provider Setup**
   ```typescript
   // app/providers.tsx
   'use client';
   
   import { ConnectionProvider } from '@solana/wallet-adapter-react';
   import { WalletProvider } from '@solana/wallet-adapter-react';
   import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
   import { 
     PhantomWalletAdapter, 
     SolflareWalletAdapter,
     BackpackWalletAdapter 
   } from '@solana/wallet-adapter-wallets';
   import { useMemo } from 'react';
   
   export function SolanaProviders({ children }: { children: React.ReactNode }) {
     const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
     
     const wallets = useMemo(
       () => [
         new PhantomWalletAdapter(),
         new SolflareWalletAdapter(),
         new BackpackWalletAdapter(),
       ],
       []
     );
   
     return (
       <ConnectionProvider endpoint={endpoint}>
         <WalletProvider wallets={wallets} autoConnect>
           <WalletModalProvider>{children}</WalletModalProvider>
         </WalletProvider>
       </ConnectionProvider>
     );
   }
   ```

2. **Wallet Connect Button**
   ```typescript
   import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
   import '@solana/wallet-adapter-react-ui/styles.css';
   
   export function Header() {
     return (
       <header>
         <nav>
           {/* Other navigation items */}
           <WalletMultiButton />
         </nav>
       </header>
     );
   }
   ```

3. **Using Wallet in Components**
   ```typescript
   import { useWallet, useConnection } from '@solana/wallet-adapter-react';
   
   export function AccountInfo() {
     const { publicKey, connected } = useWallet();
     const { connection } = useConnection();
     const [balance, setBalance] = useState<number | null>(null);
     
     useEffect(() => {
       if (!connected || !publicKey) return;
       
       async function getBalance() {
         try {
           const balance = await connection.getBalance(publicKey);
           setBalance(balance / 1_000_000_000); // Convert lamports to SOL
         } catch (error) {
           console.error('Failed to fetch balance:', error);
         }
       }
       
       getBalance();
     }, [connected, publicKey, connection]);
     
     if (!connected) return <p>Connect your wallet to view account info.</p>;
     
     return (
       <div>
         <h2>Account Information</h2>
         <p>Address: {publicKey.toString()}</p>
         <p>Balance: {balance !== null ? `${balance} SOL` : 'Loading...'}</p>
       </div>
     );
   }
   ```

## 4. Transaction Management

### Creating and Sending Transactions

```typescript
import { 
  createSolanaRpc, 
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
  VersionedTransaction 
} from "@solana/web3.js";
import { createTransferInstruction } from "@solana-program/system";
import { useWallet } from '@solana/wallet-adapter-react';

export function SendSolForm() {
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  
  async function handleSend(e) {
    e.preventDefault();
    if (!publicKey) return;
    
    setSending(true);
    try {
      const rpc = createSolanaRpc(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
      const rpcSubscriptions = createSolanaRpcSubscriptions(process.env.NEXT_PUBLIC_SOLANA_WSS_URL);
      
      // Create instruction
      const transferInstruction = createTransferInstruction({
        source: publicKey,
        destination: new PublicKey(recipient),
        lamports: Number(amount) * 1_000_000_000, // Convert SOL to lamports
      });
      
      // Get blockhash
      const { value: latestBlockhash } = await rpc.getLatestBlockhash();
      
      // Create transaction
      const message = {
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [transferInstruction],
      };
      
      const transaction = new VersionedTransaction(message);
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      
      // Handle result
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }
      
      // Success!
      alert(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setSending(false);
    }
  }
  
  return (
    <form onSubmit={handleSend}>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.000000001"
        min="0"
        placeholder="Amount in SOL"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit" disabled={sending || !publicKey}>
        {sending ? 'Sending...' : 'Send SOL'}
      </button>
    </form>
  );
}
```

## 5. Data Fetching Patterns

### React Query Integration

```typescript
// hooks/useSolanaData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSolanaRpc, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

// Create a singleton RPC instance for reuse
const rpc = createSolanaRpc(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

// Hook to fetch account balance
export function useTokenBalance(address?: string) {
  const { publicKey } = useWallet();
  const targetAddress = address ? new PublicKey(address) : publicKey;
  
  return useQuery({
    queryKey: ['tokenBalance', targetAddress?.toString()],
    queryFn: async () => {
      if (!targetAddress) return null;
      const balance = await rpc.getBalance(targetAddress).send();
      return balance / 1_000_000_000; // Convert lamports to SOL
    },
    enabled: !!targetAddress,
    staleTime: 10000, // 10 seconds
  });
}

// Hook to fetch token accounts
export function useTokenAccounts(ownerAddress?: string) {
  const { publicKey } = useWallet();
  const owner = ownerAddress ? new PublicKey(ownerAddress) : publicKey;
  
  return useQuery({
    queryKey: ['tokenAccounts', owner?.toString()],
    queryFn: async () => {
      if (!owner) return [];
      const accounts = await rpc.getTokenAccountsByOwner(owner, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      }).send();
      return accounts.value;
    },
    enabled: !!owner,
    staleTime: 30000, // 30 seconds
  });
}
```

### WebSocket Subscriptions

```typescript
// hooks/useSolanaSubscription.ts
import { useState, useEffect } from 'react';
import { createSolanaRpcSubscriptions, PublicKey } from '@solana/web3.js';

export function useAccountChangeSubscription(address?: string) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!address) return;
    
    const subscriptions = createSolanaRpcSubscriptions(process.env.NEXT_PUBLIC_SOLANA_WSS_URL);
    let unsubscribe;
    
    async function subscribe() {
      try {
        const pubkey = new PublicKey(address);
        unsubscribe = await subscriptions.accountSubscribe(
          pubkey,
          (accountInfo) => {
            setAccountInfo(accountInfo);
          },
          { commitment: 'confirmed' }
        );
      } catch (err) {
        setError(err);
      }
    }
    
    subscribe();
    
    return () => {
      if (unsubscribe) {
        subscriptions.removeAccountSubscription(unsubscribe);
      }
    };
  }, [address]);
  
  return { accountInfo, error };
}
```

## 6. QuickNode Add-ons Integration

### Priority Fees API

```typescript
// utils/quicknode.ts
import {
  Rpc,
  RpcRequest,
  createDefaultRpcTransport,
  createJsonRpcApi,
  createRpc,
  RpcTransport
} from "@solana/web3.js";

// Define types for Priority Fees API
interface PriorityFeeResponse {
  context: { slot: number };
  per_compute_unit: {
    extreme: number;
    high: number;
    medium: number;
    low: number;
    percentiles: Record<string, number>;
  };
  per_transaction: {
    extreme: number;
    high: number;
    medium: number;
    low: number;
    percentiles: Record<string, number>;
  };
  recommended: number;
}

// Define API interface
type QuickNodeApi = {
  qn_estimatePriorityFees(params: {
    last_n_blocks?: number;
    account?: string;
    api_version?: number;
  }): PriorityFeeResponse;
}

// Create transport
function createQuickNodeTransport(endpoint: string): RpcTransport {
  const transport = createDefaultRpcTransport({ url: endpoint });
  return async <T>(...args: Parameters<RpcTransport>): Promise<T> => {
    return await transport(...args);
  };
}

// Create RPC client
export function createQuickNodeRpc(endpoint: string): Rpc<QuickNodeApi> {
  const api = createJsonRpcApi<QuickNodeApi>({
    requestTransformer: (request: RpcRequest<any>) => request.params[0],
    responseTransformer: (response: any) => response.result,
  });
  const transport = createQuickNodeTransport(endpoint);
  return createRpc({ api, transport });
}

// React Hook for priority fees
export function usePriorityFees() {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  async function fetchFees(options = { last_n_blocks: 100 }) {
    setLoading(true);
    setError(null);
    try {
      const quickNodeRpc = createQuickNodeRpc(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
      const fees = await quickNodeRpc.qn_estimatePriorityFees({
        ...options,
        api_version: 2
      }).send();
      setFees(fees);
      return fees;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  
  return { fees, loading, error, fetchFees };
}
```

## 7. Security Best Practices

1. **Token Management**
   - Store QuickNode endpoint URLs in environment variables
   - Use JWT authentication for additional security
   - Create multiple auth tokens for different environments

2. **Error Handling**
   - Implement proper error boundaries around Solana components
   - Add retry logic for transient RPC errors
   - Provide user-friendly error messages

3. **Rate Limiting**
   - Implement client-side throttling for RPC calls
   - Cache frequently accessed data
   - Use WebSockets for real-time updates instead of polling

4. **Transaction Security**
   - Always verify transaction details before signing
   - Implement double-confirmation for high-value transactions
   - Add transaction simulation before sending

## 8. Performance Optimization

1. **Connection Management**
   - Create singleton RPC instances
   - Reuse connections across components
   - Configure proper commitment levels based on use case

2. **Batch Operations**
   - Use `getMultipleAccounts` instead of multiple `getAccountInfo` calls
   - Batch transaction instructions when possible
   - Implement pagination for large data sets

3. **Caching Strategy**
   - Use React Query's caching capabilities
   - Implement proper invalidation strategies
   - Set appropriate stale times based on data type

4. **Real-time Updates**
   - Use WebSockets for active data
   - Implement proper connection management
   - Handle WebSocket reconnections gracefully

## 9. Testing Strategy

1. **Unit Testing**
   - Mock Solana RPC responses
   - Test wallet integration components
   - Verify transaction creation logic

2. **Integration Testing**
   - Test against Solana devnet
   - Verify wallet connection flow
   - Test transaction submission and confirmation

3. **End-to-End Testing**
   - Create E2E tests for critical user flows
   - Test wallet interaction in browser environment
   - Verify transaction success scenarios

## 10. Troubleshooting Guide

### Common Issues

1. **Connection Errors**
   - Verify QuickNode endpoint URL and token
   - Check network connectivity
   - Ensure proper CORS configuration for browser usage

2. **Transaction Failures**
   - Insufficient balance
   - Invalid blockhash (too old)
   - Incorrect transaction structure
   - Simulation errors

3. **Wallet Connection Issues**
   - Wallet extension not installed
   - Network mismatch (mainnet vs devnet)
   - Permission denied by user

### Debugging Tools

1. **Solana Explorer**
   - Verify transaction status
   - Inspect account data
   - Check program logs

2. **QuickNode Dashboard**
   - Monitor API usage
   - Check endpoint health
   - View request logs

3. **Browser Dev Tools**
   - Inspect WebSocket connections
   - Debug RPC request/response cycles
   - Monitor for JavaScript errors

## Resources

- [QuickNode Solana Documentation](https://www.quicknode.com/docs/solana)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Documentation](https://github.com/solana-labs/wallet-adapter)
- [Solana Cookbook](https://solanacookbook.com/)
