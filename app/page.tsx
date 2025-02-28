// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Brain,
  LineChart,
  BarChart,
  Zap,
  Settings,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { JoinModal } from './JoinModal';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const router = useRouter();

  // Redirect to AI Chat page
  useEffect(() => {
    router.push('/ai-chat');
  }, [router]);

  useEffect(() => {
    const handleOpenModal = () => setIsJoinModalOpen(true);
    window.addEventListener('openJoinModal', handleOpenModal);
    return () => window.removeEventListener('openJoinModal', handleOpenModal);
  }, []);

  return (
    <div className="min-h-screen bg-sapphire-900 overflow-hidden bg-tech-pattern">
      <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />

      {/* Hero background with particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sapphire-900 via-sapphire-900/90 to-sapphire-800/50" />
        <div className="absolute w-full h-full">
          <Image
            src="/images/particles-bg.png"
            alt="Particles background"
            fill
            quality={75}
            sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.2 }}
            priority
          />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
      </div>

      {/* Logo and Brand area */}
      <div className="relative mx-auto container px-4 pt-8">
        <div className="text-emerald-400 font-cyber font-bold text-2xl tracking-wider">
          TradesXBT
        </div>
      </div>

      {/* Hero section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative pt-16 pb-32 lg:pt-24 lg:pb-40"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-cyber font-bold text-emerald-400 leading-tight mb-6">
              AI-Powered <span className="text-white">Solana</span> Trading
            </h1>
            <p className="text-lg md:text-xl text-emerald-400/80 mb-10 max-w-2xl mx-auto">
              Harness the power of advanced AI to analyze Solana tokens, predict market movements,
              and optimize your trading strategies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-emerald-400 text-sapphire-900 font-bold font-cyber px-8 py-4 rounded-md hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                ENTER PLATFORM <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-transparent border-2 border-emerald-400 text-emerald-400 font-bold font-cyber px-8 py-4 rounded-md hover:bg-emerald-400/10 transition-colors"
              >
                JOIN THE SWARM
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="relative py-20 bg-sapphire-800/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold text-emerald-400 text-center mb-16">
            POWERED BY AI, DESIGNED FOR TRADERS
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <LineChart className="w-12 h-12 text-emerald-400" />,
                title: 'Token Analysis',
                description:
                  'Get in-depth analysis on any token with price predictions, technical indicators, and sentiment analysis.',
              },
              {
                icon: <Brain className="w-12 h-12 text-emerald-400" />,
                title: 'Market Sentiment',
                description:
                  'Track real-time sentiment across social platforms and news sources to anticipate market movements.',
              },
              {
                icon: <BarChart className="w-12 h-12 text-emerald-400" />,
                title: 'Portfolio Management',
                description:
                  'Monitor your holdings and get AI-powered suggestions for optimizing your crypto portfolio.',
              },
              {
                icon: <Zap className="w-12 h-12 text-emerald-400" />,
                title: 'Trading Signals',
                description:
                  'Receive precise buy, sell, and hold signals with entry and exit points based on multiple time frames.',
              },
              {
                icon: <Settings className="w-12 h-12 text-emerald-400" />,
                title: 'Customizable AI',
                description:
                  'Configure which AI models and tools to use based on your preferences and trading style.',
              },
              {
                icon: <Bot className="w-12 h-12 text-emerald-400" />,
                title: 'AI Chat',
                description:
                  'Chat directly with specialized AI models for token analysis, market insights, and trading recommendations.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-sapphire-900/70 backdrop-blur-sm border border-emerald-400/20 rounded-lg p-6 hover:border-emerald-400/40 transition-all"
              >
                <div className="bg-sapphire-800/50 p-4 rounded-lg inline-block mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-cyber font-bold text-emerald-400 mb-3">
                  {feature.title}
                </h3>
                <p className="text-emerald-400/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Platform preview */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="relative py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold text-emerald-400 text-center mb-16">
            VISUALIZE THE MARKET LIKE NEVER BEFORE
          </h2>

          <div className="relative max-w-5xl mx-auto rounded-lg overflow-hidden border border-emerald-400/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 to-transparent z-10 pointer-events-none" />
            <Image
              src="/images/platform-preview.png"
              alt="Platform Preview"
              width={1200}
              height={675}
              className="w-full"
            />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-emerald-400 text-sapphire-900 font-bold font-cyber px-8 py-4 rounded-md hover:bg-emerald-300 transition-colors"
            >
              EXPERIENCE IT NOW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeIn}
        className="relative py-20 bg-gradient-to-br from-sapphire-800 to-sapphire-900"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-sapphire-900/70 backdrop-blur-md border border-emerald-400/30 rounded-xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold text-emerald-400 text-center mb-6">
              JOIN THE NEXT GENERATION OF SOLANA TRADERS
            </h2>
            <p className="text-lg text-emerald-400/80 text-center mb-10">
              Whether you're a beginner or an experienced trader, TradesXBT's AI-powered insights
              will elevate your Solana trading strategy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-emerald-400 text-sapphire-900 font-bold font-cyber px-8 py-4 rounded-md hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                ENTER PLATFORM <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-transparent border-2 border-emerald-400 text-emerald-400 font-bold font-cyber px-8 py-4 rounded-md hover:bg-emerald-400/10 transition-colors"
              >
                JOIN THE SWARM
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
