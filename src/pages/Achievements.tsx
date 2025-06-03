
import React from 'react';
import AchievementsDisplay from '@/components/AchievementsDisplay';

const Achievements = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 px-1">
        <h1 className="text-xl sm:text-2xl font-bold">Achievements</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress and unlock special milestones as you maintain your mood tracking journey.
        </p>
      </div>
      
      <AchievementsDisplay />
    </div>
  );
};

export default Achievements;
