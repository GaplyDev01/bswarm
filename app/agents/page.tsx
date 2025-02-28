// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bot,
  Brain,
  PieChart,
  ArrowRight,
  ExternalLink,
  Star,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface AgentCard {
  id: string;
  name: string;
  description: string;
  specialization: string;
  avatar: React.ReactNode;
  performance?: {
    monthly: number;
    allTime: number;
  };
  features: string[];
  status: 'active' | 'coming_soon';
}

const agents: AgentCard[] = [
  {
    id: 'tradesxbt',
    name: 'TradesXBT',
    description:
      'AI-powered Solana trading specialist with advanced market analysis capabilities and live trading signals.',
    specialization: 'Solana Trading',
    avatar: <Bot className="w-24 h-24 text-emerald-400" />,
    performance: {
      monthly: 18.7,
      allTime: 142.3,
    },
    features: [
      'Real-time Solana token analysis',
      'Technical indicator processing',
      'Sentiment analysis from social media',
      'Automated trading signals',
      'Risk management recommendations',
      'Portfolio optimization',
    ],
    status: 'active',
  },
  {
    id: 'cryptosage',
    name: 'CryptoSage',
    description:
      'Cryptocurrency market trend analyzer specializing in long-term investment strategies and macro analysis.',
    specialization: 'Crypto Analysis',
    avatar: <Brain className="w-24 h-24 text-emerald-400/30" />,
    features: [
      'Macro economic trend analysis',
      'Long-term investment strategies',
      'Correlation analysis with traditional markets',
      'Fundamental analysis of protocols',
      'Regulatory impact assessment',
    ],
    status: 'coming_soon',
  },
  {
    id: 'nftoracle',
    name: 'NFT Oracle',
    description:
      'NFT market specialist focusing on collection valuations and investment opportunities in digital assets.',
    specialization: 'NFT Markets',
    avatar: <PieChart className="w-24 h-24 text-emerald-400/30" />,
    features: [
      'NFT collection valuation',
      'Rarity analysis',
      'Market volume tracking',
      'Creator reputation assessment',
      'Floor price prediction',
    ],
    status: 'coming_soon',
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-sapphire-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-cyber text-emerald-400 mb-4">AI Trading Agents</h1>
          <p className="text-xl text-emerald-400/80 max-w-3xl">
            Our AI agents are specialized trading assistants with unique capabilities and expertise.
            Connect with the agent that best matches your trading goals and strategy.
          </p>
        </div>

        {/* Agents List */}
        <div className="space-y-12">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`backdrop-blur-md bg-sapphire-800/30 border ${
                agent.status === 'active' ? 'border-emerald-400/30' : 'border-emerald-400/10'
              } rounded-lg overflow-hidden group relative`}
            >
              {/* Agent Status Badge */}
              {agent.status === 'coming_soon' && (
                <div className="absolute top-6 right-6 z-20">
                  <span className="bg-yellow-500/20 text-yellow-400 text-sm py-1 px-4 rounded-full border border-yellow-500/30">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="flex flex-col md:flex-row">
                {/* Agent Avatar Section */}
                <div className="md:w-1/4 p-8 flex justify-center items-center bg-sapphire-800/50">
                  <div
                    className={`rounded-full p-6 ${
                      agent.status === 'active'
                        ? 'bg-emerald-400/10 border border-emerald-400/30'
                        : 'bg-emerald-400/5 border border-emerald-400/10'
                    }`}
                  >
                    {agent.avatar}
                  </div>
                </div>

                {/* Agent Info */}
                <div className="md:w-3/4 p-8">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h2
                        className={`text-3xl font-cyber ${agent.status === 'active' ? 'text-emerald-400' : 'text-emerald-400/50'} mb-2`}
                      >
                        {agent.name}
                      </h2>
                      <span
                        className={`text-sm px-3 py-1 rounded-full border ${
                          agent.status === 'active'
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                            : 'border-emerald-400/10 bg-emerald-400/5 text-emerald-400/50'
                        }`}
                      >
                        {agent.specialization}
                      </span>
                    </div>

                    {agent.status === 'active' && agent.performance && (
                      <div className="flex gap-4">
                        <div className="bg-sapphire-900/50 px-4 py-2 rounded-md text-center">
                          <p className="text-xs text-emerald-400/60 mb-1">Monthly Return</p>
                          <p className="text-xl font-cyber text-emerald-400">
                            +{agent.performance.monthly}%
                          </p>
                        </div>
                        <div className="bg-sapphire-900/50 px-4 py-2 rounded-md text-center">
                          <p className="text-xs text-emerald-400/60 mb-1">All-Time</p>
                          <p className="text-xl font-cyber text-emerald-400">
                            +{agent.performance.allTime}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-lg mb-6 ${agent.status === 'active' ? 'text-emerald-400/80' : 'text-emerald-400/40'}`}
                  >
                    {agent.description}
                  </p>

                  <div className="mb-8">
                    <h3
                      className={`text-lg font-cyber mb-3 ${agent.status === 'active' ? 'text-emerald-400' : 'text-emerald-400/40'}`}
                    >
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {agent.features.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 ${agent.status === 'active' ? 'text-emerald-400/80' : 'text-emerald-400/30'}`}
                        >
                          <Star className="w-4 h-4 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {agent.status === 'active' ? (
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href={`/platform/dashboard?agent=${agent.id}`}
                        className="px-6 py-3 bg-emerald-400 text-sapphire-900 font-cyber uppercase tracking-wide hover:bg-emerald-500 transition-colors"
                      >
                        Connect <ExternalLink className="w-4 h-4 inline-block ml-1" />
                      </Link>
                      <Link
                        href={`/platform/token-analysis`}
                        className="px-6 py-3 border border-emerald-400 text-emerald-400 font-cyber uppercase tracking-wide hover:bg-emerald-400/10 transition-colors"
                      >
                        View Token Analysis
                      </Link>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="px-6 py-3 bg-emerald-400/20 text-emerald-400/40 font-cyber uppercase tracking-wide cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-sapphire-800/30 border border-emerald-400/20 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-cyber text-emerald-400">Performance Tracking</h3>
            </div>
            <p className="text-emerald-400/70">
              All our agents&apos; trading performance is transparently tracked and verified. Performance
              metrics are updated in real-time to reflect actual market results.
            </p>
          </div>

          <div className="bg-sapphire-800/30 border border-emerald-400/20 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-cyber text-emerald-400">AI Technology</h3>
            </div>
            <p className="text-emerald-400/70">
              Our agents are powered by state-of-the-art large language models and specialized
              neural networks trained on financial data and crypto markets.
            </p>
          </div>

          <div className="bg-sapphire-800/30 border border-emerald-400/20 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-cyber text-emerald-400">Risk Management</h3>
            </div>
            <p className="text-emerald-400/70">
              All agents incorporate advanced risk management protocols to protect your capital and
              ensure sustainable, long-term performance.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-sapphire-800/50 border border-emerald-400/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-cyber text-emerald-400 mb-4">
            Ready to Start Trading with AI?
          </h2>
          <p className="text-emerald-400/80 mb-6 max-w-2xl mx-auto">
            Connect with TradesXBT now and experience the power of AI-driven market analysis and
            trading signals for Solana tokens.
          </p>
          <Link
            href="/platform/dashboard"
            className="inline-block px-8 py-4 bg-emerald-400 text-sapphire-900 font-cyber uppercase tracking-wide hover:bg-emerald-500 transition-colors"
          >
            Enter Platform <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
