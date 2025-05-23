
import React, { ReactNode } from 'react';
import { Calendar, Home, LineChart, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Mood Tracker</h1>
          </div>
          
          <nav>
            <ul className="flex gap-4">
              <li>
                <Link 
                  to="/" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/" && "text-primary"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <Home size={16} />
                    <span>Dashboard</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/insights" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/insights" && "text-primary"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <LineChart size={16} />
                    <span>Insights</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/history" && "text-primary"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>History</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-6">
        {children}
      </main>
      
      <footer className="border-t bg-white dark:bg-gray-900 py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mood Tracker App
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
