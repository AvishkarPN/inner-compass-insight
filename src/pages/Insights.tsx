
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeeklyMoodChart from '@/components/WeeklyMoodChart';
import { useMood } from '@/contexts/MoodContext';
import MoodDistributionChart from '@/components/MoodDistributionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, BookOpen, Brain, Download } from 'lucide-react';
import JournalInsights from '@/components/JournalInsights';

const Insights = () => {
  const { getWeeklyMoodData, moodEntries } = useMood();
  const weeklyData = getWeeklyMoodData();
  
  // Handle export insights as JSON
  const handleExportInsights = () => {
    const insights = {
      weeklyData,
      totalEntries: moodEntries.length,
      exportDate: new Date().toISOString(),
      moodEntries: moodEntries.map(entry => ({
        mood: entry.mood,
        timestamp: entry.timestamp,
        sentimentScore: entry.sentimentScore
      }))
    };
    
    const dataStr = JSON.stringify(insights, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.download = `mood-insights-${new Date().toISOString().slice(0, 10)}.json`;
    link.href = URL.createObjectURL(dataBlob);
    link.click();
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Mood Insights</h1>
          <p className="text-muted-foreground">Analyze your mood patterns and journal entries</p>
        </div>
        <Button onClick={handleExportInsights} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Insights
        </Button>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-6">
        <div className="bg-white dark:bg-gray-900 p-1 rounded-lg shadow-sm w-fit">
          <TabsList>
            <TabsTrigger value="charts" className="flex gap-1.5 items-center">
              <BarChart size={16} />
              <span>Charts</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex gap-1.5 items-center">
              <Brain size={16} />
              <span>Analysis</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart size={18} className="text-primary" />
                  Weekly Mood Overview
                </CardTitle>
                <CardDescription>Your mood trends over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyMoodChart data={weeklyData} />
              </CardContent>
            </Card>
            
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={18} className="text-primary" />
                  Mood Distribution
                </CardTitle>
                <CardDescription>Breakdown of your recorded moods</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodDistributionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                Journal Analysis
              </CardTitle>
              <CardDescription>Insights derived from your journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <JournalInsights />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
