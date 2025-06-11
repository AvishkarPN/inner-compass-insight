
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
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      
      // If already installed, don't show prompt
      if (isStandaloneMode) {
        localStorage.setItem('pwa-install-dismissed', 'true');
        setShowPrompt(false);
      }
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if not already dismissed and not in standalone mode
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed');
      
      if (!dismissed && !permanentlyDismissed && !isStandalone) {
        console.log('PWA: Showing install prompt');
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Reduced delay for faster testing
      }
    };

    // Clear previous dismissal for testing (remove this in production)
    // localStorage.removeItem('pwa-install-dismissed');
    // localStorage.removeItem('pwa-install-permanently-dismissed');

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari, show install prompt if criteria are met
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed');
    
    if (isIOS && !isInStandaloneMode && !dismissed && !permanentlyDismissed) {
      console.log('PWA: iOS detected, showing install instructions');
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    // For testing purposes, show prompt after 10 seconds if no beforeinstallprompt
    const testTimer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone && !dismissed && !permanentlyDismissed) {
        console.log('PWA: No beforeinstallprompt detected, showing fallback');
        setShowPrompt(true);
      }
    }, 10000);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      localStorage.setItem('pwa-install-dismissed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(testTimer);
    };
  }, [isStandalone, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or browsers that don't support the prompt
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: User choice:', outcome);
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-install-dismissed', 'true');
        setDeferredPrompt(null);
        setShowPrompt(false);
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('PWA: Error during install prompt:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handlePermanentDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-permanently-dismissed', 'true');
  };

  // Don't show if in standalone mode or dismissed
  if (!showPrompt || isStandalone) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-[9998] mx-auto max-w-sm border-primary bg-background shadow-xl md:left-auto md:right-4 md:mx-0 animate-fade-in">
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
      <CardContent className="pt-0 space-y-3">
        {isIOS ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              To install: Tap the Share button in Safari, then "Add to Home Screen"
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDismiss} variant="outline" size="sm" className="flex-1">
                Got it!
              </Button>
              <Button onClick={handlePermanentDismiss} variant="ghost" size="sm" className="text-xs">
                Don't ask again
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Install our app for quick access and a better experience!
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Add to Home Screen
              </Button>
            </div>
            <Button 
              onClick={handlePermanentDismiss} 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
            >
              Don't ask again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
