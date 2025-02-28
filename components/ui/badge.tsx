// @ts-nocheck
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        glow: 'border-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_15px_rgba(124,58,237,0.65)] transition-shadow',
        neon: 'border border-[#00FF80] text-[#00FF80] shadow-[0_0_8px_rgba(0,255,128,0.5)] hover:shadow-[0_0_12px_rgba(0,255,128,0.8)] transition-shadow bg-black',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
        success: 'border-transparent bg-green-500/20 text-green-400 border border-green-500/30',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        danger: 'border-transparent bg-red-500/20 text-red-400 border border-red-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
