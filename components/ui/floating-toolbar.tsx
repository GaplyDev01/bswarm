'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface FloatingToolbarProps {
  tabs: ToolbarTab[];
  position?: 'top' | 'bottom';
  className?: string;
  initialTab?: string;
  variant?: 'neon' | 'glass' | 'dark';
}

export default function FloatingToolbar({
  tabs,
  position = 'bottom',
  className,
  initialTab,
  variant = 'neon',
}: FloatingToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab || tabs[0].id);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Variant styles
  const variantStyles = {
    neon: 'bg-black/80 border-t border-[#00FF80]/30 shadow-[0_0_20px_rgba(0,255,128,0.2)]',
    glass: 'bg-black/40 backdrop-blur-xl border-t border-white/10',
    dark: 'bg-[#0A0A0A] border-t border-[#222222]',
  };

  const barClasses = cn(
    'fixed left-0 right-0 transition-all duration-300 z-40',
    position === 'top' ? 'top-0' : 'bottom-0',
    variantStyles[variant],
    className
  );

  return (
    <div className={barClasses}>
      {/* Handle */}
      <div className="flex justify-center cursor-pointer" onClick={handleToggle}>
        <motion.div
          className="flex items-center justify-center p-1 rounded-t-none rounded-b-md bg-inherit border-b border-l border-r border-inherit w-24"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <ChevronDown
            size={18}
            className={variant === 'neon' ? 'text-[#00FF80]' : 'text-gray-400'}
          />
        </motion.div>
      </div>

      {/* Main toolbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pb-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab navigation */}
            <div className="flex space-x-2 px-4 pt-3 pb-3 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={cn(
                    'flex items-center px-3 py-1.5 rounded-md min-w-max transition-colors',
                    activeTab === tab.id
                      ? variant === 'neon'
                        ? 'bg-[#00FF80]/20 text-[#00FF80] border border-[#00FF80]/30'
                        : 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-4">
              {tabs.map(tab => (
                <div key={tab.id} className={cn(activeTab === tab.id ? 'block' : 'hidden')}>
                  {tab.content}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
