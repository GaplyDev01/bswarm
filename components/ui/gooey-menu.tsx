// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color?: string;
  href?: string;
};

interface GooeyMenuProps {
  mainIcon: React.ReactNode;
  items: MenuItem[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  direction?: 'horizontal' | 'vertical' | 'radial';
  className?: string;
  variant?: 'neon' | 'glass' | 'gradient' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: boolean;
}

export default function GooeyMenu({
  mainIcon,
  items,
  position = 'bottom-right',
  direction = 'radial',
  className,
  variant = 'neon',
  size = 'md',
  tooltip = true,
}: GooeyMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Size classes
  const buttonSize = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }[size];

  const itemSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  // Variant classes
  const variantClasses = {
    neon: 'bg-black/60 border border-[#00FF80]/30 shadow-[0_0_15px_rgba(0,255,128,0.2)] text-[#00FF80]',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white',
    gradient: 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-none text-white',
    solid: 'bg-[#1E1E1E] border border-[#333333] text-white',
  }[variant];

  // Direction & positions
  const getItemPositions = (index: number, total: number) => {
    const distance = size === 'sm' ? 60 : size === 'md' ? 70 : 80;

    if (direction === 'horizontal') {
      return { x: (index + 1) * distance * (position.includes('left') ? 1 : -1), y: 0 };
    } else if (direction === 'vertical') {
      return { x: 0, y: (index + 1) * distance * (position.includes('top') ? 1 : -1) };
    } else {
      // Radial positioning
      const angle = index * (Math.PI / (total - 1)) - Math.PI / 2;
      let startAngle = 0;

      if (position === 'bottom-right') startAngle = -Math.PI / 4;
      else if (position === 'bottom-left') startAngle = (-Math.PI * 3) / 4;
      else if (position === 'top-left') startAngle = (Math.PI * 3) / 4;
      else if (position === 'top-right') startAngle = Math.PI / 4;

      const finalAngle = startAngle + angle;
      return {
        x: Math.cos(finalAngle) * distance,
        y: Math.sin(finalAngle) * distance,
      };
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position class
  const positionClass = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }[position];

  // Add SVG filter for gooey effect
  const SvgFilter = () => (
    <div className="hidden">
      <svg>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );

  return (
    <div
      ref={menuRef}
      className={cn('fixed z-50', positionClass, className)}
      style={{
        filter: isOpen ? 'url(#gooey)' : 'none',
      }}
    >
      <SvgFilter />

      {/* Main button */}
      <motion.button
        className={cn(
          'rounded-full flex items-center justify-center cursor-pointer z-10',
          buttonSize,
          variantClasses
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {mainIcon}
      </motion.button>

      {/* Menu items */}
      <AnimatePresence>
        {isOpen &&
          items.map((item, i) => {
            const position = getItemPositions(i, items.length);

            return (
              <motion.div
                key={i}
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  x: position.x,
                  y: position.y,
                  scale: 1,
                }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="relative"
                    onClick={e => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                  >
                    <motion.div
                      className={cn(
                        'rounded-full flex items-center justify-center cursor-pointer',
                        itemSize,
                        variantClasses,
                        item.color
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.icon}
                    </motion.div>
                    {tooltip && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </a>
                ) : (
                  <div className="relative group">
                    <motion.button
                      className={cn(
                        'rounded-full flex items-center justify-center cursor-pointer',
                        itemSize,
                        variantClasses,
                        item.color
                      )}
                      onClick={item.onClick}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.icon}
                    </motion.button>
                    {tooltip && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
