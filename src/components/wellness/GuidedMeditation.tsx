
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface GuidedMeditationProps {
  onClose: () => void;
}

const GuidedMeditation: React.FC<GuidedMeditationProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const totalDuration = 300; // 5 minutes

  const meditationSteps = [
    { time: 0, instruction: "Find a comfortable position and close your eyes" },
    { time: 30, instruction: "Take three deep breaths, inhaling slowly through your nose" },
    { time: 60, instruction: "Focus on your breath, feeling the air enter and leave your body" },
    { time: 120, instruction: "If your mind wanders, gently bring attention back to your breath" },
    { time: 180, instruction: "Notice any tension in your body and consciously relax those areas" },
    { time: 240, instruction: "Begin to bring awareness back to your surroundings" },
    { time: 280, instruction: "Wiggle your fingers and toes, take a deep breath" },
    { time: 300, instruction: "When ready, slowly open your eyes. Well done!" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const nextStepIndex = meditationSteps.findIndex(step => step.time > newTime) - 1;
          setCurrentStep(Math.max(0, nextStepIndex));
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentStep(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / totalDuration) * 100;
  const currentInstruction = meditationSteps[currentStep]?.instruction || meditationSteps[0].instruction;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          5-Minute Guided Meditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-mono mb-2">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg min-h-[80px] flex items-center justify-center">
          <p className="text-center text-blue-800 font-medium">
            {currentInstruction}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handlePlayPause} size="lg">
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidedMeditation;
