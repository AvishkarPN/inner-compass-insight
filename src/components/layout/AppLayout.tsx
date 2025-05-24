
import React, { ReactNode } from 'react';
import { Calendar, Home, LineChart, Clock, PaintBrush } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <header className="border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Mood Journal</h1>
          </div>
          
          <nav>
            <ul className="flex gap-2 md:gap-6">
              <li>
                <Link 
                  to="/" 
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10",
                    location.pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Home size={16} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/insights" 
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10",
                    location.pathname === "/insights" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <LineChart size={16} />
                  <span className="hidden md:inline">Insights</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10",
                    location.pathname === "/history" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Clock size={16} />
                  <span className="hidden md:inline">History</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/mood-art" 
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10",
                    location.pathname === "/mood-art" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <PaintBrush size={16} />
                  <span className="hidden md:inline">Mood Art</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-6 px-4 md:px-6">
        {children}
      </main>
      
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mood Journal - Track your emotional well-being
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
