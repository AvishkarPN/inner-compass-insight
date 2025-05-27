
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);

  const phases = {
    inhale: { duration: 4, instruction: 'Breathe in slowly', color: 'bg-blue-200' },
    hold: { duration: 4, instruction: 'Hold your breath', color: 'bg-purple-200' },
    exhale: { duration: 6, instruction: 'Breathe out slowly', color: 'bg-green-200' },
    pause: { duration: 2, instruction: 'Rest', color: 'bg-gray-200' }
  };

  const currentPhase = phases[phase];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev >= currentPhase.duration) {
            // Move to next phase
            const phaseOrder: (keyof typeof phases)[] = ['inhale', 'hold', 'exhale', 'pause'];
            const currentIndex = phaseOrder.indexOf(phase);
            const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
            
            if (nextPhase === 'inhale') {
              setCycleCount(c => c + 1);
            }
            
            setPhase(nextPhase);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, currentPhase.duration]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setPhaseTimer(0);
  };

  const circleScale = phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-75' : 'scale-125';
  const progress = (phaseTimer / currentPhase.duration) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          4-7-8 Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Cycle {cycleCount + 1}</div>
          <div className="text-sm text-muted-foreground mb-4">
            Complete 4-8 cycles for best results
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full ${currentPhase.color} transition-all duration-1000 ease-in-out ${circleScale} flex items-center justify-center mb-4`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentPhase.duration - phaseTimer}</div>
              <div className="text-xs uppercase tracking-wide">{phase}</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-800 font-medium">
            {currentPhase.instruction}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleStartPause} size="lg">
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
