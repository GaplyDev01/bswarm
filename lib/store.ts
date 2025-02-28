// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI State
  collapsed: {
    left: boolean;
    right: boolean;
  };
  toggleCollapse: (side: 'left' | 'right') => void;

  // Token State
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;

  // Wallet State
  connected: boolean;
  walletAddress: string | null;
  balance: number;
  setWalletState: (connected: boolean, address: string | null, balance: number) => void;

  // Trading State
  activeTrades: Trade[];
  addTrade: (trade: Trade) => void;
  removeTrade: (id: string) => void;

  // Settings
  theme: 'dark' | 'darker' | 'cyberpunk';
  setTheme: (theme: 'dark' | 'darker' | 'cyberpunk') => void;
  rpcEndpoint: string;
  setRpcEndpoint: (endpoint: string) => void;
}

export interface Trade {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'open' | 'closed' | 'canceled';
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      // UI State
      collapsed: {
        left: false,
        right: false,
      },
      toggleCollapse: side =>
        set(state => ({
          collapsed: {
            ...state.collapsed,
            [side]: !state.collapsed[side],
          },
        })),

      // Token State
      selectedToken: null,
      setSelectedToken: token => set({ selectedToken: token }),

      // Wallet State
      connected: false,
      walletAddress: null,
      balance: 0,
      setWalletState: (connected, address, balance) =>
        set({ connected, walletAddress: address, balance }),

      // Trading State
      activeTrades: [],
      addTrade: trade =>
        set(state => ({
          activeTrades: [...state.activeTrades, trade],
        })),
      removeTrade: id =>
        set(state => ({
          activeTrades: state.activeTrades.filter(t => t.id !== id),
        })),

      // Settings
      theme: 'dark',
      setTheme: theme => set({ theme }),
      rpcEndpoint: 'https://api.mainnet-beta.solana.com',
      setRpcEndpoint: endpoint => set({ rpcEndpoint: endpoint }),
    }),
    {
      name: 'tradesxbt-storage',
    }
  )
);
