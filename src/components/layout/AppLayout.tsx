
import React, { ReactNode } from 'react';
import { Calendar, CalendarDays, Home, LineChart, Clock, Paintbrush, Heart, User, Trophy, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import { useTheme } from 'next-themes';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/',             icon: Home,        label: 'Dashboard',    shortLabel: 'Dashboard' },
  { to: '/insights',     icon: LineChart,   label: 'Insights',     shortLabel: 'Insights' },
  { to: '/wellness',     icon: Heart,       label: 'Wellness',     shortLabel: 'Wellness' },
  { to: '/history',      icon: Clock,       label: 'History',      shortLabel: 'History' },
  { to: '/calendar',     icon: CalendarDays,label: 'Calendar',     shortLabel: 'Calendar' },
  { to: '/mood-art',     icon: Paintbrush,  label: 'Mood Canvas',  shortLabel: 'Canvas' },
  // #29: Achievements now linked from nav instead of orphan route
  { to: '/achievements', icon: Trophy,      label: 'Achievements', shortLabel: undefined },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  // #23: Dark mode toggle via next-themes
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-950">
      <header className="border-b bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm shadow-sm sticky top-0 z-50" role="banner">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full" aria-hidden="true">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-semibold">Mind Garden</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="overflow-x-auto" role="navigation" aria-label="Main navigation">
              <ul className="flex gap-0.5 sm:gap-1 md:gap-2">
                {navItems.map(({ to, icon: Icon, label, shortLabel }) => {
                  const isActive = to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to);

                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={cn(
                          'flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors',
                          'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                        {shortLabel === undefined ? (
                          // Achievements always hidden on mobile (fits next to other icons)
                          <span className="hidden lg:inline">{label}</span>
                        ) : (
                          <>
                            <span className="hidden sm:inline md:hidden">{shortLabel}</span>
                            <span className="hidden md:inline">{label}</span>
                          </>
                        )}
                        <span className="sr-only">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* #23: Dark mode toggle button */}
            <Button
              variant="ghost"
              size="sm"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 p-0"
            >
              {theme === 'dark'
                ? <Sun size={15} aria-hidden="true" />
                : <Moon size={15} aria-hidden="true" />
              }
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 focus-visible:ring-2 focus-visible:ring-ring" aria-label="User menu">
                  <User size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover">
                <UserProfile />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 sm:py-6 px-3 sm:px-4 md:px-6" role="main">
        {children}
      </main>

      <footer className="border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm py-3 sm:py-4" role="contentinfo">
        <div className="container text-center text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 md:px-6">
          © {new Date().getFullYear()} Mind Garden — Track your emotional well-being
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
