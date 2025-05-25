
import { MoodEntry } from '@/types/mood';

export const getMoodEntries = (): MoodEntry[] => {
  try {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading mood entries:', error);
    return [];
  }
};
