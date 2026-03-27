
import React, { useState } from 'react';
import { MoodType } from '../types/mood';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';
import { cn } from '@/lib/utils';

// B2: Mood options now built from the single-source-of-truth constants
const moodDescriptions: Record<MoodType, string> = {
  angry:     'Feeling frustrated or upset',
  energetic: 'Full of energy and excitement',
  happy:     'Joyful and content',
  sad:       'Feeling down or melancholic',
  calm:      'Relaxed and at ease',
  anxious:   'Worried or nervous',
};

// Order the moods in a sensible visual sequence
const MOOD_ORDER: MoodType[] = ['angry', 'energetic', 'happy', 'sad', 'calm', 'anxious'];

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodType) => void;
  selectedMood?: MoodType;
}

export default function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  const [hoverMood, setHoverMood] = useState<MoodType | null>(null);

  const handleMoodClick = (mood: MoodType) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    onMoodSelect(mood);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {MOOD_ORDER.map((mood) => (
          <button
            key={mood}
            aria-label={MOOD_LABELS[mood]}
            aria-pressed={selectedMood === mood}
            className={cn(
              "rounded-xl p-3 sm:p-4 h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2",
              "transition-all duration-300 ease-in-out",
              selectedMood === mood
                ? "ring-2 ring-offset-2 ring-offset-background scale-[1.05] shadow-lg"
                : "hover:scale-[1.03] shadow hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            style={{
              backgroundColor: MOOD_COLORS[mood],
              opacity: selectedMood && selectedMood !== mood ? 0.8 : 1,
            }}
            onMouseEnter={() => setHoverMood(mood)}
            onMouseLeave={() => setHoverMood(null)}
            onClick={() => handleMoodClick(mood)}
          >
            {/* B2: Emoji above label, aria-hidden since button has aria-label */}
            <span className="text-xl sm:text-2xl" aria-hidden="true">
              {MOOD_EMOJIS[mood]}
            </span>
            <span className="font-semibold text-white drop-shadow-sm text-xs sm:text-sm">
              {MOOD_LABELS[mood]}
            </span>
          </button>
        ))}
      </div>

      {/* Fixed height container for mood descriptions */}
      <div className="h-6 sm:h-8 mt-2 sm:mt-3">
        <div
          className={cn(
            "text-xs sm:text-sm text-muted-foreground text-center sm:text-left",
            "transition-opacity duration-300",
            hoverMood ? "opacity-100" : "opacity-0"
          )}
        >
          {hoverMood ? moodDescriptions[hoverMood] : ""}
        </div>
      </div>
    </div>
  );
}
