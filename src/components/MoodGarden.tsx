
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';

const moodPlantMap: Record<MoodType, { plant: string, size: number }> = {
  angry: { plant: '🌵', size: 24 },
  energetic: { plant: '🌻', size: 28 },
  happy: { plant: '🌺', size: 28 },
  peaceful: { plant: '🌿', size: 26 },
  calm: { plant: '🍀', size: 24 },
  anxious: { plant: '🌱', size: 22 },
};

const MoodGarden = () => {
  const { moodEntries } = useMood();
  
  // Get the last 10 entries for the garden
  const gardenEntries = [...moodEntries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
    
  if (gardenEntries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Your garden is empty. Add mood entries to see your garden grow!
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative h-full">
      {/* Garden ground */}
      <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-amber-100 to-transparent dark:from-amber-950 rounded-b-lg"></div>
      
      {/* Plants */}
      <div className="absolute inset-0 flex items-end justify-around pb-4">
        {gardenEntries.map((entry, index) => {
          const plantInfo = moodPlantMap[entry.mood];
          const position = (index / gardenEntries.length) * 90 + 5; // 5-95% horizontal position
          
          return (
            <div
              key={entry.id}
              className="absolute animate-float"
              style={{
                left: `${position}%`,
                bottom: '8%',
                transform: 'translateX(-50%)',
                fontSize: `${plantInfo.size}px`,
                transition: 'all 0.3s ease-in-out',
              }}
              title={`${entry.mood} - ${new Date(entry.timestamp).toLocaleDateString()}`}
            >
              {plantInfo.plant}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodGarden;
