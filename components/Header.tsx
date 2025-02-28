'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';

export default function Header() {
  const { isLoaded } = useAuth();

  return (
    <header className="bg-sapphire-900 border-b border-emerald-400/20 backdrop-blur-md relative z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-transparent opacity-30"></div>
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-emerald-400 font-cyber font-bold text-2xl tracking-wider"
            >
              TradesXBT
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className="text-emerald-400/80 hover:text-emerald-400 transition font-cyber uppercase tracking-wide text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/markets"
                className="text-emerald-400/80 hover:text-emerald-400 transition font-cyber uppercase tracking-wide text-sm"
              >
                Markets
              </Link>
              <Link
                href="/trading"
                className="text-emerald-400/80 hover:text-emerald-400 transition font-cyber uppercase tracking-wide text-sm"
              >
                Trading
              </Link>
              <Link
                href="/ai-chat"
                className="text-emerald-400/80 hover:text-emerald-400 transition font-cyber uppercase tracking-wide text-sm"
              >
                AI Chat
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isLoaded ? (
              <>
                <SignedIn>
                  {/* User is signed in, show user button */}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                        userButtonTrigger:
                          'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-sapphire-900',
                        userButtonPopoverCard:
                          'bg-sapphire-800 border border-emerald-400/20 text-emerald-400 shadow-xl',
                        userButtonPopoverActionButton:
                          'text-emerald-400/80 hover:text-emerald-400 hover:bg-sapphire-900',
                        userButtonPopoverActionButtonText: 'text-current',
                        userButtonPopoverFooter: 'border-t border-emerald-400/20',
                      },
                    }}
                  />
                </SignedIn>

                <SignedOut>
                  {/* User is not signed in, show sign in and sign up buttons */}
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm text-emerald-400/80 hover:text-emerald-400 transition font-cyber uppercase"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm bg-emerald-400 hover:bg-emerald-500 text-sapphire-900 font-cyber uppercase tracking-wider transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                </SignedOut>
              </>
            ) : (
              // Show placeholder when Clerk hasn't loaded yet
              <div className="flex items-center space-x-3">
                <div className="h-8 w-20 bg-emerald-400/10 animate-pulse"></div>
                <div className="h-8 w-20 bg-emerald-400/30 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
