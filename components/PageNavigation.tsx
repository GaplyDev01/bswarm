// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageNavigationProps {
  backPath?: string;
  showHome?: boolean;
  showDashboard?: boolean;
  className?: string;
}

/**
 * Reusable navigation component to provide consistent back/home buttons across all pages
 */
export default function PageNavigation({
  backPath,
  showHome = true,
  showDashboard = true,
  className = '',
}: PageNavigationProps) {
  const pathname = usePathname();

  // If no backPath is provided, determine sensible default
  const getDefaultBackPath = () => {
    if (pathname.includes('/token-analysis')) return '/markets';
    if (pathname.includes('/signals')) return '/dashboard';
    if (pathname.includes('/ai-chat')) return '/dashboard';
    if (pathname.includes('/wallet')) return '/dashboard';
    if (pathname.includes('/trading')) return '/markets';

    return '/';
  };

  const actualBackPath = backPath || getDefaultBackPath();

  return (
    <div className={`flex items-center space-x-2 mb-4 ${className}`}>
      <Link href={actualBackPath} passHref>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </Link>

      {showHome && (
        <Link href="/" passHref>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Home className="mr-1 h-4 w-4" />
            Home
          </Button>
        </Link>
      )}

      {showDashboard && pathname !== '/dashboard' && (
        <Link href="/dashboard" passHref>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <LayoutDashboard className="mr-1 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
