// @ts-nocheck
import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  borderColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor, borderColor, intensity = 'medium', children, ...props }, ref) => {
    const getGlowStyles = () => {
      const intensityValues = {
        low: { opacity: 0.1, blur: '10px' },
        medium: { opacity: 0.2, blur: '15px' },
        high: { opacity: 0.3, blur: '20px' },
      };

      const { opacity, blur } = intensityValues[intensity];

      if (!glowColor) return {};

      return {
        boxShadow: `0 0 ${blur} ${glowColor}`,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      };
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl bg-black/30 backdrop-blur-md p-6', className)}
        style={getGlowStyles()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
