
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';
import { differenceInDays, isToday, parseISO } from 'date-fns';

// Map of mood types to plant emojis
const moodPlantMap: Record<MoodType, string> = {
  angry: '🌵',
  energetic: '🌻',
  happy: '🌺',
  peaceful: '🌿',
  calm: '🍀',
  anxious: '🌱',
};

// Plant growth stages
const plantStages = [
  { stage: 0, size: 16, description: "Seedling" },
  { stage: 1, size: 20, description: "Small Plant" },
  { stage: 2, size: 24, description: "Medium Plant" },
  { stage: 3, size: 32, description: "Large Plant" },
  { stage: 4, size: 40, description: "Thriving Plant" },
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
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground text-center mb-2">
          Your garden is empty. Add mood entries to see your plant grow!
        </p>
        <div className="text-xl opacity-50">🌱</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Info panel */}
      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span>Streak: <span className="font-medium">{streak} day{streak !== 1 ? 's' : ''}</span></span>
          <span>Health: <span className="font-medium">{plantHealth}%</span></span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${plantHealth}%` }}
          />
        </div>
      </div>
      
      {/* Garden area */}
      <div className="flex-1 relative">
        {/* Garden ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-amber-100 to-transparent dark:from-amber-950 rounded-b-lg"></div>
        
        {/* Plant */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pb-6">
          <div
            className="transition-all duration-700 ease-in-out"
            style={{
              fontSize: `${size}px`,
              opacity: getOpacity(),
              animation: "float-gentle 4s infinite ease-in-out",
              filter: plantHealth < 50 ? 'grayscale(50%)' : 'none',
            }}
          >
            {plantEmoji}
          </div>
        </div>
        
        {/* Plant stage info */}
        <div className="absolute bottom-2 inset-x-0 text-center text-xs text-muted-foreground">
          {plantStages[plantStage].description}
          {lastEntryDate && !isToday(lastEntryDate) && (
            <div className="text-amber-500 mt-0.5">
              {plantHealth < 70 ? 'Your plant needs attention!' : 'Add an entry today to maintain your plant!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodGarden;
