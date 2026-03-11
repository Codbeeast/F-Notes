'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  BarChart3,
  NotebookPen,
  Banknote,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  Medal,
  Brain,
  X,
  BotMessageSquare,
  Beaker,
} from 'lucide-react';

// --- Navigation Items Configuration ---
const navigationItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/leaderboard', icon: Medal, label: 'Leaderboard' },
  { href: '/psychology', icon: Brain, label: 'Psychology' },
  { href: '/tradeJournal', icon: NotebookPen, label: 'Journal' },
  { href: '/tradeAssistant', icon: BotMessageSquare, label: 'FoNo' },
  { href: '/backtest', icon: Beaker, label: 'Backtest' },
  { href: '/strategy', icon: Banknote, label: 'Strategy' },
  { href: '/profile', icon: User, label: 'Profile' },
];

// --- Main Sidebar Component ---
const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // --- Responsive Handling ---
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // --- Subscription State ---
  const [subscription, setSubscription] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };
    fetchSubscription();
  }, [user]);

  // --- Toggle Handlers ---
  const handleToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      onToggle?.(newCollapsedState);
    }
  };

  // --- Reusable Sidebar Content ---
  const SidebarContent = ({ isMobileView = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center border-b border-white/10 transition-all duration-300 ${isCollapsed && !isMobileView ? 'justify-center h-[73px]' : 'p-6'}`}>
        {!isMobileView && (
          <button
            onClick={handleToggle}
            className="absolute -right-4 top-8 p-1.5 rounded-full bg-black border border-gray-700 text-gray-400 hover:bg-gray-900 hover:text-white transition-all z-10"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <Image
            src={isCollapsed && !isMobileView ? "/logo.png" : "/forenotes.png"}
            alt="Forenotes Logo"
            width={isCollapsed && !isMobileView ? 32 : 200}
            height={isCollapsed && !isMobileView ? 32 : 200}
            className={isCollapsed && !isMobileView ? "h-14 w-auto max-w-10 flex-shrink-0 object-contain" : "h-14 w-auto flex-shrink-0"}
          />
          <div className={`transition-all duration-200 ease-in-out overflow-hidden ${isCollapsed && !isMobileView ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>

          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="px-4">
              <Link href={item.href} onClick={isMobileView ? handleToggle : undefined}>
                <div
                  className={`group relative flex items-center h-12 rounded-lg text-gray-300 transition-all duration-300 overflow-hidden
                    ${isCollapsed && !isMobileView ? 'justify-center w-12' : 'px-4'}
                    ${isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                  <div className={`absolute left-0 h-6 w-1 bg-white rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>

                  <Icon className={`relative z-10 transition-transform duration-300 h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-4'}`} />
                  <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>

                  {isCollapsed && !isMobileView && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-black text-sm text-white rounded-md shadow-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-white/10 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {subscription && subscription.hasAccess ? (
          subscription.isInTrial ? (
            // Trial user display
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 text-center border border-blue-500/30">
              <Sparkles className="mx-auto h-6 w-6 text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-white">Free Trial Active</p>
              <p className="text-xs text-gray-400 mt-1">
                {subscription.daysRemaining} {subscription.daysRemaining === 1 ? 'day' : 'days'} remaining
              </p>
              <p className="text-xs text-blue-400 mt-2 uppercase tracking-wider">
                {subscription.planType?.replace(/_/g, ' ') || 'Trial Plan'}
              </p>
            </div>
          ) : subscription.planType ? (
            // Paid user display
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
              <Medal className="mx-auto h-6 w-6 text-yellow-400 mb-2" />
              <p className="text-sm font-semibold text-white">Current Plan</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{subscription.planType.replace(/_/g, ' ')}</p>
            </div>
          ) : null
        ) : (
          // No subscription - upgrade prompt
          <Link href="/subscription">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 rounded-lg p-4 text-center border border-blue-500/30 cursor-pointer transition-colors group">
              <Sparkles className="mx-auto h-6 w-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
              <p className="text-xs text-gray-400 mt-1">Unlock AI features</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  // --- Render Logic ---
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-black backdrop-blur-lg border-b border-white/10 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/forenotes.png"
              alt="Forenotes Logo"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <button onClick={handleToggle} className="p-2 text-gray-300 hover:text-white">
            <Menu size={24} />
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleToggle}
        ></div>

        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-black backdrop-blur-xl border-l border-white/10 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <SidebarContent isMobileView={true} />
        </div>
      </>
    );
  }

  // --- Desktop Sidebar ---
  return (
    <aside className={`fixed top-0 left-0 h-full z-30 bg-black backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;