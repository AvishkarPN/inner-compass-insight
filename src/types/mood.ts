
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
