// @ts-nocheck
'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinModal({ isOpen, onClose }: JoinModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-sapphire-900 border border-emerald-400/20 p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-emerald-400/60 hover:text-emerald-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <Dialog.Title as="h3" className="text-2xl font-cyber text-emerald-400 mb-6">
                  JOIN THE SWARM
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-emerald-400/80 mb-6">
                    Enter your details to join the exclusive trading community and get early access
                    to all features.
                  </p>
                  <form className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-emerald-400/80 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="bg-sapphire-800/50 border border-emerald-400/20 focus:border-emerald-400 text-emerald-400 placeholder-emerald-400/40 w-full p-2.5 outline-none transition-colors"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="walletType"
                        className="block text-sm font-medium text-emerald-400/80 mb-1"
                      >
                        Preferred Wallet
                      </label>
                      <select
                        id="walletType"
                        name="walletType"
                        className="bg-sapphire-800/50 border border-emerald-400/20 focus:border-emerald-400 text-emerald-400 placeholder-emerald-400/40 w-full p-2.5 outline-none transition-colors"
                      >
                        <option value="solana">Solana (Phantom, Solflare)</option>
                        <option value="ethereum">Ethereum (Metamask)</option>
                        <option value="bitcoin">Bitcoin</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="tradingExperience"
                        className="block text-sm font-medium text-emerald-400/80 mb-1"
                      >
                        Trading Experience
                      </label>
                      <select
                        id="tradingExperience"
                        name="tradingExperience"
                        className="bg-sapphire-800/50 border border-emerald-400/20 focus:border-emerald-400 text-emerald-400 placeholder-emerald-400/40 w-full p-2.5 outline-none transition-colors"
                      >
                        <option value="beginner">Beginner (0-1 years)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="advanced">Advanced (3+ years)</option>
                        <option value="degen">Full Degen</option>
                      </select>
                    </div>
                    <div className="flex items-start mt-6">
                      <div className="flex items-center h-5">
                        <input
                          id="newsletter"
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-400 bg-sapphire-800/50 border border-emerald-400/20"
                          defaultChecked
                        />
                      </div>
                      <label htmlFor="newsletter" className="ml-2 text-sm text-emerald-400/60">
                        Receive trading signals and market updates
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-6 bg-emerald-400 text-sapphire-900 hover:bg-emerald-500 py-3 text-base font-cyber uppercase tracking-wider transition-colors"
                    >
                      Submit
                    </button>
                  </form>
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-400/10 text-center text-xs text-emerald-400/40">
                  By joining, you agree to our Terms of Service and Privacy Policy
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
