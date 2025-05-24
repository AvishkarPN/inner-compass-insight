
import React from 'react';
import { isToday } from 'date-fns';
import { plantStages } from './constants';

interface PlantStatusInfoProps {
  streak: number;
  plantStage: number;
  plantHealth: number;
  lastEntryDate: Date | null;
}

const PlantStatusInfo: React.FC<PlantStatusInfoProps> = ({ 
  streak, 
  plantStage, 
  plantHealth, 
  lastEntryDate 
}) => {
  return (
    <>
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
    </>
  );
};

export default PlantStatusInfo;
