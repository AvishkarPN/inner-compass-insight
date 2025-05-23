
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MoodSelector from '@/components/MoodSelector';
import JournalEditor from '@/components/JournalEditor';
import WeeklyMoodChart from '@/components/WeeklyMoodChart';
import MoodEntryCard from '@/components/MoodEntryCard';
import { MoodType } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const { addMoodEntry, getWeeklyMoodData, recentMoods } = useMood();
  const { toast } = useToast();
  
  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };
  
  const handleSaveJournal = (journalText: string) => {
    if (!selectedMood) {
      toast({
        title: 'Mood Required',
        description: 'Please select a mood before saving your journal entry.',
        variant: 'destructive'
      });
      return;
    }
    
    addMoodEntry(selectedMood, journalText);
    toast({
      title: 'Entry Saved',
      description: 'Your mood and journal entry have been saved!',
    });
    
    // Reset the form
    setSelectedMood(undefined);
  };
  
  const weeklyData = getWeeklyMoodData();
  
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <JournalEditor onSave={handleSaveJournal} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <WeeklyMoodChart data={weeklyData} />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMoods.length > 0 ? (
                  recentMoods.map(entry => (
                    <MoodEntryCard key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No mood entries yet</p>
                    <p className="text-sm mt-1">Start tracking your mood to see your entries here</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/history">View All Entries</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
