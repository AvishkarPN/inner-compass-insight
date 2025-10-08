import React from 'react';

export interface BreathingPattern {
  name: string;
  description: string;
  phases: {
    name: 'inhale' | 'hold' | 'exhale' | 'pause';
    duration: number;
  }[];
  totalCycles: number;
}

export const breathingPatterns: BreathingPattern[] = [
  {
    name: 'Box Breathing',
    description: 'Equal parts breathing - great for stress relief and focus',
    phases: [
      { name: 'inhale', duration: 4 },
      { name: 'hold', duration: 4 },
      { name: 'exhale', duration: 4 },
      { name: 'hold', duration: 4 },
    ],
    totalCycles: 5,
  },
  {
    name: '4-7-8 Breathing',
    description: 'Promotes relaxation and helps with sleep',
    phases: [
      { name: 'inhale', duration: 4 },
      { name: 'hold', duration: 7 },
      { name: 'exhale', duration: 8 },
    ],
    totalCycles: 4,
  },
  {
    name: 'Calm Breathing',
    description: 'Simple and effective for quick relaxation',
    phases: [
      { name: 'inhale', duration: 4 },
      { name: 'exhale', duration: 6 },
    ],
    totalCycles: 6,
  },
  {
    name: 'Energizing Breath',
    description: 'Quick breathing to boost energy and alertness',
    phases: [
      { name: 'inhale', duration: 2 },
      { name: 'exhale', duration: 2 },
    ],
    totalCycles: 10,
  },
];

interface BreathingCircleProps {
  phase: string;
  progress: number;
  size?: number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ phase, progress, size = 200 }) => {
  const getCircleScale = () => {
    if (phase === 'inhale') {
      return 0.5 + (progress * 0.5);
    } else if (phase === 'exhale') {
      return 1 - (progress * 0.5);
    }
    return 1;
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-400';
      case 'hold':
        return 'from-purple-400 to-pink-400';
      case 'exhale':
        return 'from-green-400 to-teal-400';
      case 'pause':
        return 'from-yellow-400 to-orange-400';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Breathing ${phase} - ${Math.round(progress * 100)}% complete`}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-muted opacity-20" />
      
      {/* Animated circle */}
      <div
        className={`absolute rounded-full bg-gradient-to-br ${getCircleColor()} transition-all duration-1000 ease-in-out shadow-lg`}
        style={{
          width: `${size * getCircleScale()}px`,
          height: `${size * getCircleScale()}px`,
          opacity: 0.7 + (progress * 0.3),
        }}
      />
      
      {/* Center text */}
      <div className="relative z-10 text-center">
        <p className="text-2xl font-bold capitalize text-foreground drop-shadow-md">
          {phase}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
};
