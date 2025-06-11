
import React from 'react';
import { differenceInDays, format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

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
    if (plantHealth === 0) return "Withered";
    if (plantHealth < 20) return "Dying";
    if (plantHealth < 40) return "Wilting";
    if (plantHealth < 60) return "Struggling";
    if (plantHealth < 80) return "Growing";
    if (plantHealth < 100) return "Healthy";
    return "Thriving";
  };

  const getDaysSinceLastEntry = () => {
    if (!lastEntryDate) return 0;
    return differenceInDays(new Date(), lastEntryDate);
  };

  const daysSince = getDaysSinceLastEntry();

  const getPlantStageMessage = () => {
    if (plantHealth === 0) return "Your plant needs immediate care!";
    if (plantHealth < 20) return "Water your plant with journal entries!";
    if (plantStage === 0 && plantHealth > 60) return "Just planted! Keep journaling to help it grow.";
    if (plantStage >= 4) return "Your plant has reached full maturity!";
    if (plantStage >= 2) return "Your plant is flourishing!";
    if (plantStage >= 1) return "Your plant is starting to grow!";
    return "Keep caring for your plant with daily entries.";
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-10">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${
              plantHealth === 0 ? 'text-red-600 dark:text-red-400' :
              plantHealth < 40 ? 'text-orange-600 dark:text-orange-400' :
              'text-green-600 dark:text-green-400'
            }`}>
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
        
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Health</span>
            <span>{Math.round(plantHealth)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                plantHealth === 0 ? 'bg-gray-400' :
                plantHealth < 20 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                plantHealth < 40 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                plantHealth < 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{ 
                width: `${plantHealth}%`,
                boxShadow: plantHealth > 50 ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none'
              }}
            />
          </div>
        </div>
        
        <div className={`text-xs px-2 py-1 rounded ${
          plantHealth === 0 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' :
          plantHealth < 40 ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30' :
          'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
        }`}>
          {getPlantStageMessage()}
        </div>
      </div>
    </div>
  );
};

export default PlantStatusInfo;
