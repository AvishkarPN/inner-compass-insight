
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Waves, Zap, Leaf } from 'lucide-react';

interface GuidedMeditationProps {
  onClose: () => void;
}

const GuidedMeditation: React.FC<GuidedMeditationProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState([50]);
  const [selectedAmbience, setSelectedAmbience] = useState<'forest' | 'ocean' | 'rain' | 'silence'>('forest');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
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

  const ambienceOptions = [
    { id: 'forest', name: 'Forest', icon: Leaf, color: 'bg-green-100 text-green-800' },
    { id: 'ocean', name: 'Ocean', icon: Waves, color: 'bg-blue-100 text-blue-800' },
    { id: 'rain', name: 'Rain', icon: Zap, color: 'bg-gray-100 text-gray-800' },
    { id: 'silence', name: 'Silence', icon: VolumeX, color: 'bg-purple-100 text-purple-800' }
  ];

  // Map ambience to sample audio URLs (public domain / placeholders)
  const ambienceSrc: Record<string, string> = {
    forest: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3cfb1f4e2a.mp3?filename=forest-birds-ambient-14375.mp3',
    ocean: 'https://cdn.pixabay.com/download/audio/2021/10/19/audio_0a675985d2.mp3?filename=ocean-waves-ambient-9875.mp3',
    rain: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c0c2f9e7b.mp3?filename=gentle-rain-ambient-10885.mp3'
  };

  // Prepare audio element
  useEffect(() => {
    if (musicEnabled && selectedAmbience !== 'silence') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = musicVolume[0] / 100;
      }
      const src = ambienceSrc[selectedAmbience] || '';
      if (src) {
        audioRef.current.src = src;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicEnabled, selectedAmbience]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume[0] / 100;
    }
  }, [musicVolume]);

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

      // Start background music (requires prior user interaction on mobile)
      if (musicEnabled && selectedAmbience !== 'silence' && audioRef.current && userInteracted) {
        audioRef.current.play().catch(() => {
          // Autoplay prevented; will play after user interaction
        });
      }
    } else {
      // Pause background music
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, musicEnabled, selectedAmbience, userInteracted]);

  const handlePlayPause = () => {
    setUserInteracted(true);
    setIsPlaying(!isPlaying);
    // Gentle fade in/out
    const fade = (target: number) => {
      if (!audioRef.current) return;
      const step = (target - audioRef.current.volume) / 10;
      let i = 0;
      const id = setInterval(() => {
        if (!audioRef.current) { clearInterval(id); return; }
        audioRef.current.volume = Math.max(0, Math.min(1, audioRef.current.volume + step));
        if (++i >= 10) clearInterval(id);
      }, 60);
    };
    if (!isPlaying && musicEnabled && selectedAmbience !== 'silence') fade(musicVolume[0] / 100);
    if (isPlaying) fade(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentStep(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / totalDuration) * 100;
  const currentInstruction = meditationSteps[currentStep]?.instruction || meditationSteps[0].instruction;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          5-Minute Guided Meditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer and Progress */}
        <div className="text-center space-y-4">
          <div className="text-3xl font-mono mb-2">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
          <Progress value={progress} className="w-full h-2" />
          <Badge variant="outline" className="text-sm">
            Step {currentStep + 1} of {meditationSteps.length}
          </Badge>
        </div>

        {/* Current Instruction */}
        <div className="bg-blue-50 p-6 rounded-lg min-h-[100px] flex items-center justify-center">
          <p className="text-center text-blue-800 font-medium leading-relaxed">
            {currentInstruction}
          </p>
        </div>

        {/* Ambience Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Background Ambience</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ambienceOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.id}
                  variant={selectedAmbience === option.id ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedAmbience(option.id as any)}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Music Controls */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Background Music</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setUserInteracted(true); setMusicEnabled(!musicEnabled); }}
              aria-label={musicEnabled ? 'Disable background music' : 'Enable background music'}
            >
              {musicEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          
          {musicEnabled && selectedAmbience !== 'silence' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Volume</span>
                <span>{musicVolume[0]}%</span>
              </div>
              <Slider
                value={musicVolume}
                onValueChange={setMusicVolume}
                max={100}
                step={5}
                className="w-full"
                aria-label="Music volume"
              />
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handlePlayPause} size="lg" className="px-8" aria-label={isPlaying ? 'Pause meditation' : 'Start meditation'}>
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        {/* Completion Message */}
        {currentTime >= totalDuration && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-green-800 font-medium">
              🎉 Meditation complete! Take a moment to notice how you feel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidedMeditation;
