import './globals.css';
import './hd-enhancement.css'; // HD UI enhancements for better contrast and sharpness
import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { WalletContextProvider } from '@/context/WalletContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: 'TradesXBT - AI Powered Solana Trading',
  description: 'AI-powered trading analytics and signals for the Solana ecosystem',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${rajdhani.variable} font-sans bg-sapphire-900 min-h-screen`}
      >
        <ClerkProvider>
          <WalletContextProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
              <footer className="py-8 border-t border-emerald-400/10">
                <div className="container mx-auto px-4">
                  <div className="text-center text-emerald-400/40 text-sm">
                    &copy; {new Date().getFullYear()} TradesXBT - AI-Powered Trading Analytics for
                    Solana
                  </div>
                </div>
              </footer>
            </div>
          </WalletContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
