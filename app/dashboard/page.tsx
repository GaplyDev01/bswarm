'use client';

import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Bot, LineChart, Wallet, UserSquare, LayoutDashboard } from 'lucide-react';
import { DashboardCardGrid } from '@/components/dashboard/DashboardCardGrid';
import { DashboardSettingsModal } from '@/components/dashboard/DashboardSettingsModal';
import { TradingCharts } from '@/components/dashboard/TradingCharts';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { UserProfile } from '@/components/dashboard/UserProfile';

// Import components that will be used in the dashboard cards
import { TokenSearch } from '@/components/TokenSearch';
import { EnhancedTokenChat } from '@/components/EnhancedTokenChat';
import { TokenInfo } from '@/components/TokenInfo';
import { logger } from '@/lib/logger';

// Define the DashboardConfig interface for type safety
interface DashboardConfig {
  layout: string;
  visibleCards: string[];
  cardOrder: string[];
}

// Default configuration
const DEFAULT_CONFIG: DashboardConfig = {
  layout: 'default',
  visibleCards: [
    'agentProfile',
    'tradingSignals',
    'tokenSearch',
    'tokenInfo',
    'fundStats',
    'socialStats',
    'investmentTotals',
    'aiTokenChat',
  ],
  cardOrder: [
    'agentProfile',
    'investmentTotals',
    'tradingSignals',
    'tokenSearch',
    'tokenInfo',
    'socialStats',
    'fundStats',
    'aiTokenChat',
  ],
};

// Dashboard state type definitions
interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  // TODO: Replace 'any' with a more specific type
  [key: string]: unknown;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [detailedTokenData, setDetailedTokenData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<'dashboard' | 'charts'> | 'portfolio' | ('profile' > 'dashboard');

  // Load user's dashboard config from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const savedConfig = localStorage.getItem('dashboardConfig');
        if (savedConfig) {
          setDashboardConfig(JSON.parse(savedConfig));
        }
      } catch (error) {
        logger.error('Error loading dashboard config:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem('dashboardConfig', JSON.stringify(dashboardConfig));
    }
  }, [dashboardConfig, isLoading]);

  // Handle updating the dashboard configuration
  const handleUpdateConfig = (newConfig: Partial<DashboardConfig>) => {
    setDashboardConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  };

  // Toggle customization mode
  const toggleCustomizationMode = () => {
    setCustomizationMode(!customizationMode);
  };

  // Handle token selection from TokenSearch component
  const handleSelectToken = (token: Event) => {
    setSelectedToken(token);
  };

  // Fetch token data when selected
  useEffect(() => {
    async function fetchTokenData() {
      if (!selectedToken) {
        logger.log('No token selected, clearing detailedTokenData');
        setDetailedTokenData(null);
        return;
      }

      logger.log('Fetching detailed token data for:', selectedToken?.name || selectedToken?.id);
      setLoading(true);
      try {
        const response = await fetch(`/api/token/info?id=${selectedToken.id}`);
        logger.log('Token info API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          logger.log('Token info API data received:', data);
          setDetailedTokenData(data);
        } else {
          logger.warn('Token info API returned error, falling back to basic data');
          // Fallback to basic token data if detailed data is not available
          setDetailedTokenData(selectedToken);
        }
      } catch (error) {
        logger.error('Error fetching token data:', error);
        // Fallback to basic token data on error
        setDetailedTokenData(selectedToken);
      } finally {
        setLoading(false);
      }
    }

    fetchTokenData();
  }, [selectedToken]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-emerald-400/30 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-64 bg-emerald-400/30 rounded col-span-1"></div>
                <div className="h-64 bg-emerald-400/30 rounded col-span-1"></div>
                <div className="h-64 bg-emerald-400/30 rounded col-span-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {/* Only shown to signed in users */}
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Dashboard Header */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-cyber tracking-wider text-emerald-400">
                  TRADESXBT DASHBOARD
                </h1>
                <p className="text-muted-foreground">
                  Welcome to your personalized trading dashboard
                </p>
              </div>

              {/* Dashboard Customization Button */}
              <button
                className="flex items-center gap-2 px-4 py-2 bg-sapphire-800 hover:bg-sapphire-700 text-emerald-400 rounded-md"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <LayoutDashboard size={16} />
                {customizationMode ? 'Save Layout' : 'Customize'}
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-border mb-6">
              <button
                className={`px-4 py-2 ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Bot className="h-4 w-4 inline-block mr-2" />
                Dashboard
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'charts' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('charts')}
              >
                <LineChart className="h-4 w-4 inline-block mr-2" />
                Charts
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'portfolio' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('portfolio')}
              >
                <Wallet className="h-4 w-4 inline-block mr-2" />
                Portfolio
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('profile')}
              >
                <UserSquare className="h-4 w-4 inline-block mr-2" />
                Profile
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <DashboardCardGrid
                config={dashboardConfig}
                onUpdateConfig={handleUpdateConfig}
                selectedToken={selectedToken}
                onSelectToken={handleSelectToken}
                customizationMode={customizationMode}
                onToggleCustomizationMode={toggleCustomizationMode}
                detailedTokenData={detailedTokenData}
              />
            )}

            {activeTab === 'charts' && <TradingCharts />}

            {activeTab === 'portfolio' && <PortfolioSummary />}

            {activeTab === 'profile' && <UserProfile />}

            {/* Settings Modal */}
            <DashboardSettingsModal
              isOpen={isSettingsModalOpen}
              onClose={() => setIsSettingsModalOpen(false)}
              config={dashboardConfig}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        {/* Redirect to sign in if user is not signed in */}
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
