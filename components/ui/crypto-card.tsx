// @ts-nocheck
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cryptoCardVariants = cva(
  'rounded-xl relative overflow-hidden backdrop-blur-md transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-black/30 border border-white/10',
        primary: 'bg-indigo-950/30 border border-indigo-400/20',
        success: 'bg-emerald-950/30 border border-emerald-400/20',
        danger: 'bg-rose-950/30 border border-rose-400/20',
        warning: 'bg-amber-950/30 border border-amber-400/20',
        glass: 'bg-white/5 border border-white/10 hover:bg-white/10',
        neon: 'bg-black/40 border border-[#00FF80]/30 shadow-[0_0_15px_rgba(0,255,128,0.15)]',
        glow: 'bg-black/40 border border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.2)]',
        sol: 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20',
      },
      size: {
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-7',
      },
      hover: {
        none: '',
        glow: 'hover:shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:border-[#00E676]/30',
        scale: 'hover:scale-[1.02]',
        both: 'hover:shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:border-[#00E676]/30 hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'none',
    },
  }
);

export interface CryptoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cryptoCardVariants> {
  highlight?: boolean;
  gradientOverlay?: boolean;
  innerGlow?: string;
}

const CryptoCard = React.forwardRef<HTMLDivElement, CryptoCardProps>(
  (
    { className, variant, size, hover, highlight, gradientOverlay, innerGlow, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          cryptoCardVariants({ variant, size, hover }),
          highlight && 'ring-1 ring-offset-2 ring-white/20',
          className
        )}
        {...props}
      >
        {gradientOverlay && (
          <>
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full -mr-20 -mt-20 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full -ml-20 -mb-20 z-0"></div>
          </>
        )}

        {innerGlow && (
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              background: `radial-gradient(circle at center, ${innerGlow} 0%, transparent 70%)`,
            }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
CryptoCard.displayName = 'CryptoCard';

// Card Header component
const CryptoCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between mb-4', className)} {...props} />
  )
);
CryptoCardHeader.displayName = 'CryptoCardHeader';

// Card Title component
const CryptoCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-medium tracking-tight text-white', className)}
    {...props}
  />
));
CryptoCardTitle.displayName = 'CryptoCardTitle';

// Card Content component
const CryptoCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
CryptoCardContent.displayName = 'CryptoCardContent';

// Card Footer component
const CryptoCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between mt-4 pt-4 border-t border-white/10',
        className
      )}
      {...props}
    />
  )
);
CryptoCardFooter.displayName = 'CryptoCardFooter';

export { CryptoCard, CryptoCardHeader, CryptoCardTitle, CryptoCardContent, CryptoCardFooter };
