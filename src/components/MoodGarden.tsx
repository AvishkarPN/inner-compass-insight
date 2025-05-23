
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';
import { differenceInDays, isToday, parseISO } from 'date-fns';

// Map of mood types to plant emojis - improved with more detailed plant emojis
const moodPlantMap: Record<MoodType, string> = {
  angry: '🌵', // Cactus for angry
  energetic: '🌻', // Sunflower for energetic
  happy: '🌸', // Cherry blossom for happy
  peaceful: '🪴', // Potted plant for peaceful
  calm: '🍀', // Four leaf clover for calm
  anxious: '🌱', // Seedling for anxious
};

// Plant growth stages with improved descriptions
const plantStages = [
  { stage: 0, size: 16, description: "Just Planted" },
  { stage: 1, size: 20, description: "Tiny Sprout" },
  { stage: 2, size: 24, description: "Growing Seedling" },
  { stage: 3, size: 32, description: "Healthy Plant" },
  { stage: 4, size: 40, description: "Flourishing" },
];

const MoodGarden = () => {
  const { moodEntries } = useMood();
  const [streak, setStreak] = useState(0);
  const [plantHealth, setPlantHealth] = useState(100);
  const [plantStage, setPlantStage] = useState(0);
  const [dominantMood, setDominantMood] = useState<MoodType>("happy");
  const [lastEntryDate, setLastEntryDate] = useState<Date | null>(null);

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
    
    // Calculate health
    // If no entry today and there was an entry yesterday, health drops
    if (!hasEntryToday && previousDate) {
      const daysSinceLastEntry = differenceInDays(new Date(), previousDate);
      // Exponential health decrease (squared for faster decrease after missing days)
      const healthDecrease = Math.min(Math.pow(daysSinceLastEntry, 2) * 10, 100);
      setPlantHealth(Math.max(0, 100 - healthDecrease));
    } else if (hasEntryToday) {
      // Full health if there's an entry today
      setPlantHealth(100);
    }
    
    // Determine dominant mood
    const moodCounts: Record<MoodType, number> = {
      angry: 0, energetic: 0, happy: 0, 
      peaceful: 0, calm: 0, anxious: 0
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
  
  // Get plant details
  const plantEmoji = moodPlantMap[dominantMood];
  const { size } = plantStages[plantStage];
  
  // Plant appearance affected by health
  const getOpacity = () => {
    return 0.5 + (plantHealth / 200); // Range from 0.5 to 1.0
  };
  
  // No entries
  if (moodEntries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50/30 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/30 rounded-lg">
        <p className="text-muted-foreground text-center mb-2">
          Meet your companion plant! Start journaling to help it grow.
        </p>
        <div className="text-xl opacity-50 animate-pulse">🪴</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full flex flex-col bg-gradient-to-b from-amber-50/30 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/30 rounded-lg p-4">
      {/* Info panel */}
      <div className="mb-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-sm backdrop-blur-sm">
        <div className="flex justify-between text-sm">
          <span className="font-medium flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> 
            Streak: <span className="font-bold">{streak} day{streak !== 1 ? 's' : ''}</span>
          </span>
          <span className="font-medium">
            Health: <span className="font-bold">{plantHealth}%</span>
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${plantHealth}%` }}
          />
        </div>
      </div>
      
      {/* Garden area */}
      <div className="flex-1 relative bg-white/40 dark:bg-gray-800/40 rounded-lg overflow-hidden shadow-inner">
        {/* Garden ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-200/70 to-transparent dark:from-amber-900/70 rounded-b-lg"></div>
        
        {/* Plant */}
        <div className="absolute inset-0 flex justify-center items-end">
          <div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-in-out"
            style={{
              fontSize: `${size}px`,
              opacity: getOpacity(),
              filter: `saturate(${plantHealth / 100 * 1.2})`,
              textShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <div className="relative">
              {/* Ambient particles for visual effect */}
              {plantHealth > 70 && (
                <>
                  <span className="absolute -top-4 -left-3 opacity-30 animate-float-gentle text-xs">✨</span>
                  <span className="absolute -top-2 right-1 opacity-30 animate-float text-xs">✨</span>
                </>
              )}
              
              {/* The plant */}
              <span className="animate-float-gentle inline-block">{plantEmoji}</span>
              
              {/* Ground/pot element */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-center">
                <span className="text-xs opacity-80">🪨</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Plant stage info */}
        <div className="absolute bottom-2 inset-x-0 text-center text-xs font-medium">
          <div className="bg-white/70 dark:bg-gray-800/70 mx-auto max-w-fit px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
            {plantStages[plantStage].description}
          </div>
          
          {lastEntryDate && !isToday(lastEntryDate) && (
            <div className="text-amber-600 dark:text-amber-400 mt-1 font-medium bg-white/70 dark:bg-gray-800/70 mx-auto max-w-fit px-2 py-0.5 rounded-full text-[10px] animate-pulse shadow-sm">
              {plantHealth < 70 ? 'Your companion needs attention!' : 'Journal today to maintain your streak!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodGarden;
