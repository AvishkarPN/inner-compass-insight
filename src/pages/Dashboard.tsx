
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MoodSelector from '@/components/MoodSelector';
import JournalEditor from '@/components/JournalEditor';
import MoodEntryCard from '@/components/MoodEntryCard';
import MoodGarden from '@/components/MoodGarden';
import { MoodType } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, Sprout, History } from 'lucide-react';

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const { addMoodEntry, recentMoods } = useMood();
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
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area - spans 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-md overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-lg font-medium">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-lg font-medium">Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <JournalEditor onSave={handleSaveJournal} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar content - spans 1 column on large screens */}
        <div className="space-y-6">
          <Card className="border shadow-md h-[320px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Sprout size={18} className="text-green-500" />
                  Your Companion
                </span>
                <Link to="/insights" className="text-sm text-primary flex items-center hover:underline">
                  View Insights <ChevronRight size={16} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(320px-65px)]">
              <MoodGarden />
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <History size={18} />
                  Recent Entries
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentMoods.length > 0 ? (
                  recentMoods.slice(0, 3).map(entry => (
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
                <Button variant="outline" asChild className="shadow-sm w-full">
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
