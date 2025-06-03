import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import { achievements } from '@/components/mood-garden/constants';
import { CheckCircle, Circle } from 'lucide-react';

const AchievementsDisplay: React.FC = () => {
  const { moodEntries } = useMood();
  
  // Calculate current streak
  const calculateStreak = () => {
    if (!moodEntries.length) return 0;
    
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      if (!previousDate) {
        currentStreak = 1;
        previousDate = entryDate;
        continue;
      }
      
      const diffDays = Math.floor((previousDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        previousDate = entryDate;
      } else if (diffDays > 1) {
        break;
      } else {
        previousDate = entryDate;
      }
    }
    
    return currentStreak;
  };
  
  // Calculate unique moods used
  const calculateUniqueMoods = () => {
    const uniqueMoodsSet = new Set(moodEntries.map(entry => entry.mood));
    return uniqueMoodsSet.size;
  };
  
  // Calculate mood counts
  const calculateMoodCounts = () => {
    const counts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });
    return counts;
  };
  
  const totalEntries = moodEntries.length;
  const currentStreak = calculateStreak();
  const uniqueMoods = calculateUniqueMoods();
  const moodCounts = calculateMoodCounts();
  
  const getProgress = (achievement: any) => {
    const isCompleted = achievement.requirement(totalEntries, currentStreak, uniqueMoods, moodCounts);
    
    if (isCompleted) {
      return 100;
    }
    
    if (achievement.id === 'happy-gardener') {
      return Math.min(((moodCounts.happy || 0) / 10) * 100, 100);
    }
    if (achievement.id === 'calm-spirit') {
      return Math.min(((moodCounts.calm || 0) / 10) * 100, 100);
    }
    if (achievement.id === 'energy-master') {
      return Math.min(((moodCounts.energetic || 0) / 10) * 100, 100);
    }
    if (achievement.id === 'peaceful-soul') {
      return Math.min(((moodCounts.peaceful || 0) / 10) * 100, 100);
    }
    
    const target = parseInt(achievement.description.match(/\d+/)?.[0] || '0');
    
    if (achievement.id === 'colorful-garden') {
      return Math.min((uniqueMoods / 7) * 100, 100);
    }
    
    if (achievement.id === 'mood-explorer') {
      return Math.min((uniqueMoods / 6) * 100, 100);
    }
    
    if (achievement.id === 'garden-master') {
      const streakTarget = 15;
      const entryTarget = 50;
      const streakProgress = currentStreak / streakTarget;
      const entryProgress = totalEntries / entryTarget;
      
      if (streakProgress <= entryProgress) {
        return `${currentStreak}/${streakTarget} streak`;
      } else {
        return `${totalEntries}/${entryTarget} entries`;
      }
    }
    
    if (achievement.id.includes('streak') || achievement.id.includes('day') || achievement.id === 'weekly-warrior' || achievement.id === 'daily-habit' || achievement.id === 'streak-master' || achievement.id === 'consistency-champion' || achievement.id === 'marathon-runner' || achievement.id === 'legendary-tracker') {
      return Math.min((currentStreak / target) * 100, 100);
    } else {
      return Math.min((totalEntries / target) * 100, 100);
    }
  };
  
  const getCurrentValue = (achievement: any) => {
    const isCompleted = achievement.requirement(totalEntries, currentStreak, uniqueMoods, moodCounts);
    
    if (achievement.id === 'happy-gardener') {
      return isCompleted ? 10 : (moodCounts.happy || 0);
    }
    if (achievement.id === 'calm-spirit') {
      return isCompleted ? 10 : (moodCounts.calm || 0);
    }
    if (achievement.id === 'energy-master') {
      return isCompleted ? 10 : (moodCounts.energetic || 0);
    }
    if (achievement.id === 'peaceful-soul') {
      return isCompleted ? 10 : (moodCounts.peaceful || 0);
    }
    
    if (achievement.id === 'colorful-garden') {
      return isCompleted ? 7 : uniqueMoods;
    }
    
    if (achievement.id === 'mood-explorer') {
      return isCompleted ? 6 : uniqueMoods;
    }
    
    if (achievement.id === 'garden-master') {
      const streakTarget = 15;
      const entryTarget = 50;
      const streakProgress = currentStreak / streakTarget;
      const entryProgress = totalEntries / entryTarget;
      
      if (streakProgress <= entryProgress) {
        return `${currentStreak}/${streakTarget} streak`;
      } else {
        return `${totalEntries}/${entryTarget} entries`;
      }
    }
    
    const target = parseInt(achievement.description.match(/\d+/)?.[0] || '0');
    
    if (isCompleted) {
      return target;
    }
    
    if (achievement.id.includes('streak') || achievement.id.includes('day') || achievement.id === 'weekly-warrior' || achievement.id === 'daily-habit' || achievement.id === 'streak-master' || achievement.id === 'consistency-champion' || achievement.id === 'marathon-runner' || achievement.id === 'legendary-tracker') {
      return currentStreak;
    } else {
      return totalEntries;
    }
  };
  
  const getTargetValue = (achievement: any) => {
    if (achievement.id === 'happy-gardener' || achievement.id === 'calm-spirit' || achievement.id === 'energy-master' || achievement.id === 'peaceful-soul') return 10;
    if (achievement.id === 'colorful-garden') return 7;
    if (achievement.id === 'mood-explorer') return 6;
    if (achievement.id === 'garden-master') return 'Both targets';
    
    return parseInt(achievement.description.match(/\d+/)?.[0] || '0');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const isCompleted = achievement.requirement(totalEntries, currentStreak, uniqueMoods, moodCounts);
          const progress = getProgress(achievement);
          const currentValue = getCurrentValue(achievement);
          const targetValue = getTargetValue(achievement);
          
          return (
            <Card key={achievement.id} className={`relative transition-all duration-200 ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'hover:shadow-md'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {achievement.description}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {currentValue} / {targetValue}
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-3 ${isCompleted ? 'bg-green-100 dark:bg-green-900' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% Complete</span>
                    {isCompleted && (
                      <span className="text-green-600 font-medium">✓ Achieved</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {achievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
          <p className="text-muted-foreground">Start logging your moods to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsDisplay;
