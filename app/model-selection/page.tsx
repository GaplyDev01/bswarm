// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Bot } from 'lucide-react';

export default function ModelSelectionPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold text-center mb-4">BlockSwarms Solana Trading AI</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Powered by advanced AI reasoning to help you analyze Solana tokens and make informed trading
        decisions.
      </p>

      <div className="flex justify-center">
        {/* Solana Trading AI Experience */}
        <Card className="flex flex-col border-2 hover:border-primary transition-all max-w-xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Solana Trading AI Assistant
            </CardTitle>
            <CardDescription>Powered by LLaMA 3.1 405b Reasoning</CardDescription>
          </CardHeader>

          <CardContent className="flex-grow">
            <p className="mb-4">
              Our specialized AI assistant uses advanced reasoning capabilities to provide in-depth
              Solana ecosystem analysis and trading insights. Perfect for traders focused on the
              Solana blockchain.
            </p>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span>Solana token price and market data</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span>Technical analysis indicators</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span>Trading signals and recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span>On-chain metrics and ecosystem insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span>Portfolio analysis and optimization</span>
              </li>
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
              onClick={() => router.push('/ai-chat')}
            >
              Start Trading Chat
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Optimized for the Solana ecosystem with specialized tools for token analysis
        </p>
      </div>
    </div>
  );
}
