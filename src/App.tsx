
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MoodProvider } from "./contexts/MoodContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Achievements from "./pages/Achievements";
import MoodArt from "./pages/MoodArt";
import Wellness from "./pages/Wellness";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <MoodProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
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
);

export default App;
