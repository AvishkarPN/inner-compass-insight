
import React from 'react';
import PlantDisplay from './PlantDisplay';
import PlantStatusInfo from './PlantStatusInfo';
import { useMoodGarden } from './useMoodGarden';

const MoodGarden = () => {
  const { 
    streak,
    plantHealth,
    plantStage,
    dominantMood,
    lastEntryDate,
    plantSize,
    hasEntries
  } = useMoodGarden();
  
  // No entries
  if (!hasEntries) {
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
      <PlantStatusInfo 
        streak={streak}
        plantStage={plantStage}
        plantHealth={plantHealth}
        lastEntryDate={lastEntryDate}
      />
      
      {/* Garden area */}
      <div className="flex-1 relative bg-white/40 dark:bg-gray-800/40 rounded-lg overflow-hidden shadow-inner">
        {/* Garden ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-200/70 to-transparent dark:from-amber-900/70 rounded-b-lg"></div>
        
        <PlantDisplay 
          dominantMood={dominantMood}
          plantSize={plantSize}
          plantHealth={plantHealth}
        />
      </div>
    </div>
  );
};

export default MoodGarden;
