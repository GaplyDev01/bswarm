// @ts-nocheck
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: 'default' | 'gradient' | 'neon';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn('relative h-2 w-full grow overflow-hidden rounded-full bg-gray-800/50', {
        'bg-gray-800/50': variant === 'default',
        'bg-gradient-to-r from-purple-900/50 to-blue-900/50': variant === 'gradient',
        'bg-black border border-[#00FF80]/20': variant === 'neon',
      })}
    >
      <SliderPrimitive.Range
        className={cn('absolute h-full', {
          'bg-primary': variant === 'default',
          'bg-gradient-to-r from-purple-600 to-blue-600': variant === 'gradient',
          'bg-[#00FF80] shadow-[0_0_10px_rgba(0,255,128,0.5)]': variant === 'neon',
        })}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'border-2 border-primary bg-background': variant === 'default',
          'border-2 border-blue-500 bg-white shadow-[0_0_8px_rgba(59,130,246,0.5)]':
            variant === 'gradient',
          'bg-white border-2 border-[#00FF80] shadow-[0_0_8px_rgba(0,255,128,0.5)]':
            variant === 'neon',
        }
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
