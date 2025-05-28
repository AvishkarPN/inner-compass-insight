
import React from 'react';
import AchievementsDisplay from '@/components/AchievementsDisplay';

const Achievements = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock special milestones as you maintain your mood tracking journey.
        </p>
      </div>
      
      <AchievementsDisplay />
    </div>
  );
};

export default Achievements;
