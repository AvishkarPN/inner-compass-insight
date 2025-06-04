
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState('478'); // 4-7-8 pattern
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([30]);
  const [showSettings, setShowSettings] = useState(false);

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
            // Move to next phase
            const phaseOrder: (keyof typeof currentPattern.phases)[] = ['inhale', 'hold', 'exhale', 'pause'];
            const currentIndex = phaseOrder.indexOf(phase);
            const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
            
            if (nextPhase === 'inhale') {
              setCycleCount(c => c + 1);
            }
            
            setPhase(nextPhase);
            
            // Play sound cue
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

  const playBreathingSound = (breathPhase: 'inhale' | 'exhale') => {
    // In a real app, you would play actual breathing guide sounds
    // For now, we'll use the Web Audio API to create simple tones
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for inhale/exhale
      oscillator.frequency.setValueAtTime(breathPhase === 'inhale' ? 220 : 180, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(soundVolume[0] / 1000, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setPhaseTimer(0);
  };

  const getCircleScale = () => {
    const baseScale = 'scale-100';
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'exhale') return 'scale-75';
    return baseScale;
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'bg-blue-200';
      case 'hold': return 'bg-purple-200';
      case 'exhale': return 'bg-green-200';
      case 'pause': return 'bg-gray-200';
      default: return 'bg-blue-200';
    }
  };

  const progress = (phaseTimer / currentPhase) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            {currentPattern.name}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{currentPattern.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-medium">Breathing Pattern</h4>
            <div className="grid gap-2">
              {Object.entries(breathingPatterns).map(([key, pattern]) => (
                <Button
                  key={key}
                  variant={breathingPattern === key ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto py-3"
                  onClick={() => {
                    setBreathingPattern(key);
                    handleReset();
                  }}
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
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cycle Counter */}
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">Cycle {cycleCount + 1}</div>
          <div className="text-sm text-muted-foreground">
            Complete 4-8 cycles for best results
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center space-y-6">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full ${getPhaseColor()} transition-all duration-1000 ease-in-out ${getCircleScale()} flex items-center justify-center shadow-lg`}>
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pattern Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-800 mb-2">Breathing Pattern</div>
            <div className="flex justify-center gap-4 text-xs">
              <Badge variant={phase === 'inhale' ? 'default' : 'outline'}>
                Inhale {currentPattern.phases.inhale}s
              </Badge>
              <Badge variant={phase === 'hold' ? 'default' : 'outline'}>
                Hold {currentPattern.phases.hold}s
              </Badge>
              <Badge variant={phase === 'exhale' ? 'default' : 'outline'}>
                Exhale {currentPattern.phases.exhale}s
              </Badge>
              <Badge variant={phase === 'pause' ? 'default' : 'outline'}>
                Pause {currentPattern.phases.pause}s
              </Badge>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleStartPause} size="lg" className="px-8">
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        {/* Completion Message */}
        {cycleCount >= 4 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-green-800 font-medium">
              🎉 Great job! You've completed {cycleCount} breathing cycles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
