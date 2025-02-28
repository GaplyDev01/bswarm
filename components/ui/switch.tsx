import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: 'default' | 'neon' | 'gradient';
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const getThumbClass = () => {
      if (variant === 'neon') {
        return 'data-[state=checked]:bg-[#00FF80] data-[state=checked]:shadow-[0_0_8px_rgba(0,255,128,0.8)]';
      }
      if (variant === 'gradient') {
        return 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600 data-[state=checked]:shadow-[0_0_8px_rgba(124,58,237,0.5)]';
      }
      return 'data-[state=checked]:bg-primary';
    };

    const getTrackClass = () => {
      if (variant === 'neon') {
        return 'bg-black border border-gray-800 data-[state=checked]:border-[#00FF80]/30 data-[state=checked]:bg-[#00FF80]/10';
      }
      if (variant === 'gradient') {
        return 'bg-black border border-gray-800 data-[state=checked]:border-purple-500/30 data-[state=checked]:bg-purple-800/20';
      }
      return 'bg-input';
    };

    return (
      <SwitchPrimitives.Root
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          getTrackClass(),
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
            getThumbClass()
          )}
        />
      </SwitchPrimitives.Root>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
