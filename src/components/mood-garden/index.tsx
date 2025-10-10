
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
    <div className="h-full flex flex-col bg-gradient-to-b from-emerald-50/40 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg p-4 gap-3">
      {/* Status Info - Above the garden */}
      <PlantStatusInfo 
        streak={streak}
        plantStage={plantStage}
        plantHealth={plantHealth}
        lastEntryDate={lastEntryDate}
      />
      
      {/* Garden area */}
      <div className="flex-1 relative bg-gradient-to-b from-sky-100/40 via-emerald-50/30 to-amber-100/50 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-amber-900/40 rounded-lg overflow-hidden shadow-inner min-h-0">
        {/* Sky with clouds */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-sky-200/30 to-transparent dark:from-sky-900/20 pointer-events-none" />
        
        {/* Garden ground with grass texture */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-600/20 via-green-500/15 to-transparent dark:from-green-900/30 dark:via-green-800/20 rounded-b-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-700/40 via-amber-600/50 to-amber-700/40 dark:from-amber-900/60 dark:via-amber-800/70 rounded-b-lg" />
        
        <PlantDisplay 
          dominantMood={dominantMood}
          plantSize={plantSize}
          plantHealth={plantHealth}
          streak={streak}
        />
      </div>
    </div>
  );
};

export default MoodGarden;
