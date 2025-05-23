
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyMoodChart from '@/components/WeeklyMoodChart';
import { useMood } from '@/contexts/MoodContext';
import MoodDistributionChart from '@/components/MoodDistributionChart';

const Insights = () => {
  const { getWeeklyMoodData, moodEntries } = useMood();
  const weeklyData = getWeeklyMoodData();
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mood Insights</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Weekly Mood Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyMoodChart data={weeklyData} />
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodDistributionChart />
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Mood Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Based on your mood entries, you tend to feel most positive in the morning. Consider activities that boost your mood during other times of day.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
