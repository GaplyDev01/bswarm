// @ts-nocheck
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Zap, ChevronsUpDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

// Define models for AI providers
const aiModels = [
  {
    id: 'llama-3.1-405b-reasoning',
    name: 'LLaMA 3.1 405B (Groq)',
    description: 'Specialized Solana trading model with exceptional reasoning capability',
    provider: 'groq',
  },
];

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
  currentProvider?: string;
  onProviderChange?: (providerId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  currentModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  // Find the currently selected model from our array
  const selectedModel = aiModels.find(model => model.id === currentModel) || aiModels[0];

  return (
    <div className="w-full">
      <p className="text-sm font-medium mb-2">Model</p>
      <div className="relative">
        <DropdownMenu.Root open={false}>
          <DropdownMenu.Trigger asChild disabled>
            <button
              className={cn(
                'flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                disabled && 'opacity-70 cursor-not-allowed'
              )}
            >
              <div className="flex items-center">
                <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                <span>{selectedModel.name}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
        </DropdownMenu.Root>
      </div>
      <p className="text-xs text-gray-500 mt-1">{selectedModel.description}</p>
    </div>
  );
}
