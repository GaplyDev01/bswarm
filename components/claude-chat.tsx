'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Sparkles, Brain } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';

export function ClaudeChat() {
  const [reasoningVisible, setReasoningVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/claude-chat',
    onResponse: response => {
      logger.log('Chat response received');
    },
    onError: error => {
      logger.error('Chat error:', error);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          Claude 3.7 Sonnet Chat
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setReasoningVisible(!reasoningVisible)}
          >
            <Brain className="h-4 w-4 mr-1" />
            {reasoningVisible ? 'Hide Reasoning' : 'Show Reasoning'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Ask Claude anything... it can use extended thinking for complex problems</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>{message.role === 'user' ? 'U' : 'A'}</AvatarFallback>
                    {message.role === 'assistant' && (
                      <AvatarImage src="/claude-avatar.png" alt="Claude" />
                    )}
                  </Avatar>
                  <span className="font-semibold">
                    {message.role === 'user' ? 'You' : 'Claude'}
                  </span>
                </div>

                <div>
                  {message.parts.map((part, index) => {
                    // Text content
                    if (part.type === 'text') {
                      return (
                        <div key={index} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }

                    // Reasoning (if enabled)
                    if (part.type === 'reasoning' && reasoningVisible) {
                      return (
                        <div key={index} className="mt-2 border-t border-dashed pt-2">
                          <div className="text-sm font-medium mb-1 flex items-center">
                            <Brain className="h-3 w-3 mr-1" />
                            Reasoning Process
                          </div>
                          <pre className="text-xs bg-black/5 p-2 rounded overflow-x-auto">
                            {part.details
                              .map((detail, i) =>
                                detail.type === 'text' ? detail.text : '<redacted>'
                              )
                              .join('\n')}
                          </pre>
                        </div>
                      );
                    }

                    // Tool calls would be handled here
                    return null;
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
          <Textarea
            name="message"
            placeholder="Ask Claude anything..."
            value={input}
            onChange={handleInputChange}
            className="flex-1 min-h-24 resize-none"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
