
import { MoodType } from '@/types/mood';

// Map of mood types to plant emojis
export const moodPlantMap: Record<MoodType, string> = {
  angry: '🌵', // Cactus for angry
  energetic: '🌻', // Sunflower for energetic
  happy: '🌸', // Cherry blossom for happy
  peaceful: '🪴', // Potted plant for peaceful
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
