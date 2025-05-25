
import { MoodEntry, MoodType } from "@/types/mood";

// Generate a unique "fingerprint" string based on mood data
export const generateMoodFingerprint = (entries: MoodEntry[]): string => {
  if (!entries.length) return "";
  
  // Create a hash from mood entries
  return entries
    .map(entry => `${entry.mood}-${Math.round((entry.sentimentScore || 0) * 10)}`)
    .join('|');
};

// Get mood color (simple mapping for now)
const getMoodColor = (mood: MoodType): string => {
  const moodColors: Record<MoodType, string> = {
    angry: '#ff6b6b',
    energetic: '#ffa502',
    happy: '#feca57',
    sad: '#74b9ff',
    calm: '#3498db',
    anxious: '#9b59b6',
  };
  return moodColors[mood] || '#3498db';
};

// Generate parameters for art generation
export const generateArtParameters = (entries: MoodEntry[]): {
  colors: string[];
  complexity: number;
  fluidity: number;
  brightness: number;
  patterns: number;
} => {
  if (!entries.length) {
    return {
      colors: ['#3498db'],
      complexity: 0.5,
      fluidity: 0.5,
      brightness: 0.5,
      patterns: 0.5
    };
  }
  
  // Extract mood colors
  const colors = entries.map(entry => getMoodColor(entry.mood));
  
  // Calculate average sentiment to determine overall "mood"
  const sentiments = entries.map(entry => entry.sentimentScore || 0);
  const avgSentiment = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
  
  // Count mood types
  const moodCounts: Record<MoodType, number> = {
    angry: 0,
    energetic: 0,
    happy: 0,
    sad: 0,
    calm: 0,
    anxious: 0
  };
  
  entries.forEach(entry => {
    moodCounts[entry.mood]++;
  });
  
  // Calculate parameters based on mood distribution
  const complexity = (moodCounts.anxious * 0.8 + moodCounts.energetic * 0.6) / entries.length;
  const fluidity = (moodCounts.calm * 0.8 + moodCounts.sad * 0.7) / entries.length;
  const brightness = (moodCounts.happy * 0.8 + moodCounts.energetic * 0.6) / entries.length;
  const patterns = (moodCounts.anxious * 0.7 + moodCounts.angry * 0.5) / entries.length;
  
  return {
    colors: [...new Set(colors)], // Remove duplicates
    complexity: complexity || 0.5,
    fluidity: fluidity || 0.5,
    brightness: brightness || 0.5,
    patterns: patterns || 0.5
  };
};

// Generate a unique seed for the art generator
export const generateSeed = (entries: MoodEntry[]): number => {
  if (!entries.length) return Date.now();
  
  const fingerprint = generateMoodFingerprint(entries);
  let hash = 0;
  
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
};

// Get time period description (today, this week, this month, etc.)
export const getTimePeriodDescription = (entries: MoodEntry[]): string => {
  if (!entries.length) return "your mood";
  
  const now = new Date();
  const oldest = new Date(Math.min(...entries.map(e => new Date(e.timestamp).getTime())));
  const newest = new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime())));
  
  const diffDays = Math.floor((now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
  const newestDiffDays = Math.floor((now.getTime() - newest.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if all entries are from today
  if (newestDiffDays === 0 && diffDays === 0) return "today";
  
  // Check if entries span within the last week
  if (diffDays <= 7) return "this week";
  
  // Check if entries span within the last month
  if (diffDays <= 31) return "this month";
  
  return "your mood journey";
};
