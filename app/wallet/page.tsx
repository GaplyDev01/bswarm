// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Wallet as WalletIcon,
  Copy,
  ExternalLink,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  ArrowLeftRight,
  Send,
  BarChart4,
  Check,
  History,
  Filter,
} from 'lucide-react';

import {
  CryptoCard,
  CryptoCardHeader,
  CryptoCardContent,
  CryptoCardFooter,
} from '@/components/ui/crypto-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BackNavigation from '@/components/BackNavigation';

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getPriceChangeColor,
  shortenAddress,
  formatTimestamp,
} from '@/lib/utils';
import SolanaService, { WalletBalance } from '@/lib/solana';
import { useAppStore } from '@/lib/store';
import { logger } from '@/lib/logger';

// Import LiveWalletBalance with client-side only rendering
const LiveWalletBalance = dynamic(
  () => import('@/components/wallet/WalletComponents').then((mod) => mod.LiveWalletBalance),
  { ssr: false }
);

// Import WalletDashboard with client-side only rendering
const WalletDashboard = dynamic(
  () => import('@/components/wallet/WalletDashboard').then((mod) => mod.WalletDashboard), 
  { ssr: false }
);

export default function WalletPage() {
  const { connected, walletAddress, balance, setWalletState } = useAppStore();

  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Connect wallet
  const handleConnectWallet = async () => {
    setLoading(true);

    try {
      const { success, address } = await SolanaService.connectWallet();
      if (success && address) {
        setWalletState(true, address, 12.45);
      }
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = async () => {
    try {
      await SolanaService.disconnectWallet();
    } catch (error) {
      logger.error('Failed to disconnect wallet:', error);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch wallet data
  useEffect(() => {
    if (!connected || !walletAddress) return;

    async function fetchWalletData() {
      setLoading(true);

      try {
        // Fetch balances
        const walletBalances = await SolanaService.getWalletBalances();
        setBalances(walletBalances);

        // Calculate total value
        const total = walletBalances.reduce((sum, token) => sum + token.valueUsd, 0);
        setTotalValue(total);

        // Fetch transactions
        setTxLoading(true);
        const txHistory = await SolanaService.getTransactionHistory();
        setTransactions(txHistory);
      } catch (error) {
        logger.error('Failed to fetch wallet data:', error);
      } finally {
        setLoading(false);
        setTxLoading(false);
      }
    }

    fetchWalletData();
  }, [connected, walletAddress]);

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <div className="md:col-span-3">
            <CryptoCard
              variant={connected ? 'neon' : 'default'}
              hover={connected ? 'glow' : 'none'}
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00FF80]/20 to-purple-500/20 rounded-xl border border-[#00FF80]/30 flex items-center justify-center mr-4">
                    <WalletIcon size={24} className="text-[#00FF80]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium">
                      {connected ? 'Wallet Connected' : 'Connect Wallet'}
                    </h2>
                    {connected && walletAddress && (
                      <div className="flex items-center mt-1">
                        <span className="text-gray-400">{shortenAddress(walletAddress, 8)}</span>
                        <button
                          className="ml-2 text-gray-400 hover:text-white transition-colors"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <a
                          href={`https://solscan.io/account/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {connected ? (
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-medium">{formatCurrency(totalValue)}</div>
                    <div className="mt-1">
                      <LiveWalletBalance />
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                        Disconnect
                      </Button>
                      <Button variant="default" size="sm">
                        <Send size={14} className="mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#00FF80]/80 to-[#00FF80]/60 text-black font-medium hover:opacity-90"
                  >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )}
              </div>
            </CryptoCard>
          </div>

          {connected ? (
            <>
              {/* Assets Section */}
              <div className="md:col-span-2">
                <CryptoCard>
                  <CryptoCardHeader>
                    <h3 className="text-lg font-medium">Assets</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter size={14} className="mr-1" />
                        Filter
                      </Button>
                      <Button variant="default" size="sm">
                        <Plus size={14} className="mr-1" />
                        Deposit
                      </Button>
                    </div>
                  </CryptoCardHeader>

                  <CryptoCardContent>
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400">Loading assets...</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-5 px-5">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left p-3 text-sm text-gray-400 font-medium">
                                Token
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Balance
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Value
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {balances.map(token => (
                              <tr
                                key={token.symbol}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              >
                                <td className="p-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-xs font-semibold">
                                        {token.symbol[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{token.symbol}</div>
                                      <div className="text-xs text-gray-400">{token.token}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  {token.amount < 0.01
                                    ? formatNumber(token.amount, 8)
                                    : formatNumber(token.amount)}
                                </td>
                                <td className="p-3 text-right">{formatCurrency(token.valueUsd)}</td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Send size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <ArrowLeftRight size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <BarChart4 size={14} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CryptoCardContent>
                </CryptoCard>

                {/* Transaction History */}
                <CryptoCard className="mt-6">
                  <CryptoCardHeader>
                    <h3 className="text-lg font-medium">Transaction History</h3>
                    <Button variant="outline" size="sm">
                      <History size={14} className="mr-1" />
                      View All
                    </Button>
                  </CryptoCardHeader>

                  <CryptoCardContent>
                    {txLoading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-400">Loading transactions...</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-5 px-5">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left p-3 text-sm text-gray-400 font-medium">
                                Type
                              </th>
                              <th className="text-left p-3 text-sm text-gray-400 font-medium">
                                Details
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Amount
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Time
                              </th>
                              <th className="text-right p-3 text-sm text-gray-400 font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map(tx => (
                              <tr
// @ts-ignore
                                key={tx.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              >
                                <td className="p-3">
                                  <Badge
                                    variant="outline"
                                    className={
// @ts-ignore
                                      tx.type === 'swap'
                                        ? 'bg-purple-900/20 text-purple-400 border-purple-500/20'
                                        : 'bg-blue-900/20 text-blue-400 border-blue-500/20'
                                    }
                                  >
// @ts-ignore
                                    {tx.type === 'swap' ? (
                                      <ArrowLeftRight size={12} className="mr-1" />
                                    ) : (
                                      <Send size={12} className="mr-1" />
                                    )}
// @ts-ignore
                                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-3">
// @ts-ignore
                                  {tx.type === 'swap' ? (
                                    <div className="flex items-center">
                                      <span className="text-gray-400 text-sm">
// @ts-ignore
                                        {tx.tokenIn} → {tx.tokenOut}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <span className="text-gray-400 text-sm">
// @ts-ignore
                                        {tx.token} to {tx.to}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-right">
// @ts-ignore
                                  {tx.type === 'swap' ? (
                                    <div className="flex flex-col">
                                      <span className="text-red-400">
// @ts-ignore
                                        -{tx.amountIn} {tx.tokenIn}
                                      </span>
                                      <span className="text-green-400">
// @ts-ignore
                                        +{tx.amountOut} {tx.tokenOut}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-red-400">
// @ts-ignore
                                      -{tx.amount} {tx.token}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right text-gray-400 text-sm">
// @ts-ignore
                                  {formatTimestamp(tx.timestamp)}
                                </td>
                                <td className="p-3 text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-900/20 text-green-400 border-green-500/20"
                                  >
// @ts-ignore
                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CryptoCardContent>
                </CryptoCard>
              </div>

              {/* Right Sidebar */}
              <div>
                {/* Portfolio Distribution */}
                <CryptoCard className="mb-6" variant="glass">
                  <h3 className="text-lg font-medium mb-4">Portfolio Distribution</h3>

                  {/* Simple portfolio distribution chart */}
                  <div className="relative h-40 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-8 border-purple-500/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/30 h-[60%]"></div>
                        <div className="absolute -right-8 -top-4 -left-4 bottom-8 bg-green-500/30 transform rotate-45"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="text-lg font-medium">{formatCurrency(totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {balances.map(token => (
                      <div key={token.symbol} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                token.symbol === 'SOL'
                                  ? 'rgba(139, 92, 246, 0.8)'
                                  : token.symbol === 'JUP'
                                    ? 'rgba(59, 130, 246, 0.8)'
                                    : 'rgba(16, 185, 129, 0.8)',
                            }}
                          ></div>
                          <span>{token.symbol}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>{formatCurrency(token.valueUsd)}</span>
                          <span className="text-xs text-gray-400">
                            {((token.valueUsd / totalValue) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CryptoCard>

                {/* Quick Actions */}
                <CryptoCard variant="primary">
                  <h3 className="text-lg font-medium mb-4">Quick Actions</h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 py-2"
                    >
                      <Send size={20} className="mb-1" />
                      <span>Send</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 py-2"
                    >
                      <ArrowLeftRight size={20} className="mb-1" />
                      <span>Swap</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 py-2"
                    >
                      <ArrowDown size={20} className="mb-1" />
                      <span>Receive</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 py-2"
                    >
                      <BarChart4 size={20} className="mb-1" />
                      <span>Trade</span>
                    </Button>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Send to Recent</h4>
                    <div className="flex space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mb-1">
                          <span className="text-xs font-semibold">D</span>
                        </div>
                        <span className="text-xs text-gray-400">Dex</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mb-1">
                          <span className="text-xs font-semibold">W</span>
                        </div>
                        <span className="text-xs text-gray-400">Wallet</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center mb-1">
                          <span className="text-xs font-semibold">E</span>
                        </div>
                        <span className="text-xs text-gray-400">Exchange</span>
                      </div>
                    </div>
                  </div>
                </CryptoCard>
              </div>
            </>
          ) : (
            // Not connected state
            <div className="md:col-span-3">
              <CryptoCard variant="glass" className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <WalletIcon size={32} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-medium mb-2">Connect Your Wallet</h2>
                  <p className="text-gray-400 mb-6">
                    Connect your Solana wallet to start trading, viewing your portfolio, and
                    managing your assets.
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#00FF80]/80 to-[#00FF80]/60 text-black font-medium hover:opacity-90"
                  >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </div>
              </CryptoCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
