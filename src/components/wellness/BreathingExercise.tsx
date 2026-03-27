
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

// #14: CSS keyframe animation string for the breathing circle (injected once)
const BREATHING_KEYFRAMES = `
@keyframes breathe-in {
  from { transform: scale(1); }
  to   { transform: scale(1.5); }
}
@keyframes breathe-out {
  from { transform: scale(1.5); }
  to   { transform: scale(0.75); }
}
@keyframes breathe-hold {
  from { transform: scale(1.5); }
  to   { transform: scale(1.5); }
}
@keyframes breathe-pause {
  from { transform: scale(0.75); }
  to   { transform: scale(0.75); }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('breathing-keyframes')) {
  const style = document.createElement('style');
  style.id = 'breathing-keyframes';
  style.textContent = BREATHING_KEYFRAMES;
  document.head.appendChild(style);
}

const phaseAnimations: Record<string, string> = {
  inhale: 'breathe-in',
  hold:   'breathe-hold',
  exhale: 'breathe-out',
  pause:  'breathe-pause',
};

const phaseColors: Record<string, string> = {
  inhale: '#bfdbfe', // blue-200
  hold:   '#e9d5ff', // purple-200
  exhale: '#bbf7d0', // green-200
  pause:  '#e5e7eb', // gray-200
};

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState('478');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([30]);
  const [showSettings, setShowSettings] = useState(false);

  // #26: Single AudioContext created once on mount, reused across all phases
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (AC && !audioCtxRef.current) {
      audioCtxRef.current = new AC();
    }
    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  const breathingPatterns = {
    '478': {
      name: '4-7-8 Relaxation',
      phases: { inhale: 4, hold: 7, exhale: 8, pause: 2 },
      description: 'Promotes relaxation and sleep'
    },
    '444': {
      name: 'Box Breathing',
      phases: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      description: 'Balances the nervous system'
    },
    '646': {
      name: '6-4-6 Calming',
      phases: { inhale: 6, hold: 4, exhale: 6, pause: 2 },
      description: 'Reduces anxiety and stress'
    },
    'wimhof': {
      name: 'Wim Hof Method',
      phases: { inhale: 2, hold: 1, exhale: 2, pause: 1 },
      description: 'Rapid energising breath — 30 fast cycles then hold'
    }
  };

  const currentPattern = breathingPatterns[breathingPattern as keyof typeof breathingPatterns];
  const currentPhase = currentPattern.phases[phase];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev >= currentPhase) {
            const phaseOrder: (keyof typeof currentPattern.phases)[] = ['inhale', 'hold', 'exhale', 'pause'];
            const currentIndex = phaseOrder.indexOf(phase);
            const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

            if (nextPhase === 'inhale') {
              setCycleCount(c => c + 1);
            }

            setPhase(nextPhase);

            // #26: Play using the shared audioCtxRef
            if (soundEnabled && (nextPhase === 'inhale' || nextPhase === 'exhale')) {
              playBreathingSound(nextPhase);
            }

            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, currentPhase, soundEnabled]);

  // #26: reuse single AudioContext
  const playBreathingSound = useCallback((breathPhase: 'inhale' | 'exhale') => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(breathPhase === 'inhale' ? 220 : 180, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(soundVolume[0] / 1000, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }, [soundVolume]);

  const handleStartPause = () => {
    // Resume suspended AudioContext on first user gesture
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setPhaseTimer(0);
  };

  const progress = (phaseTimer / currentPhase) * 100;
  const animDuration = currentPhase;

  // #10: respect prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const circleStyle: React.CSSProperties = prefersReduced
    ? { backgroundColor: phaseColors[phase], transform: 'scale(1)' }
    : {
        backgroundColor: phaseColors[phase],
        animation: `${phaseAnimations[phase]} ${animDuration}s ease-in-out forwards`,
      };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" aria-hidden="true" />
            {currentPattern.name}
          </CardTitle>
          {/* #32: descriptive aria-label */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            aria-label={showSettings ? 'Hide breathing settings' : 'Show breathing settings'}
            aria-expanded={showSettings}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{currentPattern.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h4 className="font-medium">Breathing Pattern</h4>
            <div className="grid gap-2">
              {Object.entries(breathingPatterns).map(([key, pattern]) => (
                <Button
                  key={key}
                  variant={breathingPattern === key ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start h-auto py-3"
                  onClick={() => { setBreathingPattern(key); handleReset(); }}
                  aria-pressed={breathingPattern === key}
                >
                  <div className="text-left">
                    <div className="font-medium">{pattern.name}</div>
                    <div className="text-xs opacity-70">{pattern.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Breathing Sounds</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  aria-label={soundEnabled ? 'Mute breathing sounds' : 'Enable breathing sounds'}
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>

              {soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Volume</span>
                    <span>{soundVolume[0]}%</span>
                  </div>
                  <Slider
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    max={100}
                    step={5}
                    className="w-full"
                    aria-label="Breathing sound volume"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cycle Counter */}
        <div className="text-center space-y-2 mb-4">
          <div className="text-lg font-medium" aria-live="polite" aria-atomic="true">
            Cycle {cycleCount + 1}
          </div>
          <div className="text-sm text-muted-foreground">
            Complete 4–8 cycles for best results
          </div>
        </div>

        {/* Breathing Circle — #14: CSS keyframe animation instead of scale classes */}
        <div className="flex flex-col items-center justify-center min-h-[250px] md:min-h-[350px] space-y-8 my-4">
          <div
            role="status"
            aria-live="polite"
            aria-label={`${phase} — ${currentPhase - phaseTimer} seconds remaining`}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-lg transition-colors duration-700 relative z-10"
            style={circleStyle}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">{currentPhase - phaseTimer}</div>
              <div className="text-xs md:text-sm uppercase tracking-wide font-medium">{phase}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="capitalize">{phase}</span>
              <span>{phaseTimer}/{currentPhase}s</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Phase progress">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pattern Display */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Breathing Pattern</div>
            <div className="flex justify-center gap-4 text-xs flex-wrap">
              {(['inhale', 'hold', 'exhale', 'pause'] as const).map(p => (
                <Badge key={p} variant={phase === p ? 'default' : 'outline'} aria-current={phase === p ? 'true' : undefined}>
                  {p.charAt(0).toUpperCase() + p.slice(1)} {currentPattern.phases[p]}s
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* #32: aria-labels on control buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            aria-label="Reset breathing exercise"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={handleStartPause}
            size="lg"
            className="px-8"
            aria-label={isActive ? 'Pause breathing exercise' : 'Start breathing exercise'}
          >
            {isActive ? <Pause className="h-4 w-4 mr-2" aria-hidden="true" /> : <Play className="h-4 w-4 mr-2" aria-hidden="true" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm" aria-label="Close breathing exercise">
            Close
          </Button>
        </div>

        {/* Completion Message */}
        {cycleCount >= 4 && (
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center" role="status">
            <p className="text-green-800 dark:text-green-300 font-medium">
              🎉 Great job! You've completed {cycleCount} breathing cycles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
