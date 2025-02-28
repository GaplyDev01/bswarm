// @ts-nocheck
'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';

export default function ClientSignup() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  logger.log('Signup page loaded with redirect to:', redirectUrl);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-sapphire-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-cyber tracking-wider text-emerald-400">TradesXBT</h1>
          <p className="text-emerald-400/70 mt-2">AI-powered Solana trading</p>
        </div>

        <div className="bg-sapphire-800/90 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-emerald-400/20">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  'bg-emerald-400 hover:bg-emerald-500 text-sapphire-900 font-cyber uppercase tracking-wide',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-emerald-400 text-xl',
                headerSubtitle: 'text-emerald-400/70',
                formFieldLabel: 'text-emerald-400',
                formFieldInput: 'bg-sapphire-900/50 border-emerald-400/30 text-emerald-400',
                footerActionLink: 'text-emerald-400 hover:text-emerald-300',
                identityPreviewText: 'text-emerald-400',
                formFieldInputShowPasswordButton: 'text-emerald-400/70',
              },
            }}
            signInUrl="/login"
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </div>
  );
}
