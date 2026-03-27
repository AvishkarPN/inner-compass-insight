import { MOOD_COLORS, MOOD_EMOJIS } from '@/constants/moodColors';

// Re-export from canonical source (A2 unification)
export const moodEmojis = MOOD_EMOJIS;

// Re-export canonical colors so PlantSVG and other consumers get consistent values
export const moodColors = MOOD_COLORS;

export const moodPlantMap = {
  happy: '🌻',
  sad: '🌧️',
  anxious: '🌪️',
  calm: '🌿',
  energetic: '🌟',
  angry: '🔥',
};

export const plantStages = [
  { name: 'Seed', size: 16, emoji: '🌱' },
  { name: 'Sprout', size: 24, emoji: '🌿' },
  { name: 'Sapling', size: 32, emoji: '🌳' },
  { name: 'Young Tree', size: 40, emoji: '🌲' },
  { name: 'Mature Tree', size: 48, emoji: '🌴' }
];

export const getStreakColor = (streak: number): string => {
  if (streak >= 30) return '#10B981'; // Green-500
  if (streak >= 14) return '#3B82F6'; // Blue-500
  if (streak >= 7) return '#8B5CF6';  // Purple-500
  if (streak >= 3) return '#F59E0B';  // Amber-500
  return '#6B7280'; // Gray-500
};

export const achievements = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Log your first mood entry',
    icon: '🌱',
    requirement: (totalEntries: number) => totalEntries >= 1
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Log 5 mood entries',
    icon: '🌿',
    requirement: (totalEntries: number) => totalEntries >= 5
  },
  {
    id: 'week-explorer',
    title: 'Week Explorer',
    description: 'Log moods for 7 different days',
    icon: '📅',
    requirement: (totalEntries: number, currentStreak: number, uniqueDays: number) => uniqueDays >= 7
  },
  {
    id: 'consistent-tracker',
    title: 'Consistent Tracker',
    description: 'Log 15 mood entries',
    icon: '📊',
    requirement: (totalEntries: number) => totalEntries >= 15
  },
  {
    id: 'daily-habit',
    title: 'Daily Habit',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 3
  },
  {
    id: 'weekly-warrior',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🏆',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 7
  },
  {
    id: 'dedicated-tracker',
    title: 'Dedicated Tracker',
    description: 'Log 30 mood entries',
    icon: '🎯',
    requirement: (totalEntries: number) => totalEntries >= 30
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Maintain a 14-day streak',
    icon: '⚡',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 14
  },
  {
    id: 'mood-veteran',
    title: 'Mood Veteran',
    description: 'Log 50 mood entries',
    icon: '🌟',
    requirement: (totalEntries: number) => totalEntries >= 50
  },
  {
    id: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 30
  },
  {
    id: 'happy-gardener',
    title: 'Happy Gardener',
    description: 'Log 10 happy moods',
    icon: '🌻',
    requirement: (_t: number, _s: number, _u: number, moodCounts: Record<string, number>) => (moodCounts?.happy || 0) >= 10
  },
  {
    id: 'calm-spirit',
    title: 'Calm Spirit',
    description: 'Log 10 calm moods',
    icon: '🌿',
    requirement: (_t: number, _s: number, _u: number, moodCounts: Record<string, number>) => (moodCounts?.calm || 0) >= 10
  },
  {
    id: 'energy-master',
    title: 'Energy Master',
    description: 'Log 10 energetic moods',
    icon: '⚡',
    requirement: (totalEntries: number, currentStreak: number, uniqueDays: number, moodCounts: Record<string, number>) => (moodCounts?.energetic || 0) >= 10
  },
  {
    id: 'mood-explorer',
    title: 'Mood Explorer',
    description: 'Log all 6 different mood types',
    icon: '🧭',
    requirement: (totalEntries: number, currentStreak: number, uniqueDays: number, moodCounts: Record<string, number>) => {
      const moodTypes = ['happy', 'sad', 'anxious', 'calm', 'energetic', 'angry'];
      return moodTypes.every(mood => (moodCounts?.[mood] || 0) > 0);
    }
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Log 100 mood entries',
    icon: '💯',
    requirement: (totalEntries: number) => totalEntries >= 100
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Maintain a 60-day streak',
    icon: '🏃‍♂️',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 60
  },
  {
    id: 'zen-master',
    title: 'Zen Master',
    description: 'Log 200 mood entries',
    icon: '🧘‍♀️',
    requirement: (totalEntries: number) => totalEntries >= 200
  },
  {
    id: 'legendary-tracker',
    title: 'Legendary Tracker',
    description: 'Maintain a 100-day streak',
    icon: '🏅',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 100
  },
  {
    id: 'garden-master',
    title: 'Garden Master',
    description: 'Achieve maximum plant growth',
    icon: '🌳',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 15 && totalEntries >= 50
  },
  {
    id: 'mood-sage',
    title: 'Mood Sage',
    description: 'Log 365 mood entries (full year)',
    icon: '🌅',
    requirement: (totalEntries: number) => totalEntries >= 365
  }
];
