
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
    label: 'Sad',
    value: 'sad',
    color: '#74b9ff',
    description: 'Feeling down or melancholic'
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
  
  const handleMoodClick = (mood: MoodType) => {
    // More subtle haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30); // Shorter vibration for subtler feedback
    }
    
    onMoodSelect(mood);
  };
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            className={cn(
              "rounded-xl p-4 h-24 flex flex-col items-center justify-center gap-2",
              "transition-all duration-300 ease-in-out", // Smoother transition
              selectedMood === mood.value 
                ? "ring-2 ring-offset-1 ring-offset-background scale-[1.02] shadow-md" // More subtle selected state
                : "hover:scale-[1.02] shadow hover:shadow-md", // More subtle hover effect
              "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background",
            )}
            style={{ 
              backgroundColor: mood.color,
              opacity: selectedMood && selectedMood !== mood.value ? 0.85 : 1, // Subtle dimming of unselected items
            }}
            onMouseEnter={() => setHoverMood(mood)}
            onMouseLeave={() => setHoverMood(null)}
            onClick={() => handleMoodClick(mood.value)}
          >
            <span className="font-semibold text-white drop-shadow-sm">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {/* Fixed height container for mood descriptions to prevent layout shift */}
      <div className="h-8 mt-3">
        <div 
          className={cn(
            "text-sm text-muted-foreground",
            "transition-opacity duration-300",
            hoverMood ? "opacity-100" : "opacity-0"
          )}
        >
          {hoverMood?.description || ""}
        </div>
      </div>
    </div>
  );
}
