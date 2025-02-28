'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackNavigationProps {
  /**
   * Override the default back behavior with a specific route
   */
  backTo?: string;

  /**
   * Text to display next to the back arrow
   */
  label?: string;

  /**
   * CSS class to apply to the container
   */
  className?: string;
}

/**
 * A reusable back navigation component that either uses a provided path
 * or intelligently navigates to the parent path
 */
export default function BackNavigation({
  backTo,
  label = 'Back',
  className = 'mb-8',
}: BackNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  // If no explicit back path is provided, determine a sensible default
  const getDefaultBackPath = () => {
    // Split the current path and remove the last segment
    const pathSegments = pathname.split('/').filter(Boolean);

    // Special cases for known routes
    if (pathname.includes('/token-analysis')) {
      return '/platform/dashboard';
    }

    if (pathname.includes('/market-analysis')) {
      return '/platform/dashboard';
    }

    if (pathSegments.length <= 1) {
      // If we're already at a top-level route, go to dashboard
      return '/platform/dashboard';
    }

    // Go up one level
    return '/' + pathSegments.slice(0, -1).join('/');
  };

  const backPath = backTo || getDefaultBackPath();

  return (
    <div className={className}>
      <Link
        href={backPath}
        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-400/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    </div>
  );
}
