// @ts-nocheck
// Split this file into two parts:
// 1. page.tsx - Server component with metadata
// 2. client-signup.tsx - Client component with useSearchParams

import { Metadata } from 'next';
import ClientSignup from './client-signup';

export const metadata: Metadata = {
  title: 'Sign Up - TradesXBT',
  description: 'Create a new TradesXBT account',
};

export default function SignUpPage() {
  return <ClientSignup />;
}
