
import React from 'react';
import { differenceInDays, format } from 'date-fns';

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
  const getStatusMessage = () => {
    if (plantHealth === 100) return "Thriving";
    if (plantHealth >= 80) return "Healthy";
    if (plantHealth >= 60) return "Growing";
    if (plantHealth >= 40) return "Needs care";
    if (plantHealth >= 20) return "Struggling";
    return "Wilting";
  };

  const getDaysSinceLastEntry = () => {
    if (!lastEntryDate) return 0;
    return differenceInDays(new Date(), lastEntryDate);
  };

  const daysSince = getDaysSinceLastEntry();

  return (
    <div className="absolute top-2 left-2 right-2 z-10">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600 dark:text-green-400">
              {getStatusMessage()}
            </span>
            <span className="text-xs text-muted-foreground">
              {streak} day streak
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {daysSince === 0 ? 'Logged today' : 
             daysSince === 1 ? 'Logged yesterday' : 
             `${daysSince} days ago`}
          </div>
        </div>
        
        {plantStage === 0 && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
            Just planted! Keep journaling to help it grow.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantStatusInfo;
