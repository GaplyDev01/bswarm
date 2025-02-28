'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (for demo purposes)
    const walletConnected = localStorage.getItem('walletConnected');
    if (!walletConnected) {
      router.push('/login');
    }
  }, [router]);

  return <AppShell>{children}</AppShell>;
}
