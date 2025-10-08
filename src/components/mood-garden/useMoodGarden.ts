
import { useState, useEffect } from 'react';
import { MoodType } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';
import { differenceInDays, isToday } from 'date-fns';
import { plantStages } from './constants';

export const useMoodGarden = () => {
  const { moodEntries } = useMood();
  const [streak, setStreak] = useState(0);
  const [plantHealth, setPlantHealth] = useState(100);
  const [plantStage, setPlantStage] = useState(0);
  const [dominantMood, setDominantMood] = useState<MoodType>("happy");
  const [lastEntryDate, setLastEntryDate] = useState<Date | null>(null);
  const [plantSize, setPlantSize] = useState(16); // Default size

  useEffect(() => {
    if (!moodEntries.length) return;

    // Sort entries by date (newest first)
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get the latest entry
    const latest = sortedEntries[0];
    setLastEntryDate(new Date(latest.timestamp));
    
    // Check if there's an entry today
    const hasEntryToday = sortedEntries.some(entry => 
      isToday(new Date(entry.timestamp))
    );

    // Calculate streak
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    // Go through all entries to calculate streak (consecutive days)
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.timestamp);
      // Set to start of day to compare just the dates
      entryDate.setHours(0, 0, 0, 0);
      
      if (!previousDate) {
        // First entry in the calculation
        currentStreak = 1;
        previousDate = entryDate;
        continue;
      }
      
      // Calculate difference in days
      const diffDays = differenceInDays(previousDate, entryDate);
      
      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
        previousDate = entryDate;
      } else if (diffDays > 1) {
        // Break in streak
        break;
      } else {
        // Same day, multiple entries
        previousDate = entryDate;
      }
    }
    
    setStreak(currentStreak);
    
    // Calculate plant stage based on streak
    // The longer the streak, the higher the plant stage
    const newStage = Math.min(
      Math.floor(currentStreak / 3), // Every 3 days, advance a stage
      plantStages.length - 1 // Maximum stage
    );
    setPlantStage(newStage);
    setPlantSize(plantStages[newStage].size);
    
    // Calculate health with gradual decay
    if (!hasEntryToday && previousDate) {
      const daysSinceLastEntry = differenceInDays(new Date(), previousDate);
      // Gradual health decrease: 10% per day for first 3 days, then accelerated
      let healthDecrease;
      if (daysSinceLastEntry <= 3) {
        healthDecrease = daysSinceLastEntry * 10;
      } else {
        healthDecrease = 30 + Math.pow(daysSinceLastEntry - 3, 1.5) * 15;
      }
      setPlantHealth(Math.max(0, 100 - Math.min(healthDecrease, 100)));
    } else if (hasEntryToday) {
      // Full health if there's an entry today
      setPlantHealth(100);
    }
    
    // Determine dominant mood
    const moodCounts: Record<MoodType, number> = {
      angry: 0, energetic: 0, happy: 0, 
      sad: 0, calm: 0, anxious: 0
    };
    
    // Count moods from last 7 entries
    sortedEntries.slice(0, 7).forEach(entry => {
      moodCounts[entry.mood]++;
    });
    
    // Find the most common mood
    let maxCount = 0;
    let dominant: MoodType = "happy"; // Default
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = mood as MoodType;
      }
    });
    
    setDominantMood(dominant);
  }, [moodEntries]);

  // Trigger gentle re-renders to animate health decay/growth over time (e.g., hourly)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlantHealth((h) => h); // noop state update to trigger rerender without changing value
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    streak,
    plantHealth,
    plantStage,
    dominantMood,
    lastEntryDate,
    plantSize,
    hasEntries: moodEntries.length > 0
  };
};
