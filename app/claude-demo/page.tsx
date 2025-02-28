'use client';

import { ClaudeChat } from '@/components/claude-chat';

export default function ClaudeDemoPage() {
  return (
    <div className="container mx-auto py-8 h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6">Claude 3.7 Sonnet Demo</h1>
      <p className="mb-6 text-muted-foreground">
        This demo showcases Claude 3.7 Sonnet's extended thinking capabilities. Try asking complex
        questions about crypto markets, token prices, or trading strategies.
      </p>

      <div className="h-[calc(100%-120px)]">
        <ClaudeChat />
      </div>
    </div>
  );
}
