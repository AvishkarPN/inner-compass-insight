
export type MoodType = 'angry' | 'energetic' | 'happy' | 'sad' | 'calm' | 'anxious';

export interface MoodOption {
  label: string;
  value: MoodType;
  color: string;
  description: string;
}

export interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: MoodType;
  journalText: string;
  sentimentScore?: number; // -1 to 1, where -1 is negative and 1 is positive
}

export interface WeeklyMoodData {
  day: string;
  mood: MoodType | null;
}

// Mood colors for consistent styling
export const moodColors: Record<MoodType, string> = {
  angry: '#ef4444',     // red-500
  energetic: '#f59e0b', // amber-500
  happy: '#10b981',     // emerald-500
  sad: '#6366f1',       // indigo-500
  calm: '#8b5cf6',      // violet-500
  anxious: '#f97316',   // orange-500
};
