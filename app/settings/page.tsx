// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ModelSelector from '@/components/ModelSelector';
import BackNavigation from '@/components/BackNavigation';
import { logger } from '@/lib/logger';
import {
  Save,
  RotateCcw,
  Bot,
  Settings,
  BrainCircuit,
  UserCog,
  Shield,
  Wallet,
  Bell,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart3,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  // Model selection state
  const [currentProvider, setCurrentProvider] = useState('anthropic');
  const [currentModel, setCurrentModel] = useState('claude-3-7-sonnet-20250219');

  // AI Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [streamResponses, setStreamResponses] = useState(true);
  const [defaultMode, setDefaultMode] = useState('xbt');

  // Analysis Settings
  const [technicalAnalysisEnabled, setTechnicalAnalysisEnabled] = useState(true);
  const [sentimentAnalysisEnabled, setSentimentAnalysisEnabled] = useState(true);
  const [onChainAnalysisEnabled, setOnChainAnalysisEnabled] = useState(true);
  const [tradingSignalsEnabled, setTradingSignalsEnabled] = useState(true);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [signalAlerts, setSignalAlerts] = useState(true);

  // Privacy Settings
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [sharePortfolioData, setSharePortfolioData] = useState(false);
  const [storeHistory, setStoreHistory] = useState(true);

  // Handle reset to defaults
  const handleResetDefaults = () => {
    // Reset model settings
    setCurrentProvider('anthropic');
    setCurrentModel('claude-3-7-sonnet-20250219');
    setTemperature(0.7);
    setMaxTokens(4000);
    setStreamResponses(true);
    setDefaultMode('xbt');

    // Reset analysis settings
    setTechnicalAnalysisEnabled(true);
    setSentimentAnalysisEnabled(true);
    setOnChainAnalysisEnabled(true);
    setTradingSignalsEnabled(true);

    // Reset notification settings
    setEmailNotifications(true);
    setPushNotifications(false);
    setPriceAlerts(true);
    setSignalAlerts(true);

    // Reset privacy settings
    setAnalyticsEnabled(true);
    setSharePortfolioData(false);
    setStoreHistory(true);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real application, this would save to backend
    logger.log('Settings saved:', {
      model: {
        provider: currentProvider,
        model: currentModel,
        temperature,
        maxTokens,
        streamResponses,
        defaultMode,
      },
      analysis: {
        technicalAnalysisEnabled,
        sentimentAnalysisEnabled,
        onChainAnalysisEnabled,
        tradingSignalsEnabled,
      },
      notifications: { emailNotifications, pushNotifications, priceAlerts, signalAlerts },
      privacy: { analyticsEnabled, sharePortfolioData, storeHistory },
    });

    // Show a success message
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Navigation */}
        <BackNavigation backTo="/dashboard" label="Back to Dashboard" className="mb-4" />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-cyber tracking-wider text-emerald-400">SETTINGS</h1>
          <p className="text-muted-foreground">
            Configure your TradesXBT AI assistant and platform preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="ai">
          <TabsList className="mb-6">
            <TabsTrigger value="ai">
              <BrainCircuit className="h-4 w-4 mr-1.5" />
              AI Configuration
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-1.5" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* AI Configuration Tab */}
          <TabsContent value="ai">
            <Card className="border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center">
                  <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">AI Configuration</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure the AI models and behavior for TradesXBT
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* AI Model Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">AI Model Selection</h3>
                  <ModelSelector
                    currentProvider={currentProvider}
                    currentModel={currentModel}
                    onProviderChange={setCurrentProvider}
                    onModelChange={setCurrentModel}
                  />
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Temperature</h3>
                    <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
                  </div>
                  <div className="mb-2">
                    <Slider
                      value={[temperature]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={value => setTemperature(value[0])}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Maximum Output Length</h3>
                    <span className="text-sm text-muted-foreground">{maxTokens} tokens</span>
                  </div>
                  <div className="mb-2">
                    <Slider
                      value={[maxTokens]}
                      min={1000}
                      max={8000}
                      step={1000}
                      onValueChange={value => setMaxTokens(value[0])}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shorter</span>
                    <span>Medium</span>
                    <span>Longer</span>
                  </div>
                </div>

                {/* Stream Responses */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Stream Responses</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show responses as they are generated in real-time
                    </p>
                  </div>
                  <Switch checked={streamResponses} onCheckedChange={setStreamResponses} />
                </div>

                {/* Default Mode */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Default Analysis Mode</h3>
                  <Select value={defaultMode} onValueChange={setDefaultMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xbt">
                        <div className="flex items-center">
                          <BrainCircuit className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>XBT Mode (Deep Reasoning)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="chill">
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Chill Mode (Balanced)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sentiment">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-green-500" />
                          <span>Sentiment Mode (Market Analysis)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analysis Settings Tab */}
          <TabsContent value="analysis">
            <Card className="border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">Analysis Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure analysis features and trading signals
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Technical Analysis */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Technical Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Price charts, indicators, and pattern recognition
                    </p>
                  </div>
                  <Switch
                    checked={technicalAnalysisEnabled}
                    onCheckedChange={setTechnicalAnalysisEnabled}
                  />
                </div>

                {/* Sentiment Analysis */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Sentiment Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Social media and news sentiment tracking
                    </p>
                  </div>
                  <Switch
                    checked={sentimentAnalysisEnabled}
                    onCheckedChange={setSentimentAnalysisEnabled}
                  />
                </div>

                {/* On-Chain Analysis */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">On-Chain Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Blockchain transaction and wallet data insights
                    </p>
                  </div>
                  <Switch
                    checked={onChainAnalysisEnabled}
                    onCheckedChange={setOnChainAnalysisEnabled}
                  />
                </div>

                {/* Trading Signals */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Trading Signals</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI-generated buy/sell recommendations
                    </p>
                  </div>
                  <Switch
                    checked={tradingSignalsEnabled}
                    onCheckedChange={setTradingSignalsEnabled}
                  />
                </div>

                {/* Analysis Timeframes */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Default Analysis Timeframes</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['1H', '4H', '1D', '1W'].map(timeframe => (
                      <Button
                        key={timeframe}
                        variant={timeframe === '1D' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {timeframe}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Technical Indicators */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Default Technical Indicators</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked id="rsi" />
                      <label htmlFor="rsi" className="text-sm cursor-pointer">
                        RSI (Relative Strength Index)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked id="macd" />
                      <label htmlFor="macd" className="text-sm cursor-pointer">
                        MACD (Moving Average Convergence Divergence)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked id="ma" />
                      <label htmlFor="ma" className="text-sm cursor-pointer">
                        Moving Averages (50, 200)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="fibonacci" />
                      <label htmlFor="fibonacci" className="text-sm cursor-pointer">
                        Fibonacci Retracement
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="bollinger" />
                      <label htmlFor="bollinger" className="text-sm cursor-pointer">
                        Bollinger Bands
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">Notification Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure how and when you receive notifications
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Notification Methods */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Notification Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Email Notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Push Notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Receive notifications in your browser
                        </div>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>
                  </div>
                </div>

                {/* What to Notify About */}
                <div>
                  <h3 className="text-sm font-medium mb-3">What to Notify About</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Price Alerts</div>
                        <div className="text-xs text-muted-foreground">
                          Notify when token prices hit targets
                        </div>
                      </div>
                      <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Trading Signals</div>
                        <div className="text-xs text-muted-foreground">
                          Notify when AI generates new trading signals
                        </div>
                      </div>
                      <Switch checked={signalAlerts} onCheckedChange={setSignalAlerts} />
                    </div>
                  </div>
                </div>

                {/* Price Alert Setup */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Price Alert Setup</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs mr-3">
                          SOL
                        </div>
                        <div>
                          <div className="text-sm font-medium">Solana</div>
                          <div className="text-xs text-muted-foreground">$147.82 • +5.23%</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs" disabled>
                        Set Alert
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs mr-3">
                          JUP
                        </div>
                        <div>
                          <div className="text-sm font-medium">Jupiter</div>
                          <div className="text-xs text-muted-foreground">$1.27 • +8.75%</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs" disabled>
                        Set Alert
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button variant="outline" className="w-full text-xs" disabled>
                      Add New Alert
                    </Button>
                  </div>
                </div>

                {/* Notification Schedule */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Notification Schedule</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Quiet Hours</div>
                      <Switch />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Start Time
                        </label>
                        <Input type="time" value="22:00" disabled />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">End Time</label>
                        <Input type="time" value="07:00" disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">Privacy Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Control your data and privacy preferences
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Usage Analytics</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow anonymous analytics to help improve the platform
                    </p>
                  </div>
                  <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
                </div>

                {/* Portfolio Data */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Share Portfolio Data</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow AI to learn from your portfolio for better recommendations
                    </p>
                  </div>
                  <Switch checked={sharePortfolioData} onCheckedChange={setSharePortfolioData} />
                </div>

                {/* Chat History */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Store Chat History</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save your conversations with TradesXBT AI
                    </p>
                  </div>
                  <Switch checked={storeHistory} onCheckedChange={setStoreHistory} />
                </div>

                {/* Data Retention */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Data Retention Period</h3>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Management */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Data Management</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" disabled>
                      <Eye className="h-4 w-4 mr-2" />
                      View Stored Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600"
                      disabled
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
