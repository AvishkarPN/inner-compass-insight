
import React, { ReactNode } from 'react';
import { Calendar, Home, LineChart, Clock, Paintbrush, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <header className="border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold">Mood Journal</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <nav className="overflow-x-auto">
              <ul className="flex gap-0.5 sm:gap-1 md:gap-4">
                <li>
                  <Link 
                    to="/" 
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors hover:bg-primary/10",
                      location.pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Home size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/insights" 
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors hover:bg-primary/10",
                      location.pathname === "/insights" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <LineChart size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Insights</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/wellness" 
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors hover:bg-primary/10",
                      location.pathname === "/wellness" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Heart size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Wellness</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/history" 
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors hover:bg-primary/10",
                      location.pathname === "/history" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Clock size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">History</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/mood-art" 
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors hover:bg-primary/10",
                      location.pathname === "/mood-art" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Paintbrush size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Mood Canvas</span>
                    <span className="hidden sm:inline md:hidden">Canvas</span>
                  </Link>
                </li>
              </ul>
            </nav>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <User size={16} />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <UserProfile />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-4 sm:py-6 px-3 sm:px-4 md:px-6">
        {children}
      </main>
      
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-3 sm:py-4">
        <div className="container text-center text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 md:px-6">
          © {new Date().getFullYear()} Mood Journal - Track your emotional well-being
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
