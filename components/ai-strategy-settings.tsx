'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Settings,
  AlertTriangle,
  BarChart4,
  Rocket,
  Shield,
  TrendingUp,
  Clock,
  PercentCircle,
  DollarSign,
  Save,
  RefreshCw,
  Check,
  X,
  Info,
  Lock,
} from 'lucide-react';

import { CryptoCard } from '@/components/ui/crypto-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive' | 'custom';
export type TradingTimeframe = 'short' | 'medium' | 'long';
export type AILevel = 'assisted' | 'semi-autonomous' | 'fully-autonomous';

interface AIStrategySettingsProps {
  className?: string;
  onSave?: (settings: Event[]) => void;
}

export default function AIStrategySettings({ className, onSave }: AIStrategySettingsProps) {
  // Strategy state
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('balanced');
  const [aiLevel, setAILevel] = useState<AILevel>('assisted');
  const [timeframe, setTimeframe] = useState<TradingTimeframe>('medium');
  const [maxAllocation, setMaxAllocation] = useState(20);
  const [stopLossDefault, setStopLossDefault] = useState(15);
  const [takeProfitDefault, setTakeProfitDefault] = useState(30);
  const [maxSimultaneousTrades, setMaxSimultaneousTrades] = useState(5);
  const [dollarCostAveraging, setDollarCostAveraging] = useState(false);
  const [rebalancingEnabled, setRebalancingEnabled] = useState(false);
  const [AIFeedback, setAIFeedback] = useState(true);

  // Token focus settings
  const [focusTokens, setFocusTokens] = useState([
    { token: 'SOL', allocation: 40, enabled: true },
    { token: 'JUP', allocation: 20, enabled: true },
    { token: 'BONK', allocation: 10, enabled: true },
    { token: 'JTO', allocation: 10, enabled: true },
    { token: 'WIF', allocation: 10, enabled: true },
    { token: 'PYTH', allocation: 10, enabled: true },
  ]);

  // Advanced settings
  const [maxDailyLoss, setMaxDailyLoss] = useState(5);
  const [marketConditionOverride, setMarketConditionOverride] = useState(false);
  const [trailingStopLoss, setTrailingStopLoss] = useState(false);
  const [volatilityAdjustment, setVolatilityAdjustment] = useState(true);
  const [AINotifications, setAINotifications] = useState(true);

  // Risk profile helpers
  const setProfilePresets = (profile: RiskProfile) => {
    setRiskProfile(profile);

    switch (profile) {
      case 'conservative':
        setMaxAllocation(10);
        setStopLossDefault(10);
        setTakeProfitDefault(20);
        setMaxSimultaneousTrades(3);
        setTimeframe('long');
        setAILevel('assisted');
        break;
      case 'balanced':
        setMaxAllocation(20);
        setStopLossDefault(15);
        setTakeProfitDefault(30);
        setMaxSimultaneousTrades(5);
        setTimeframe('medium');
        setAILevel('semi-autonomous');
        break;
      case 'aggressive':
        setMaxAllocation(40);
        setStopLossDefault(20);
        setTakeProfitDefault(50);
        setMaxSimultaneousTrades(10);
        setTimeframe('short');
        setAILevel('fully-autonomous');
        break;
      case 'custom':
        // Keep current settings
        break;
    }
  };

  // Handle token allocation change
  const handleTokenAllocationChange = (token: string, allocation: number) => {
    const updatedTokens = focusTokens.map(t => (t.token === token ? { ...t, allocation } : t));
    setFocusTokens(updatedTokens);
  };

  // Handle token toggle
  const handleTokenToggle = (token: string, enabled: boolean) => {
    const updatedTokens = focusTokens.map(t => (t.token === token ? { ...t, enabled } : t));
    setFocusTokens(updatedTokens);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    const settings = {
      riskProfile,
      aiLevel,
      timeframe,
      maxAllocation,
      stopLossDefault,
      takeProfitDefault,
      maxSimultaneousTrades,
      dollarCostAveraging,
      rebalancingEnabled,
      AIFeedback,
      focusTokens,
      maxDailyLoss,
      marketConditionOverride,
      trailingStopLoss,
      volatilityAdjustment,
      AINotifications,
    };

    if (onSave) {
      onSave(settings);
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Brain size={16} />
            <span>Strategy</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <BarChart4 size={16} />
            <span>Token Focus</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CryptoCard>
              <h3 className="text-lg font-medium mb-4">Risk Profile</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  variant={riskProfile === 'conservative' ? 'default' : 'outline'}
                  className={riskProfile === 'conservative' ? 'bg-blue-600' : ''}
                  onClick={() => setProfilePresets('conservative')}
                >
                  <Shield size={16} className="mr-2" />
                  Conservative
                </Button>
                <Button
                  variant={riskProfile === 'balanced' ? 'default' : 'outline'}
                  className={riskProfile === 'balanced' ? 'bg-purple-600' : ''}
                  onClick={() => setProfilePresets('balanced')}
                >
                  <TrendingUp size={16} className="mr-2" />
                  Balanced
                </Button>
                <Button
                  variant={riskProfile === 'aggressive' ? 'default' : 'outline'}
                  className={riskProfile === 'aggressive' ? 'bg-red-600' : ''}
                  onClick={() => setProfilePresets('aggressive')}
                >
                  <Rocket size={16} className="mr-2" />
                  Aggressive
                </Button>
                <Button
                  variant={riskProfile === 'custom' ? 'default' : 'outline'}
                  className={riskProfile === 'custom' ? 'bg-green-600' : ''}
                  onClick={() => setProfilePresets('custom')}
                >
                  <Settings size={16} className="mr-2" />
                  Custom
                </Button>
              </div>

              <div className="space-y-4 mt-8">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Max Allocation Per Trade</label>
                    <span className="text-sm font-medium">{maxAllocation}%</span>
                  </div>
                  <Slider
                    value={[maxAllocation]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={values => setMaxAllocation(values[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Default Stop Loss</label>
                    <span className="text-sm font-medium">{stopLossDefault}%</span>
                  </div>
                  <Slider
                    value={[stopLossDefault]}
                    min={5}
                    max={30}
                    step={1}
                    onValueChange={values => setStopLossDefault(values[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Default Take Profit</label>
                    <span className="text-sm font-medium">{takeProfitDefault}%</span>
                  </div>
                  <Slider
                    value={[takeProfitDefault]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={values => setTakeProfitDefault(values[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Max Simultaneous Trades</label>
                    <span className="text-sm font-medium">{maxSimultaneousTrades}</span>
                  </div>
                  <Slider
                    value={[maxSimultaneousTrades]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={values => setMaxSimultaneousTrades(values[0])}
                  />
                </div>
              </div>
            </CryptoCard>

            <div className="space-y-6">
              <CryptoCard variant="neon">
                <h3 className="text-lg font-medium mb-4">AI Involvement Level</h3>
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-md border cursor-pointer ${aiLevel === 'assisted' ? 'bg-black/40 border-[#00FF80]/30' : 'bg-black/20 border-white/10 hover:bg-black/30'}`}
                    onClick={() => setAILevel('assisted')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain
                          size={18}
                          className={aiLevel === 'assisted' ? 'text-[#00FF80]' : 'text-gray-400'}
                        />
                        <h4 className="font-medium ml-2">AI-Assisted</h4>
                      </div>
                      {aiLevel === 'assisted' && <Check size={18} className="text-[#00FF80]" />}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      AI suggests trades but requires your approval before execution
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-md border cursor-pointer ${aiLevel === 'semi-autonomous' ? 'bg-black/40 border-[#00FF80]/30' : 'bg-black/20 border-white/10 hover:bg-black/30'}`}
                    onClick={() => setAILevel('semi-autonomous')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain
                          size={18}
                          className={
                            aiLevel === 'semi-autonomous' ? 'text-[#00FF80]' : 'text-gray-400'
                          }
                        />
                        <h4 className="font-medium ml-2">Semi-Autonomous</h4>
                      </div>
                      {aiLevel === 'semi-autonomous' && (
                        <Check size={18} className="text-[#00FF80]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      AI executes trades within your parameters but needs approval for larger trades
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-md border cursor-pointer ${aiLevel === 'fully-autonomous' ? 'bg-black/40 border-[#00FF80]/30' : 'bg-black/20 border-white/10 hover:bg-black/30'}`}
                    onClick={() => setAILevel('fully-autonomous')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain
                          size={18}
                          className={
                            aiLevel === 'fully-autonomous' ? 'text-[#00FF80]' : 'text-gray-400'
                          }
                        />
                        <h4 className="font-medium ml-2">Fully Autonomous</h4>
                      </div>
                      {aiLevel === 'fully-autonomous' && (
                        <Check size={18} className="text-[#00FF80]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      AI manages all trading decisions within your risk parameters
                    </p>
                  </div>
                </div>
              </CryptoCard>

              <CryptoCard>
                <h3 className="text-lg font-medium mb-4">Trading Timeframe</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={timeframe === 'short' ? 'default' : 'outline'}
                    onClick={() => setTimeframe('short')}
                    className={
                      timeframe === 'short'
                        ? 'bg-[#00FF80]/30 hover:bg-[#00FF80]/40 text-[#00FF80] border-[#00FF80]/30'
                        : ''
                    }
                  >
                    <Clock size={16} className="mr-2" />
                    Short-Term
                  </Button>
                  <Button
                    variant={timeframe === 'medium' ? 'default' : 'outline'}
                    onClick={() => setTimeframe('medium')}
                    className={
                      timeframe === 'medium'
                        ? 'bg-[#00FF80]/30 hover:bg-[#00FF80]/40 text-[#00FF80] border-[#00FF80]/30'
                        : ''
                    }
                  >
                    <Clock size={16} className="mr-2" />
                    Medium-Term
                  </Button>
                  <Button
                    variant={timeframe === 'long' ? 'default' : 'outline'}
                    onClick={() => setTimeframe('long')}
                    className={
                      timeframe === 'long'
                        ? 'bg-[#00FF80]/30 hover:bg-[#00FF80]/40 text-[#00FF80] border-[#00FF80]/30'
                        : ''
                    }
                  >
                    <Clock size={16} className="mr-2" />
                    Long-Term
                  </Button>
                </div>
                <div className="flex items-start mt-4 bg-black/20 p-3 rounded-md">
                  <Info size={16} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-400">
                    {timeframe === 'short' &&
                      'Short-term trading focuses on quick market movements, potentially higher returns but with increased risk.'}
                    {timeframe === 'medium' &&
                      'Medium-term trading balances quick gains with trend following, offering a balance of risk and reward.'}
                    {timeframe === 'long' &&
                      'Long-term trading focuses on fundamental value and market trends, with reduced trading frequency and lower risk.'}
                  </p>
                </div>
              </CryptoCard>
            </div>
          </div>
        </TabsContent>

        {/* Token Focus Tab */}
        <TabsContent value="tokens">
          <CryptoCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Token Allocation Focus</h3>
              <Badge
                variant="outline"
                className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/30"
              >
                AI-Enhanced
              </Badge>
            </div>

            <div className="space-y-6">
              {focusTokens.map(token => (
                <div key={token.token} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium">{token.token}</span>
                      </div>
                      <label className="text-sm">{token.token}</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-10 text-right">
                        {token.allocation}%
                      </span>
                      <Switch
                        checked={token.enabled}
                        onCheckedChange={checked => handleTokenToggle(token.token, checked)}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[token.allocation]}
                    min={0}
                    max={100}
                    step={5}
                    disabled={!token.enabled}
                    onValueChange={values => handleTokenAllocationChange(token.token, values[0])}
                    className={token.enabled ? '' : 'opacity-50'}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="font-medium mb-3">Additional Settings</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <RefreshCw size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm">Auto-Rebalancing</span>
                  </div>
                  <Switch checked={rebalancingEnabled} onCheckedChange={setRebalancingEnabled} />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <PercentCircle size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm">Dollar-Cost Averaging</span>
                  </div>
                  <Switch checked={dollarCostAveraging} onCheckedChange={setDollarCostAveraging} />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Brain size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm">AI Performance Feedback</span>
                  </div>
                  <Switch checked={AIFeedback} onCheckedChange={setAIFeedback} />
                </div>
              </div>
            </div>
          </CryptoCard>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CryptoCard>
              <h3 className="text-lg font-medium mb-4">Risk Management</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm text-gray-400">Max Daily Loss</label>
                    <span className="text-sm font-medium">{maxDailyLoss}%</span>
                  </div>
                  <Slider
                    value={[maxDailyLoss]}
                    min={1}
                    max={10}
                    step={0.5}
                    onValueChange={values => setMaxDailyLoss(values[0])}
                  />
                  <p className="text-xs text-gray-500">
                    AI will stop trading if daily losses exceed this percentage
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm">Trailing Stop Loss</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically adjusts stop loss as price moves favorably
                    </p>
                  </div>
                  <Switch checked={trailingStopLoss} onCheckedChange={setTrailingStopLoss} />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <BarChart4 size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm">Volatility-Based Adjustments</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adjusts position sizing based on market volatility
                    </p>
                  </div>
                  <Switch
                    checked={volatilityAdjustment}
                    onCheckedChange={setVolatilityAdjustment}
                  />
                </div>
              </div>
            </CryptoCard>

            <div className="space-y-6">
              <CryptoCard variant="neon">
                <h3 className="text-lg font-medium mb-4">AI Behavior Settings</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <AlertTriangle size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm">Market Condition Override</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Allow AI to override settings in extreme market conditions
                      </p>
                    </div>
                    <Switch
                      checked={marketConditionOverride}
                      onCheckedChange={setMarketConditionOverride}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <Brain size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm">AI Trading Notifications</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Receive notifications for AI trading activities
                      </p>
                    </div>
                    <Switch checked={AINotifications} onCheckedChange={setAINotifications} />
                  </div>
                </div>

                <div className="mt-6 bg-black/40 p-3 rounded-md border border-[#00FF80]/20">
                  <div className="flex items-center mb-2">
                    <Lock size={16} className="text-[#00FF80] mr-2" />
                    <h4 className="font-medium text-[#00FF80]">Security Settings</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    TradesXBT AI operates with wallet permissions limited to your authorized tokens
                    and amount thresholds.
                  </p>
                  <p className="text-sm text-gray-400">
                    Private keys are never shared and can be revoked at any time.
                  </p>
                </div>
              </CryptoCard>

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Reset to Defaults</Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                >
                  <Save size={16} className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
