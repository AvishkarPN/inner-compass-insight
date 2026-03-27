
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { MoodProvider } from "./contexts/MoodContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Achievements from "./pages/Achievements";
import MoodArt from "./pages/MoodArt";
import Wellness from "./pages/Wellness";
import CalendarPage from "./pages/Calendar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import DailyReminderNotification from "./components/DailyReminderNotification";
import WalkthroughOverlay from "./components/WalkthroughOverlay";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <MoodProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PWAInstallPrompt />
              <DailyReminderNotification />
              <WalkthroughOverlay />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/wellness" element={<Wellness />} />
                      <Route path="/mood-art" element={<MoodArt />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                } />
              </Routes>
            </TooltipProvider>
          </MoodProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
