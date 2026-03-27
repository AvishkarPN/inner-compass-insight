
import React from 'react';
import PlantDisplay from './PlantDisplay';
import PlantStatusInfo from './PlantStatusInfo';
import { useMoodGarden } from './useMoodGarden';
import { GardenCustomiser, useGardenConfig } from '@/components/GardenCustomiser';

interface MoodGardenProps {
  /** If true, show the customise button in the header */
  showCustomiser?: boolean;
}

const MoodGarden: React.FC<MoodGardenProps> = ({ showCustomiser = true }) => {
  const {
    streak,
    plantHealth,
    plantStage,
    dominantMood,
    lastEntryDate,
    plantSize,
    hasEntries
  } = useMoodGarden();

  // Feature 10: Garden config with plant style + pot colour
  const { config, update } = useGardenConfig();

  // No entries
  if (!hasEntries) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50/30 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/30 rounded-lg relative">
        {showCustomiser && (
          <div className="absolute top-2 right-2">
            <GardenCustomiser config={config} onUpdate={update} />
          </div>
        )}
        <p className="text-muted-foreground text-center mb-2">
          Meet your companion plant! Start journaling to help it grow.
        </p>
        <div className="text-3xl opacity-50 animate-pulse" aria-hidden="true">
          {config.plantStyle === 'flower'  ? '🌸' :
           config.plantStyle === 'tree'    ? '🌳' :
           config.plantStyle === 'pine'    ? '🌲' :
           config.plantStyle === 'bamboo'  ? '🎋' : '🪴'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-emerald-50/40 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg p-4 gap-3">
      {/* Header row: status + customise button */}
      <div className="flex items-start justify-between gap-2">
        <PlantStatusInfo
          streak={streak}
          plantStage={plantStage}
          plantHealth={plantHealth}
          lastEntryDate={lastEntryDate}
        />
        {showCustomiser && (
          <GardenCustomiser config={config} onUpdate={update} />
        )}
      </div>

      {/* Garden area */}
      <div
        className="flex-1 relative bg-gradient-to-b from-sky-100/40 via-emerald-50/30 to-amber-100/50 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-amber-900/40 rounded-lg overflow-hidden shadow-inner min-h-0"
        aria-label={`Mood garden: ${plantStage} stage, health ${plantHealth}%`}
      >
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 to-transparent dark:from-sky-900/20 pointer-events-none" />

        {/* Ambient Ground Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-700/20 via-green-500/5 to-transparent dark:from-green-900/50 dark:via-green-800/10 rounded-b-lg pointer-events-none" />

        {/* The Plant */}
        <PlantDisplay
          dominantMood={dominantMood}
          plantSize={plantSize}
          plantHealth={plantHealth}
          streak={streak}
        />

        {/* The Pot - Drawn perfectly centered at the bottom to hold the plant */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none z-20 flex flex-col items-center">
           {/* Pot Rim */}
           <div 
             className="w-full h-4 rounded-full border-b-2 border-black/10 shadow-sm relative z-30" 
             style={{ backgroundColor: config.potColor }} 
           />
           {/* Pot Body */}
           <div 
             className="w-28 h-14 rounded-b-2xl shadow-md relative -top-2 z-20 border-x-4 border-b-4 border-black/5" 
             style={{ backgroundColor: config.potColor }} 
           />
        </div>
      </div>
    </div>
  );
};

export default MoodGarden;
