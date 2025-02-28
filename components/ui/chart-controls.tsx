// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  CandlestickChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  Grid3X3,
  Pencil,
  Eraser,
  Eye,
  EyeOff,
  Plus,
  Minus,
  PanelRight,
  Share2,
  Download,
  RefreshCw,
  PlusSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ChartControlsProps {
  className?: string;
  onChartTypeChange?: (type: 'line' | 'candle' | 'bar' | 'area') => void;
  onTimeframeChange?: (timeframe: string) => void;
  onIndicatorAdd?: (indicator: string) => void;
  variant?: 'neon' | 'glass' | 'minimal';
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

export default function ChartControls({
  className,
  onChartTypeChange,
  onTimeframeChange,
  onIndicatorAdd,
  variant = 'neon',
  position = 'top',
  orientation = 'horizontal',
}: ChartControlsProps) {
// @ts-ignore
  const [chartType, setChartType] = useState<'line' | 'candle'> | 'bar' | ('area' > 'candle');
  const [timeframe, setTimeframe] = useState('1D');
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);

  const timeframes = ['5m', '15m', '1H', '4H', '1D', '1W', '1M'];

  const indicators = [
    'RSI',
    'MACD',
    'Bollinger Bands',
    'EMA',
    'SMA',
    'Stochastic',
    'Volume Profile',
    'Fibonacci',
    'Ichimoku',
    'ATR',
  ];

  const drawingTools = [
    { name: 'Trend Line', icon: <TrendingUp size={16} /> },
    { name: 'Horizontal Line', icon: <Activity size={16} /> },
    { name: 'Fibonacci', icon: <Grid3X3 size={16} /> },
    { name: 'Text', icon: <Pencil size={16} /> },
    { name: 'Erase', icon: <Eraser size={16} /> },
  ];

  // Handle chart type change
  const handleChartTypeChange = (type: 'line' | 'candle' | 'bar' | 'area') => {
    setChartType(type);
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  // Handle indicator add
  const handleIndicatorAdd = (indicator: string) => {
    if (onIndicatorAdd) {
      onIndicatorAdd(indicator);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    // Implement fullscreen logic here
  };

  // Variant styles
  const variantStyles = {
    neon: 'bg-black/80 border border-[#00FF80]/30 shadow-[0_0_15px_rgba(0,255,128,0.1)]',
    glass: 'bg-black/30 backdrop-blur-xl border border-white/10',
    minimal: 'bg-transparent border-none shadow-none',
  };

  // Button styles based on variant
  const buttonVariantStyles = {
    neon: 'bg-black/40 border border-[#00FF80]/20 hover:bg-[#00FF80]/10 text-[#00FF80]',
    glass: 'bg-black/20 border border-white/10 hover:bg-white/5',
    minimal: 'bg-black/10 hover:bg-black/20 border-none',
  };

  // Button active styles
  const buttonActiveStyles = {
    neon: 'bg-[#00FF80]/20 border-[#00FF80]/30 text-[#00FF80]',
    glass: 'bg-white/10 border-white/20 text-white',
    minimal: 'bg-black/30 text-white',
  };

  // Position classes
  const containerClasses = {
    top: 'top-2 left-2 right-2',
    bottom: 'bottom-2 left-2 right-2',
    left: 'left-2 top-2 bottom-2',
    right: 'right-2 top-2 bottom-2',
  };

  // Orientation classes
  const orientationClasses =
    orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col items-stretch space-y-2';

  return (
    <div
      className={cn(
        'absolute z-10 flex p-2 rounded-md',
        containerClasses[position],
        orientationClasses,
        variantStyles[variant],
        className
      )}
    >
      {/* Chart type selector */}
      <div
        className={cn(
          'flex space-x-1',
          orientation === 'vertical' && 'flex-col space-x-0 space-y-1'
        )}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            chartType === 'candle' && buttonActiveStyles[variant]
          )}
          onClick={() => handleChartTypeChange('candle')}
          title="Candlestick Chart"
        >
          <CandlestickChart size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            chartType === 'line' && buttonActiveStyles[variant]
          )}
          onClick={() => handleChartTypeChange('line')}
          title="Line Chart"
        >
          <LineChart size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            chartType === 'bar' && buttonActiveStyles[variant]
          )}
          onClick={() => handleChartTypeChange('bar')}
          title="Bar Chart"
        >
          <BarChart3 size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            chartType === 'area' && buttonActiveStyles[variant]
          )}
          onClick={() => handleChartTypeChange('area')}
          title="Area Chart"
        >
          <Activity size={16} />
        </Button>
      </div>

      <div
        className={cn(
          'mx-2 h-6',
          orientation === 'vertical'
            ? 'w-full border-t border-white/10 my-1'
            : 'border-l border-white/10'
        )}
      ></div>

      {/* Timeframe selector */}
      <div
        className={cn(
          'flex space-x-1',
          orientation === 'vertical' && 'flex-col space-x-0 space-y-1'
        )}
      >
        {timeframes.map(tf => (
          <Button
            key={tf}
            variant="outline"
            size="sm"
            className={cn(
              'h-8 px-2',
              buttonVariantStyles[variant],
              timeframe === tf && buttonActiveStyles[variant]
            )}
            onClick={() => handleTimeframeChange(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>

      <div
        className={cn(
          'mx-2 h-6',
          orientation === 'vertical'
            ? 'w-full border-t border-white/10 my-1'
            : 'border-l border-white/10'
        )}
      ></div>

      {/* Tool buttons */}
      <div
        className={cn(
          'flex space-x-1',
          orientation === 'vertical' && 'flex-col space-x-0 space-y-1'
        )}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            showIndicators && buttonActiveStyles[variant]
          )}
          onClick={() => setShowIndicators(!showIndicators)}
          title="Indicators"
        >
          <PlusSquare size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'p-1 h-8 w-8',
            buttonVariantStyles[variant],
            showDrawingTools && buttonActiveStyles[variant]
          )}
          onClick={() => setShowDrawingTools(!showDrawingTools)}
          title="Drawing Tools"
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn('p-1 h-8 w-8', buttonVariantStyles[variant])}
          onClick={toggleFullscreen}
          title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn('p-1 h-8 w-8', buttonVariantStyles[variant])}
          title="Save/Export Chart"
        >
          <Download size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn('p-1 h-8 w-8', buttonVariantStyles[variant])}
          title="Share Chart"
        >
          <Share2 size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn('p-1 h-8 w-8', buttonVariantStyles[variant])}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </Button>
      </div>

      {/* Indicators dropdown */}
      <AnimatePresence>
        {showIndicators && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'absolute left-0 top-12 bg-black/90 border border-white/20 rounded-md p-2 shadow-xl',
              orientation === 'vertical' && 'left-full top-0 ml-2'
            )}
          >
            <div className="grid grid-cols-2 gap-1 w-64">
              {indicators.map(indicator => (
                <Button
                  key={indicator}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-sm"
                  onClick={() => handleIndicatorAdd(indicator)}
                >
                  <Plus size={14} className="mr-1" />
                  {indicator}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawing tools dropdown */}
      <AnimatePresence>
        {showDrawingTools && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'absolute left-32 top-12 bg-black/90 border border-white/20 rounded-md p-2 shadow-xl',
              orientation === 'vertical' && 'left-full top-20 ml-2'
            )}
          >
            <div className="flex flex-col space-y-1 w-40">
              {drawingTools.map(tool => (
                <Button key={tool.name} variant="ghost" size="sm" className="justify-start text-sm">
                  <span className="mr-2">{tool.icon}</span>
                  {tool.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
