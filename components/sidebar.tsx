'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Home, LineChart, MessageSquare, Briefcase, DollarSign, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';

const menuItems = [
  { href: APP_ROUTES.DASHBOARD, icon: Home, label: 'Dashboard' },
  { href: APP_ROUTES.TOKEN_ANALYSIS, icon: LineChart, label: 'Token Analysis' },
  { href: APP_ROUTES.CHAT, icon: MessageSquare, label: 'Chat with AI' },
  { href: APP_ROUTES.PORTFOLIO, icon: Briefcase, label: 'Portfolio' },
  { href: APP_ROUTES.INVESTMENT, icon: DollarSign, label: 'Investment' },
  { href: APP_ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render the sidebar on the landing page
  if (pathname === '/') {
    return null;
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isOpen && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#0A1116] border-r border-[#1E2329] transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : isCompact ? 'w-16' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            {!isCompact && <span className="text-2xl font-bold text-[#00E676]">Blockswarms</span>}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2 flex-grow">
            {menuItems.map(item => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                pathname={pathname}
                isCompact={isCompact}
                onClick={() => handleNavigation(item.href)}
              />
            ))}
          </nav>

          <div className="mt-auto hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={toggleCompact}
            >
              {isCompact ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  isCompact: boolean;
  onClick: () => void;
}

function NavItem({ href, icon: Icon, label, pathname, isCompact, onClick }: NavItemProps) {
  const isActive = pathname === href;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
        isActive
          ? 'text-[#00E676] bg-[#1E2329]'
          : 'text-gray-400 hover:text-[#00E676] hover:bg-[#1E2329]/50'
      } ${isCompact ? 'justify-center' : ''}`}
    >
      <div className={`relative ${isCompact ? 'w-8 h-8' : 'w-6 h-6'}`}>
        <div
          className={`absolute inset-0 bg-[#00E676] rounded-full opacity-20 ${isActive ? 'animate-pulse' : ''}`}
        ></div>
        <Icon
          size={isCompact ? 24 : 20}
          className={`relative z-10 ${isActive ? 'text-[#00E676]' : 'text-gray-400'}`}
        />
      </div>
      {!isCompact && <span className="text-sm">{label}</span>}
    </button>
  );
}
