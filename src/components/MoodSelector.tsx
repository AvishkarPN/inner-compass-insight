
import React, { useState } from 'react';
import { MoodType, MoodOption } from '../types/mood';
import { cn } from '@/lib/utils';

const moodOptions: MoodOption[] = [
  {
    label: 'Angry',
    value: 'angry',
    color: '#ff6b6b',
    description: 'Feeling frustrated or upset'
  },
  {
    label: 'Energetic',
    value: 'energetic',
    color: '#ffa502',
    description: 'Full of energy and excitement'
  },
  {
    label: 'Happy',
    value: 'happy',
    color: '#feca57',
    description: 'Joyful and content'
  },
  {
    label: 'Peaceful',
    value: 'peaceful',
    color: '#2ecc71',
    description: 'Calm and satisfied'
  },
  {
    label: 'Calm',
    value: 'calm',
    color: '#3498db',
    description: 'Relaxed and at ease'
  },
  {
    label: 'Anxious',
    value: 'anxious',
    color: '#9b59b6',
    description: 'Worried or nervous'
  }
];

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodType) => void;
  selectedMood?: MoodType;
}

export default function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  const [hoverMood, setHoverMood] = useState<MoodOption | null>(null);
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">How are you feeling today?</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            className={cn(
              "rounded-xl p-4 h-24 transition-all duration-300 flex flex-col items-center justify-center gap-2",
              selectedMood === mood.value 
                ? "ring-4 ring-offset-2 ring-offset-background scale-105 shadow-lg" 
                : "hover:scale-105 shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
            )}
            style={{ 
              backgroundColor: mood.color,
              boxShadow: selectedMood === mood.value ? `0 8px 24px rgba(0,0,0,0.15)` : undefined,
              transform: selectedMood === mood.value ? 'scale(1.05)' : undefined,
              ringColor: mood.color
            }}
            onMouseEnter={() => setHoverMood(mood)}
            onMouseLeave={() => setHoverMood(null)}
            onClick={() => onMoodSelect(mood.value)}
          >
            <span className="font-semibold text-white drop-shadow-sm">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {hoverMood && (
        <div className="mt-2 text-sm text-muted-foreground animate-fade-in">
          {hoverMood.description}
        </div>
      )}
    </div>
  );
}
