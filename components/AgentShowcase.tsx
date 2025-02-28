'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  X,
  Bot,
  Brain,
  TrendingUp,
  Gauge,
  BarChart,
  Wallet,
  PieChart,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  icon: React.ReactNode;
  color: string;
  platform: {
    name: string;
    url: string;
    logo?: string;
    description: string;
  };
  stats: {
    accuracy: number;
    responseTime: number;
    specialization: string;
  };
  tags: string[];
}

const agents: Agent[] = [
  {
    id: 'tradesxbt',
    name: 'TradesXBT',
    role: 'Solana Trading Agent',
    description:
      'All-in-one Solana trading agent that combines AI-powered market analysis, on-chain monitoring, and automated execution to maximize your trading performance on the Solana ecosystem.',
    capabilities: [
      'Real-time technical analysis and signal generation',
      'Automated trade execution with risk management',
      'On-chain data analysis and whale monitoring',
      'Portfolio optimization and performance tracking',
      'Sentiment analysis across social platforms',
    ],
    icon: <Sparkles className="h-6 w-6" />,
    color: 'from-[#00FF80] to-blue-600',
    platform: {
      name: 'TradesXBT',
      url: '/trading',
      description: 'Advanced Solana Trading Platform',
    },
    stats: {
      accuracy: 93,
      responseTime: 0.4,
      specialization: 'Solana Trading',
    },
    tags: ['Solana', 'AI Trading', 'Technical Analysis', 'Automated Execution'],
  },
  // Placeholder agents coming soon (these will be developed by Gaply Labs in the future)
  {
    id: 'coming-soon-1',
    name: 'AnalyticaAI',
    role: 'Coming Soon',
    description:
      'Future agent from Gaply Labs that will focus on advanced data analytics across multiple blockchains. Currently in development.',
    capabilities: [
      'Cross-chain data correlation (coming soon)',
      'Predictive market modeling (coming soon)',
      'Anomaly detection systems (coming soon)',
      'Custom indicator development (coming soon)',
    ],
    icon: <Search className="h-6 w-6" />,
    color: 'from-purple-600 to-pink-600',
    platform: {
      name: 'Coming Soon',
      url: '#',
      description: 'This agent is currently in development by Gaply Labs',
    },
    stats: {
      accuracy: 0,
      responseTime: 0,
      specialization: 'In Development',
    },
    tags: ['Coming Soon', 'In Development', 'Multi-chain'],
  },
  {
    id: 'coming-soon-2',
    name: 'LiquidityPro',
    role: 'Coming Soon',
    description:
      'Future agent from Gaply Labs that will focus on optimizing liquidity provision across DeFi protocols. Currently in development.',
    capabilities: [
      'Automated LP position management (coming soon)',
      'Impermanent loss mitigation (coming soon)',
      'Yield optimization strategies (coming soon)',
      'Risk-adjusted position sizing (coming soon)',
    ],
    icon: <Gauge className="h-6 w-6" />,
    color: 'from-amber-500 to-orange-600',
    platform: {
      name: 'Coming Soon',
      url: '#',
      description: 'This agent is currently in development by Gaply Labs',
    },
    stats: {
      accuracy: 0,
      responseTime: 0,
      specialization: 'In Development',
    },
    tags: ['Coming Soon', 'In Development', 'DeFi'],
  },
];

interface AgentShowcaseProps {
  className?: string;
}

export default function AgentShowcase({ className = '' }: AgentShowcaseProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer transition-all hover:border-[#00FF80]/30 hover:bg-black/50"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mr-4`}
                >
                  {agent.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.role}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-black/50 text-[#00FF80] border-[#00FF80]/20">
                Agent
              </Badge>
            </div>

            <p className="text-sm text-gray-300 mb-4 line-clamp-3">{agent.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {agent.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-black/30 border-white/10 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">
                Platform: <span className="text-white">{agent.platform.name}</span>
              </div>
              <Button size="sm" variant="outline" className="h-8">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={selectedAgent !== null} onOpenChange={open => !open && setSelectedAgent(null)}>
        <DialogContent className="bg-black/90 border border-[#00FF80]/20 p-0 max-w-4xl max-h-[90vh] overflow-auto">
          {selectedAgent && (
            <div className="relative">
              {/* Header with gradient */}
              <div
                className={`w-full h-32 bg-gradient-to-r ${selectedAgent.color} rounded-t-md relative overflow-hidden`}
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/40 border border-white/10 rounded-full"
                  onClick={() => setSelectedAgent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedAgent.color} flex items-center justify-center mr-4 border-2 border-black`}
                    >
                      {selectedAgent.icon}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h2 className="font-bold text-2xl text-white">{selectedAgent.name}</h2>
                        <Badge
                          variant="outline"
                          className="ml-2 bg-black/50 text-[#00FF80] border-[#00FF80]/20"
                        >
                          {selectedAgent.id === 'tradesxbt' ? 'Available Now' : 'Coming Soon'}
                        </Badge>
                      </div>
                      <p className="text-gray-200">{selectedAgent.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3 text-[#00FF80]">Overview</h3>
                      <p className="text-gray-300">{selectedAgent.description}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3 text-[#00FF80]">Capabilities</h3>
                      <ul className="space-y-2">
                        {selectedAgent.capabilities.map((capability, i) => (
                          <li key={i} className="flex items-start">
                            <Sparkles className="h-5 w-5 text-[#00FF80] mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-gray-300">{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 text-[#00FF80]">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-black/30 border-[#00FF80]/20 text-white"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6">
                      <h3 className="font-medium mb-4 text-center">Performance Metrics</h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Accuracy</span>
                            <span className="text-[#00FF80]">{selectedAgent.stats.accuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-900 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#00FF80] to-green-500 h-2 rounded-full"
                              style={{ width: `${selectedAgent.stats.accuracy}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Response Time</span>
                            <span className="text-[#00FF80]">
                              {selectedAgent.stats.responseTime}s
                            </span>
                          </div>
                          <div className="w-full bg-gray-900 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#00FF80] to-green-500 h-2 rounded-full"
                              style={{ width: `${100 - selectedAgent.stats.responseTime * 20}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10">
                          <div className="text-sm mb-2">
                            <span className="text-gray-400">Specialization:</span>
                            <span className="text-white ml-2">
                              {selectedAgent.stats.specialization}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                      <h3 className="font-medium mb-4">Connected Platform</h3>

                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center mr-3">
                          <span className="font-bold text-white text-xs">T</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{selectedAgent.platform.name}</h4>
                          <p className="text-xs text-gray-400">Solana Trading</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mb-4">
                        {selectedAgent.platform.description}
                      </p>

                      {selectedAgent.id === 'tradesxbt' ? (
                        <Button
                          className="w-full bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                          asChild
                        >
                          <Link href={selectedAgent.platform.url}>
                            Launch TradesXBT
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300"
                          disabled
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
