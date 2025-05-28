
import { MoodType } from '@/types/mood';

// Map of mood types to plant emojis
export const moodPlantMap: Record<MoodType, string> = {
  angry: '🌵', // Cactus for angry
  energetic: '🌻', // Sunflower for energetic
  happy: '🌸', // Cherry blossom for happy
  sad: '🌿', // Herb for sad
  calm: '🍀', // Four leaf clover for calm
  anxious: '🌱', // Seedling for anxious
};

// Plant growth stages with descriptions
export const plantStages = [
  { stage: 0, size: 16, description: "Just Planted" },
  { stage: 1, size: 20, description: "Tiny Sprout" },
  { stage: 2, size: 24, description: "Growing Seedling" },
  { stage: 3, size: 32, description: "Healthy Plant" },
  { stage: 4, size: 40, description: "Flourishing" },
];

// Streak milestone colors
export const streakColors: Record<number, string> = {
  0: '#22c55e',    // Default green
  10: '#3b82f6',   // Blue - 10 days
  25: '#8b5cf6',   // Purple - 25 days
  50: '#f59e0b',   // Amber - 50 days
  100: '#ef4444',  // Red - 100 days
  200: '#ec4899',  // Pink - 200 days
  365: '#10b981',  // Emerald - 1 year
  500: '#6366f1',  // Indigo - 500 days
  750: '#f97316',  // Orange - 750 days
  1000: '#dc2626', // Dark red - 1000 days
  1500: '#7c3aed', // Violet - 1500 days
  2000: '#059669', // Dark green - 2000 days
};

// Get color based on streak
export const getStreakColor = (streak: number): string => {
  const milestones = Object.keys(streakColors).map(Number).sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (streak >= milestone) {
      return streakColors[milestone];
    }
  }
  
  return streakColors[0]; // Default color
};

// Achievement definitions
export const achievements = [
  {
    id: 'first_entry',
    title: 'First Steps',
    description: 'Log your first mood entry',
    icon: '🌱',
    requirement: (entries: number, streak: number) => entries >= 1
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: (entries: number, streak: number) => streak >= 7
  },
  {
    id: 'dedicated_logger',
    title: 'Dedicated Logger',
    description: 'Log 25 mood entries',
    icon: '📚',
    requirement: (entries: number, streak: number) => entries >= 25
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    requirement: (entries: number, streak: number) => streak >= 30
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Log 100 mood entries',
    icon: '💯',
    requirement: (entries: number, streak: number) => entries >= 100
  },
  {
    id: 'golden_streak',
    title: 'Golden Streak',
    description: 'Maintain a 50-day streak',
    icon: '✨',
    requirement: (entries: number, streak: number) => streak >= 50
  },
  {
    id: 'diamond_dedication',
    title: 'Diamond Dedication',
    description: 'Maintain a 100-day streak',
    icon: '💎',
    requirement: (entries: number, streak: number) => streak >= 100
  },
  {
    id: 'wellness_champion',
    title: 'Wellness Champion',
    description: 'Log 250 mood entries',
    icon: '🌟',
    requirement: (entries: number, streak: number) => entries >= 250
  },
  {
    id: 'year_long_journey',
    title: 'Year-Long Journey',
    description: 'Maintain a 365-day streak',
    icon: '🎯',
    requirement: (entries: number, streak: number) => streak >= 365
  },
  {
    id: 'milestone_master',
    title: 'Milestone Master',
    description: 'Log 500 mood entries',
    icon: '🏅',
    requirement: (entries: number, streak: number) => entries >= 500
  },
  {
    id: 'legendary_logger',
    title: 'Legendary Logger',
    description: 'Maintain a 500-day streak',
    icon: '👑',
    requirement: (entries: number, streak: number) => streak >= 500
  },
  {
    id: 'ultimate_achiever',
    title: 'Ultimate Achiever',
    description: 'Log 1000 mood entries',
    icon: '🚀',
    requirement: (entries: number, streak: number) => entries >= 1000
  },
  // Streak Milestone Achievements that affect plant appearance
  {
    id: 'streak_milestone_10',
    title: 'Blue Aura',
    description: 'Reach a 10-day streak to unlock blue plant glow',
    icon: '💙',
    requirement: (entries: number, streak: number) => streak >= 10
  },
  {
    id: 'streak_milestone_25',
    title: 'Purple Power',
    description: 'Reach a 25-day streak to unlock purple plant glow',
    icon: '💜',
    requirement: (entries: number, streak: number) => streak >= 25
  },
  {
    id: 'streak_milestone_50',
    title: 'Golden Garden',
    description: 'Reach a 50-day streak to unlock golden plant glow',
    icon: '🌟',
    requirement: (entries: number, streak: number) => streak >= 50
  },
  {
    id: 'streak_milestone_100',
    title: 'Ruby Radiance',
    description: 'Reach a 100-day streak to unlock ruby plant glow',
    icon: '❤️',
    requirement: (entries: number, streak: number) => streak >= 100
  },
  {
    id: 'streak_milestone_365',
    title: 'Emerald Excellence',
    description: 'Reach a 365-day streak to unlock emerald plant glow',
    icon: '💚',
    requirement: (entries: number, streak: number) => streak >= 365
  },
  {
    id: 'streak_milestone_500',
    title: 'Indigo Illumination',
    description: 'Reach a 500-day streak to unlock indigo plant glow',
    icon: '🔮',
    requirement: (entries: number, streak: number) => streak >= 500
  }
];
