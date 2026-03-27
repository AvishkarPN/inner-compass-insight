import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, LineChart, Heart, Paintbrush, ArrowRight, Check } from 'lucide-react';

const WALKTROUGH_KEY = 'hasSeenWalkthrough';

const STEPS = [
  {
    icon: <Home className="w-10 h-10 text-primary mb-4 mx-auto" />,
    title: 'Welcome to Mind Garden',
    desc: 'Log your feelings daily to watch your companion plant grow in your customisable garden. Consistency is key!',
  },
  {
    icon: <LineChart className="w-10 h-10 text-blue-500 mb-4 mx-auto" />,
    title: 'AI Insights & Analytics',
    desc: 'Track your patterns over time and get a personalized weekly summary of your emotional well-being without any data leaving your browser.',
  },
  {
    icon: <Heart className="w-10 h-10 text-rose-500 mb-4 mx-auto" />,
    title: 'Wellness & Mindfulness',
    desc: 'Take a moment for yourself with guided meditations tailored to your mood, breathing exercises, and a gratitude journal.',
  },
  {
    icon: <Paintbrush className="w-10 h-10 text-fuchsia-500 mb-4 mx-auto" />,
    title: 'Generative Mood Art',
    desc: 'Watch your daily check-ins transform into beautiful, shareable artwork based on your emotional palette.',
  },
];

export default function WalkthroughOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem(WALKTROUGH_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem(WALKTROUGH_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const stepInfo = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <CardContent className="pt-8 pb-6 px-6 text-center">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-4 bg-primary' : 'bg-primary/20'
                }`}
              />
            ))}
          </div>

          <div aria-live="polite">
            {stepInfo.icon}
            <h2 className="text-xl font-bold mb-3">{stepInfo.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stepInfo.desc}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
            Skip
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep === STEPS.length - 1 ? (
              <>Let's Go <Check className="w-4 h-4" /></>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
