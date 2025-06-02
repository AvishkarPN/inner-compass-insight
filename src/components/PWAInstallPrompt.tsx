
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone === true ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed before and reduce frequency
      const lastDismissed = localStorage.getItem('pwa-install-last-dismissed');
      const now = Date.now();
      const daysSinceLastDismiss = lastDismissed ? 
        Math.floor((now - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)) : 999;
      
      // Only show if not recently dismissed (wait 7 days) and not in standalone mode
      if (daysSinceLastDismiss >= 7 && !isStandalone) {
        // Delay showing the prompt to reduce frequency
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds instead of 3
      }
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari, show install prompt less frequently
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    const lastDismissed = localStorage.getItem('pwa-install-last-dismissed');
    const now = Date.now();
    const daysSinceLastDismiss = lastDismissed ? 
      Math.floor((now - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)) : 999;
    
    if (isIOS && !isInStandaloneMode && daysSinceLastDismiss >= 7) {
      // Show iOS-specific install instructions after a longer delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 15000); // Show after 15 seconds for iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or browsers that don't support the prompt
      setShowPrompt(false);
      localStorage.setItem('pwa-install-last-dismissed', Date.now().toString());
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      } else {
        localStorage.setItem('pwa-install-last-dismissed', Date.now().toString());
      }
    } catch (error) {
      console.error('Error during install prompt:', error);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-last-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-last-dismissed', Date.now().toString());
  };

  // Don't show if in standalone mode or if dismissed recently
  if (!showPrompt || isStandalone) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm border-primary bg-background shadow-lg md:left-auto md:right-4 md:mx-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Install Mood Journal</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              To install: Tap the Share button in Safari, then "Add to Home Screen"
            </p>
            <Button onClick={handleDismiss} className="w-full" size="sm">
              Got it!
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Install our app for quick access and a better experience!
            </p>
            <Button onClick={handleInstallClick} className="w-full" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Add to Home Screen
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
