'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import {
  Bell,
  CreditCard,
  Key,
  Shield,
  User,
  Wallet,
  Settings,
  ChevronRight,
  Zap,
  Star,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user preferences
  const preferences = {
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    twoFactorEnabled: true,
    autoSell: false,
    tradingBots: true,
  };

  // Membership level and benefits
  const membership = {
    level: 'Premium',
    since: 'Jan 2024',
    progress: 75, // Progress to next level
    nextLevel: 'Elite',
    benefits: [
      { name: 'Priority Access', active: true },
      { name: 'Signal Alerts', active: true },
      { name: 'Portfolio Insights', active: true },
      { name: 'Automated Trading', active: true },
      { name: 'Exclusive Webinars', active: false },
    ],
  };

  // Mock achievements
  const achievements = [
    {
      name: 'First Trade',
      description: 'Completed your first trade',
      completed: true,
      date: 'Jan 15, 2024',
    },
    {
      name: 'Portfolio Builder',
      description: 'Added 5 different assets to your portfolio',
      completed: true,
      date: 'Jan 22, 2024',
    },
    {
      name: 'Profit Master',
      description: 'Achieved 20% profit on any trade',
      completed: true,
      date: 'Feb 10, 2024',
    },
    {
      name: 'Trade Streak',
      description: 'Completed trades on 7 consecutive days',
      completed: false,
      progress: 4,
    },
    {
      name: 'Diversification Pro',
      description: 'Hold assets across 3 different blockchains',
      completed: false,
      progress: 1,
    },
  ];

  // Define a type for the achievements to help TypeScript understand the shape
  type Achievement = {
    name: string;
    description: string;
    completed: boolean;
    date?: string;
    progress?: number;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">User Profile</h2>
          <p className="text-muted-foreground">
            Manage your account, preferences, and achievements
          </p>
        </div>

        <Link href="/settings">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-border">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">User ID</h3>
                  <p className="text-muted-foreground text-sm">
                    {userId ? userId.substring(0, 12) + '...' : 'Not signed in'}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Link
                  href="/settings/profile"
                  className="flex items-center justify-between text-sm hover:text-primary transition"
                >
                  <span>Edit Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/settings/security"
                  className="flex items-center justify-between text-sm hover:text-primary transition"
                >
                  <span>Security Settings</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center justify-between text-sm hover:text-primary transition"
                >
                  <span>Connected Wallets</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>

            <Card className="p-6 border-border md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Membership Status</h3>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium">
                  {membership.level}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Member since {membership.since}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Progress to {membership.nextLevel}</span>
                  <span>{membership.progress}%</span>
                </div>
                <Progress value={membership.progress} className="h-2" />
              </div>

              <h4 className="font-medium mb-3">Membership Benefits</h4>
              <div className="space-y-2">
                {membership.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    {benefit.active ? (
                      <Zap className="w-4 h-4 text-primary mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 text-muted-foreground mr-2" />
                    )}
                    <span className={benefit.active ? 'text-sm' : 'text-sm text-muted-foreground'}>
                      {benefit.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/wallet">
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet
                </Button>
              </Link>
              <Link href="/settings/security">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </Button>
              </Link>
              <Link href="/settings/api-keys">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </Button>
              </Link>
              <Link href="/settings/billing">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </Link>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark mode appearance</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.darkMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.darkMode ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.emailNotifications ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.pushNotifications ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.pushNotifications ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Enable additional security</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.twoFactorEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.twoFactorEnabled ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-medium">Auto-Sell Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically sell tokens at set thresholds
                  </p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.autoSell ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.autoSell ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Trading Bots</p>
                  <p className="text-sm text-muted-foreground">Enable automated trading bots</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative ${preferences.tradingBots ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div
                    className={`absolute top-1 ${preferences.tradingBots ? 'right-1' : 'left-1'} w-4 h-4 rounded-full bg-background transition-all`}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold mb-4">User Achievements</h3>
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 
                    ${achievement.completed ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}
                  >
                    {achievement.completed ? (
                      <Star className="w-5 h-5" />
                    ) : (
                      <Star className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{achievement.name}</h4>
                      {achievement.completed && (
                        <span className="text-xs text-muted-foreground">{achievement.date}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    {!achievement.completed && 'progress' in achievement && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {(achievement as Achievement & { progress: number }).progress}/7
                          </span>
                        </div>
                        <Progress
                          value={
                            ((achievement as Achievement & { progress: number }).progress / 7) * 100
                          }
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
