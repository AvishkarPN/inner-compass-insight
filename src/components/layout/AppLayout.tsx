
import React, { ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
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
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  History
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
