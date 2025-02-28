// @ts-nocheck
// Split this file into two:
// 1. page.tsx - Server component with metadata
// 2. client-login.tsx - Client component with useSearchParams

import { Metadata } from 'next';
import ClientLogin from './client-login';

export const metadata: Metadata = {
  title: 'Login - TradesXBT',
  description: 'Log in to your TradesXBT account',
};

export default function LoginPage() {
  return <ClientLogin />;
}
