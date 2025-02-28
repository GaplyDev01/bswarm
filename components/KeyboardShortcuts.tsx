'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard, X, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Keyboard shortcuts definition
export interface KeyboardShortcut {
  key: string;
  description: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  group?: string;
  action?: () => void;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'g', ctrlKey: true, description: 'Go to dashboard', group: 'Navigation' },
  { key: 't', ctrlKey: true, description: 'Go to trading page', group: 'Navigation' },
  { key: 'p', ctrlKey: true, description: 'Go to portfolio', group: 'Navigation' },
  { key: 'a', ctrlKey: true, description: 'Go to analytics', group: 'Navigation' },
  { key: 's', ctrlKey: true, description: 'Go to signals', group: 'Navigation' },

  // Trading
  { key: 'b', description: 'Quick buy order', group: 'Trading' },
  { key: 's', description: 'Quick sell order', group: 'Trading' },
  { key: 'm', description: 'Market order', group: 'Trading' },
  { key: 'l', description: 'Limit order', group: 'Trading' },
  { key: 'Escape', description: 'Cancel order', group: 'Trading' },

  // Chart Controls
  { key: '1', description: 'Line chart', group: 'Charts' },
  { key: '2', description: 'Candle chart', group: 'Charts' },
  { key: '3', description: 'Bar chart', group: 'Charts' },
  { key: '4', description: 'Area chart', group: 'Charts' },
  { key: '+', description: 'Zoom in', group: 'Charts' },
  { key: '-', description: 'Zoom out', group: 'Charts' },
  { key: 'r', description: 'Reset zoom', group: 'Charts' },
  { key: 'd', description: 'Toggle drawing mode', group: 'Charts' },
  { key: 'i', description: 'Add indicator', group: 'Charts' },

  // AI Assistant
  { key: 'a', altKey: true, description: 'Open AI assistant', group: 'AI' },
  { key: 's', altKey: true, description: 'Generate trading signal', group: 'AI' },
  { key: 'p', altKey: true, description: 'AI price prediction', group: 'AI' },

  // Misc
  { key: '/', description: 'Search', group: 'General' },
  { key: 'f', ctrlKey: true, description: 'Filter results', group: 'General' },
  { key: '?', description: 'Show this help dialog', group: 'General' },
  { key: 'k', ctrlKey: true, description: 'Command palette', group: 'General' },
];

export interface KeyboardShortcutsProps {
  shortcuts?: KeyboardShortcut[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function KeyboardShortcuts({
  shortcuts = DEFAULT_SHORTCUTS,
  isOpen = false,
  onClose,
}: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(isOpen);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Toggle shortcuts dialog
  const toggleShortcuts = () => {
    setShowShortcuts(!showShortcuts);
    if (!showShortcuts && onClose) {
      onClose();
    }
  };

  // Format key for display
  const formatKey = (key: string): string => {
    const specialKeys: { [key: string]: string } = {
      Escape: 'Esc',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Control: 'Ctrl',
      Alt: 'Alt',
      Shift: 'Shift',
      Meta: '⌘',
      Enter: '↵',
      Tab: '⇥',
      ' ': 'Space',
    };

    return specialKeys[key] || key.toUpperCase();
  };

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc: { [key: string]: KeyboardShortcut[] }, shortcut) => {
      const group = shortcut.group || 'General';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(shortcut);
      return acc;
    },
    {}
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts with ? key
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        toggleShortcuts();
      }

      // Close with escape
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        if (onClose) onClose();
      }

      // Execute shortcut actions if defined
      if (showShortcuts) return; // Don't execute shortcuts when dialog is open

      shortcuts.forEach(shortcut => {
        if (
          shortcut.action &&
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey) &&
          (shortcut.altKey === undefined || e.altKey === shortcut.altKey) &&
          (shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey)
        ) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, showShortcuts, onClose]);

  // Don't render anything if not shown
  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 border border-[#00FF80]/20 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#00FF80]/20 flex items-center justify-between">
          <div className="flex items-center">
            <Keyboard size={18} className="text-[#00FF80] mr-2" />
            <h2 className="text-lg font-medium">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleShortcuts}>
            <X size={18} />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-[#00FF80]/10 p-3 overflow-y-auto">
            {Object.keys(groupedShortcuts).map(group => (
              <Button
                key={group}
                variant="ghost"
                size="sm"
                className={`w-full justify-start mb-1 ${activeGroup === group ? 'bg-[#00FF80]/10 text-[#00FF80]' : ''}`}
                onClick={() => setActiveGroup(group === activeGroup ? null : group)}
              >
                {group}
              </Button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {Object.entries(groupedShortcuts)
              .filter(([group]) => !activeGroup || group === activeGroup)
              .map(([group, groupShortcuts]) => (
                <div key={group} className="mb-6">
                  <h3 className="text-sm font-medium text-[#00FF80] mb-3 flex items-center">
                    <Zap size={14} className="mr-1" />
                    {group}
                  </h3>

                  <div className="space-y-2">
                    {groupShortcuts.map((shortcut, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex space-x-1">
                          {shortcut.ctrlKey && (
                            <Badge variant="outline" className="bg-black/40 border-white/20">
                              Ctrl
                            </Badge>
                          )}
                          {shortcut.altKey && (
                            <Badge variant="outline" className="bg-black/40 border-white/20">
                              Alt
                            </Badge>
                          )}
                          {shortcut.shiftKey && (
                            <Badge variant="outline" className="bg-black/40 border-white/20">
                              Shift
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-black/40 border-white/20">
                            {formatKey(shortcut.key)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {activeGroup && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setActiveGroup(null)}>
                  View All Shortcuts
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-[#00FF80]/20 bg-black/40 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Press <kbd className="px-1 py-0.5 bg-black/40 border border-white/10 rounded">?</kbd>{' '}
            anytime to show this dialog
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={toggleShortcuts}>
            <CheckCircle size={12} className="mr-1" />
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
