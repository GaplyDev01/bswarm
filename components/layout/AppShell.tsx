'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  LineChart,
  BarChart4,
  Wallet,
  MessagesSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Sparkles,
  Activity,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CryptoCard } from '@/components/ui/crypto-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get collapsed state from store
  const {
    collapsed: { left: leftCollapsed, right: rightCollapsed },
    toggleCollapse,
    selectedToken,
    setSelectedToken,
  } = useAppStore();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo data
  const trendingTokens = [
    { id: 'solana', name: 'Solana', symbol: 'SOL', price: 142.78, change_24h: 8.45 },
    { id: 'jupiter', name: 'Jupiter', symbol: 'JUP', price: 1.24, change_24h: 3.21 },
    { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.00001547, change_24h: 12.3 },
    { id: 'jito', name: 'Jito', symbol: 'JTO', price: 2.87, change_24h: -2.4 },
  ];

  // Set mounted to true when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents hydration errors
  }

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      icon: <LineChart size={20} />,
      label: 'Markets',
      href: '/markets',
      active: pathname === '/markets',
    },
    {
      icon: <BarChart4 size={20} />,
      label: 'Trading',
      href: '/trading',
      active: pathname === '/trading',
    },
    {
      icon: <Wallet size={20} />,
      label: 'Wallet',
      href: '/wallet',
      active: pathname === '/wallet',
    },
    {
      icon: <MessagesSquare size={20} />,
      label: 'AI Chat',
      href: '/ai-chat',
      active: pathname === '/ai-chat',
    },
    {
      icon: <Sparkles size={20} />,
      label: 'Signals',
      href: '/signals',
      active: pathname === '/signals',
    },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.02] z-0 pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-blue-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Mobile navigation */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0" variant="gradient">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
                  <span className="font-bold text-white">T</span>
                </div>
                <h2 className="text-xl font-bold text-white">TradesXBT</h2>
              </div>
            </div>

            <div className="flex-1 py-4">
              <div className="space-y-1 px-3">
                {sidebarItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      item.active
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full justify-start text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/');
                }}
              >
                <LogOut size={16} className="mr-2" />
                <span>Log Out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Left Sidebar */}
      <div
        className={`relative h-full ${
          leftCollapsed ? 'w-[72px]' : 'w-[240px]'
        } bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 z-20 hidden md:flex`}
      >
        <div className="flex items-center p-4 h-16 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
              <span className="font-bold text-white">T</span>
            </div>
            {!leftCollapsed && <h2 className="text-xl font-bold text-white">TradesXBT</h2>}
          </div>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {sidebarItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${
                  leftCollapsed ? 'justify-center' : 'justify-start'
                } space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                  item.active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={leftCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!leftCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => toggleCollapse('left')}
            className="w-full flex items-center justify-center text-gray-400 hover:text-white p-2 rounded-md hover:bg-white/5 transition-colors"
          >
            {leftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top navigation */}
        <header className="h-16 w-full bg-black/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <h1 className="font-semibold text-lg">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/markets' && 'Markets'}
              {pathname === '/trading' && 'Trading'}
              {pathname === '/wallet' && 'Wallet'}
              {pathname === '/ai-chat' && 'AI Assistant'}
              {pathname === '/signals' && 'Trading Signals'}
              {pathname.startsWith('/token-analysis') && `${selectedToken || 'Token'} Analysis`}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="glass" size="sm" className="hidden sm:flex">
              <Activity size={16} className="mr-2" />
              Network: Mainnet
            </Button>
            <Avatar>
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600">
                WS
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Right Sidebar */}
      <div
        className={`h-full ${
          rightCollapsed
            ? 'w-0 opacity-0 md:w-[72px] md:opacity-100'
            : 'w-0 opacity-0 md:w-[320px] md:opacity-100'
        } bg-black/30 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300 overflow-hidden z-10`}
      >
        {!rightCollapsed && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-semibold">Trending</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                See All
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {trendingTokens.map(token => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setSelectedToken(token.id);
                    router.push(`/token-analysis?token=${token.id}`);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-white font-medium">
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs ${token.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {token.change_24h >= 0 ? '+' : ''}
                      {token.change_24h}%
                    </div>
                  </div>
                </div>
              ))}

              <CryptoCard variant="neon" className="mt-6">
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="h-8 w-8 mb-2 text-[#00FF80]" />
                  <h3 className="font-medium mb-2">AI Trading Signals</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Get real-time trading signals powered by our AI
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/signals')}
                  >
                    View Signals
                  </Button>
                </div>
              </CryptoCard>
            </div>
          </div>
        )}

        <div
          className={`absolute bottom-4 ${rightCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-4'} transition-all duration-300`}
        >
          <button
            onClick={() => toggleCollapse('right')}
            className="flex items-center justify-center text-gray-400 hover:text-white p-2 rounded-md hover:bg-white/5 transition-colors"
          >
            {rightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
