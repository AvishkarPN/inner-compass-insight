
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Waves, Zap, Leaf, AlertCircle, Moon, Target } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface GuidedMeditationProps {
  onClose: () => void;
}

// Feature 9: Meditation categories — defined OUTSIDE the component
type MeditationCategory = 'general' | 'sleep' | 'anxiety' | 'focus';

interface CategoryScript {
  label: string;
  emoji: string;
  duration: number;
  steps: { time: number; instruction: string }[];
}

const CATEGORY_SCRIPTS: Record<MeditationCategory, CategoryScript> = {
  general: {
    label: 'General', emoji: '🧘',
    duration: 300,
    steps: [
      { time: 0,   instruction: 'Find a comfortable position and close your eyes' },
      { time: 30,  instruction: 'Take three deep breaths, inhaling slowly through your nose' },
      { time: 60,  instruction: 'Focus on your breath, feeling the air enter and leave your body' },
      { time: 120, instruction: 'If your mind wanders, gently bring attention back to your breath' },
      { time: 180, instruction: 'Notice any tension in your body and consciously relax those areas' },
      { time: 240, instruction: 'Begin to bring awareness back to your surroundings' },
      { time: 280, instruction: 'Wiggle your fingers and toes, take a deep breath' },
      { time: 300, instruction: 'When ready, slowly open your eyes. Well done!' },
    ],
  },
  sleep: {
    label: 'Sleep', emoji: '🌙',
    duration: 480,
    steps: [
      { time: 0,   instruction: 'Lie comfortably. Let your body sink into the surface beneath you.' },
      { time: 60,  instruction: 'Take a slow breath in for 4 counts, hold for 4, exhale for 8.' },
      { time: 120, instruction: 'Scan your body from toes to head, releasing tension as you go.' },
      { time: 180, instruction: 'Imagine a warm golden light spreading through your body.' },
      { time: 300, instruction: 'Your thoughts are clouds drifting past — let them go.' },
      { time: 400, instruction: 'Allow yourself to feel heavy... safe... and completely at rest.' },
      { time: 480, instruction: 'Drift off whenever you are ready. Sweet dreams. 🌙' },
    ],
  },
  anxiety: {
    label: 'Anxiety', emoji: '💙',
    duration: 300,
    steps: [
      { time: 0,   instruction: 'Place a hand on your chest. Feel it rise and fall.' },
      { time: 30,  instruction: 'Breathe in for 4 counts, out for 6. Repeat.' },
      { time: 60,  instruction: 'Name 5 things you can see around you right now.' },
      { time: 120, instruction: 'Name 4 things you can physically feel. Ground yourself.' },
      { time: 180, instruction: 'Soften your jaw, relax your shoulders. You are safe.' },
      { time: 240, instruction: 'Your anxiety is temporary. This feeling will pass.' },
      { time: 300, instruction: 'Return here whenever you need. You did great. 💙' },
    ],
  },
  focus: {
    label: 'Focus', emoji: '🎯',
    duration: 240,
    steps: [
      { time: 0,   instruction: 'Sit upright. Set a clear intention for the next task.' },
      { time: 30,  instruction: 'Take 3 energising breaths: sharp inhale, forceful exhale.' },
      { time: 60,  instruction: 'Clear mental clutter — park distractions for later.' },
      { time: 120, instruction: 'Visualise completing your task successfully.' },
      { time: 180, instruction: 'Feel alert, capable, and ready to do your best work.' },
      { time: 240, instruction: 'Open your eyes and begin. Your focus is razor-sharp. 🎯' },
    ],
  },
};

const CATEGORIES: { id: MeditationCategory; label: string; emoji: string }[] = [
  { id: 'general', label: 'General', emoji: '🧘' },
  { id: 'sleep',   label: 'Sleep',   emoji: '🌙' },
  { id: 'anxiety', label: 'Anxiety', emoji: '💙' },
  { id: 'focus',   label: 'Focus',   emoji: '🎯' },
];

const ambienceOptions = [
  { id: 'whitenoise', name: 'White Noise', icon: VolumeX },
  { id: 'forest',     name: 'Forest',      icon: Leaf    },
  { id: 'ocean',      name: 'Ocean',       icon: Waves   },
  { id: 'rain',       name: 'Rain',        icon: Zap     },
];

const ambienceSrc: Record<string, string> = {
  whitenoise: '/audio/whitenoise.wav',
  forest:     '/audio/forest.wav',
  ocean:      '/audio/ocean.wav',
  rain:       '/audio/rain.wav',
};

// ─── Component ───────────────────────────────────────────────────────────────
const GuidedMeditation: React.FC<GuidedMeditationProps> = ({ onClose }) => {
  const [category, setCategory] = useState<MeditationCategory>('general');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState([50]);
  const [selectedAmbience, setSelectedAmbience] = useState<'forest' | 'ocean' | 'rain' | 'whitenoise'>('whitenoise');
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const location = useLocation();

  const currentCategory = CATEGORY_SCRIPTS[category];
  const totalDuration = currentCategory.duration;
  const meditationSteps = currentCategory.steps;

  // Feature 9: Reset session when category changes
  const handleCategoryChange = (cat: MeditationCategory) => {
    setCategory(cat);
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentStep(0);
    audioRef.current?.pause();
  };

  // Prepare audio
  useEffect(() => {
    setAudioError(null);
    if (musicEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
      }
      audioRef.current.volume = musicVolume[0] / 100;
      audioRef.current.src = ambienceSrc[selectedAmbience] || '';

      const onError = () => {
        setAudioError(`Could not load "${selectedAmbience}" audio. Try a different option.`);
        setIsPlaying(false);
      };
      audioRef.current.addEventListener('error', onError);
      return () => {
        audioRef.current?.removeEventListener('error', onError);
        audioRef.current?.pause();
      };
    } else {
      audioRef.current?.pause();
    }
  }, [musicEnabled, selectedAmbience]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume[0] / 100;
    }
  }, [musicVolume]);

  // #16: Pause on route change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [location.pathname]);

  // Timer loop
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

      if (musicEnabled && audioRef.current && userInteracted) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      audioRef.current?.pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalDuration, musicEnabled, selectedAmbience, userInteracted]);

  const handlePlayPause = () => {
    setUserInteracted(true);
    setAudioError(null);
    setIsPlaying(prev => !prev);
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
    if (!isPlaying && musicEnabled) fade(musicVolume[0] / 100);
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

  // #15: Seek bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const newTime = Math.floor(ratio * totalDuration);
    setCurrentTime(newTime);
    const nextStepIndex = meditationSteps.findIndex(step => step.time > newTime) - 1;
    setCurrentStep(Math.max(0, nextStepIndex));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / totalDuration) * 100;
  const currentInstruction = meditationSteps[currentStep]?.instruction ?? meditationSteps[0].instruction;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" aria-hidden="true" />
          Guided Meditation
        </CardTitle>

        {/* Feature 9: Category selector */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={category === cat.id ? 'default' : 'outline'}
              className="h-8 text-xs gap-1"
              onClick={() => handleCategoryChange(cat.id)}
              aria-pressed={category === cat.id}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              {cat.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer and seek */}
        <div className="text-center space-y-4">
          <div className="text-3xl font-mono" aria-live="polite" aria-atomic="true">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
          <div
            className="w-full h-3 bg-muted rounded-full cursor-pointer overflow-hidden relative"
            role="slider"
            aria-label="Meditation seek bar"
            aria-valuemin={0}
            aria-valuemax={totalDuration}
            aria-valuenow={currentTime}
            tabIndex={0}
            onClick={handleSeek}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') setCurrentTime(t => Math.min(t + 10, totalDuration));
              if (e.key === 'ArrowLeft')  setCurrentTime(t => Math.max(t - 10, 0));
            }}
          >
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md" style={{ left: `calc(${progress}% - 8px)` }} />
          </div>
          <Badge variant="outline">Step {currentStep + 1} of {meditationSteps.length}</Badge>
        </div>

        {/* Audio error */}
        {audioError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive" role="alert">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{audioError}</span>
          </div>
        )}

        {/* Instruction */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg min-h-[100px] flex items-center justify-center" aria-live="polite">
          <p className="text-center text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
            {currentInstruction}
          </p>
        </div>

        {/* Ambience */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Background Ambience</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ambienceOptions.map(option => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.id}
                  variant={selectedAmbience === option.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedAmbience(option.id as any)}
                  aria-pressed={selectedAmbience === option.id}
                >
                  <IconComponent className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Background Music</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setUserInteracted(true); setMusicEnabled(v => !v); }}
              aria-label={musicEnabled ? 'Disable music' : 'Enable music'}
              aria-pressed={musicEnabled}
            >
              {musicEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
          {musicEnabled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volume</span><span>{musicVolume[0]}%</span>
              </div>
              <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} step={5} aria-label="Music volume" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline" size="sm" aria-label="Reset">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button onClick={handlePlayPause} size="lg" className="px-8" aria-label={isPlaying ? 'Pause' : 'Start'}>
            {isPlaying ? <Pause className="h-4 w-4 mr-2" aria-hidden="true" /> : <Play className="h-4 w-4 mr-2" aria-hidden="true" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onClose} variant="outline" size="sm" aria-label="Close">Close</Button>
        </div>

        {/* Done */}
        {currentTime >= totalDuration && (
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center" role="status">
            <p className="text-green-800 dark:text-green-300 font-medium">
              🎉 Meditation complete! Take a moment to notice how you feel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidedMeditation;
