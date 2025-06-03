
export const moodEmojis = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  energetic: '⚡',
  angry: '😠',
  peaceful: '☮️'
};

export const moodColors = {
  happy: '#FEF08A',
  sad: '#BFDBFE',
  anxious: '#DDD6FE',
  calm: '#BBF7D0',
  energetic: '#FBBF24',
  angry: '#FCA5A5',
  peaceful: '#A7F3D0'
};

export const moodPlantMap = {
  happy: '🌻',
  sad: '🌧️',
  anxious: '🌪️',
  calm: '🌿',
  energetic: '🌟',
  angry: '🔥',
  peaceful: '🕊️'
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
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 1
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Log 5 mood entries',
    icon: '🌿',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 5
  },
  {
    id: 'week-explorer',
    title: 'Week Explorer',
    description: 'Log moods for 7 different days',
    icon: '📅',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 7
  },
  {
    id: 'consistent-tracker',
    title: 'Consistent Tracker',
    description: 'Log 15 mood entries',
    icon: '📊',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 15
  },
  {
    id: 'daily-habit',
    title: 'Daily Habit',
    description: 'Maintain a 3-day streak - Unlocks amber plant color',
    icon: '🔥',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 3
  },
  {
    id: 'weekly-warrior',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day streak - Unlocks purple plant color',
    icon: '🏆',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 7
  },
  {
    id: 'dedicated-tracker',
    title: 'Dedicated Tracker',
    description: 'Log 30 mood entries',
    icon: '🎯',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 30
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Maintain a 14-day streak - Unlocks blue plant color',
    icon: '⚡',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 14
  },
  {
    id: 'mood-veteran',
    title: 'Mood Veteran',
    description: 'Log 50 mood entries',
    icon: '🌟',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 50
  },
  {
    id: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintain a 30-day streak - Unlocks green plant color',
    icon: '👑',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 30
  },
  {
    id: 'happy-gardener',
    title: 'Happy Gardener',
    description: 'Log 10 happy moods - Unlocks golden plant variations',
    icon: '🌻',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0, moodCounts: Record<string, number> = {}) => (moodCounts.happy || 0) >= 10
  },
  {
    id: 'calm-spirit',
    title: 'Calm Spirit',
    description: 'Log 10 calm moods - Unlocks peaceful plant variations',
    icon: '🌿',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0, moodCounts: Record<string, number> = {}) => (moodCounts.calm || 0) >= 10
  },
  {
    id: 'energy-master',
    title: 'Energy Master',
    description: 'Log 10 energetic moods - Unlocks vibrant plant variations',
    icon: '⚡',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0, moodCounts: Record<string, number> = {}) => (moodCounts.energetic || 0) >= 10
  },
  {
    id: 'peaceful-soul',
    title: 'Peaceful Soul',
    description: 'Log 10 peaceful moods - Unlocks serene plant variations',
    icon: '🕊️',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0, moodCounts: Record<string, number> = {}) => (moodCounts.peaceful || 0) >= 10
  },
  {
    id: 'colorful-garden',
    title: 'Colorful Garden',
    description: 'Experience all 7 different plant colors - Unlocks rainbow plant theme',
    icon: '🌈',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0) => uniqueMoods >= 7
  },
  {
    id: 'mood-explorer',
    title: 'Mood Explorer',
    description: 'Log all 7 different mood types',
    icon: '🧭',
    requirement: (totalEntries: number, currentStreak: number, uniqueMoods: number = 0) => uniqueMoods >= 7
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Log 100 mood entries',
    icon: '💯',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 100
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Maintain a 60-day streak - Unlocks platinum plant color',
    icon: '🏃‍♂️',
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 60
  },
  {
    id: 'zen-master',
    title: 'Zen Master',
    description: 'Log 200 mood entries',
    icon: '🧘‍♀️',
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 200
  },
  {
    id: 'legendary-tracker',
    title: 'Legendary Tracker',
    description: 'Maintain a 100-day streak - Unlocks legendary diamond plant color',
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
    requirement: (totalEntries: number, currentStreak: number) => totalEntries >= 365
  }
];
