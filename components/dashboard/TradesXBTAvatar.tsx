import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TradesXBTAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  withBorder?: boolean;
}

export const TradesXBTAvatar: React.FC<TradesXBTAvatarProps> = ({
  size = 'md',
  withBorder = true,
}) => {
  // Determine size class
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size];

  // Border style for the avatar
  const borderStyle = withBorder ? 'border-2 border-emerald-400/30' : '';

  // Glow effect
  const glowEffect = withBorder ? 'shadow-md shadow-emerald-400/20' : '';

  return (
    <Avatar
      className={`${sizeClass} ${borderStyle} ${glowEffect} bg-black relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-emerald-900/50" />

      <AvatarFallback className="text-emerald-400 font-bold bg-transparent z-10 text-xs sm:text-sm">
        XBT
      </AvatarFallback>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
    </Avatar>
  );
};

export default TradesXBTAvatar;
