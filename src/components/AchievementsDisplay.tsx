
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
  
  const totalEntries = moodEntries.length;
  const currentStreak = calculateStreak();
  
  const getProgress = (achievement: any) => {
    if (achievement.requirement(totalEntries, currentStreak)) {
      return 100;
    }
    
    // Calculate progress based on requirement type
    if (achievement.id.includes('streak') || achievement.id.includes('day')) {
      // Extract target number from description
      const target = parseInt(achievement.description.match(/\d+/)?.[0] || '0');
      return Math.min((currentStreak / target) * 100, 100);
    } else {
      // Entry-based achievements
      const target = parseInt(achievement.description.match(/\d+/)?.[0] || '0');
      return Math.min((totalEntries / target) * 100, 100);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const isCompleted = achievement.requirement(totalEntries, currentStreak);
          const progress = getProgress(achievement);
          
          return (
            <Card key={achievement.id} className={`relative transition-all duration-200 ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'hover:shadow-md'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
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
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${isCompleted ? 'bg-green-100 dark:bg-green-900' : ''}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsDisplay;
