
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MoodSelector from '@/components/MoodSelector';
import MoodEntryCard from '@/components/MoodEntryCard';
import MoodGarden from '@/components/MoodGarden';
import JournalEditor from '@/components/JournalEditor';
import { MoodType } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, Sprout, History, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const { addMoodEntry, recentMoods } = useMood();
  const { toast } = useToast();
  
  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    
    // Automatically save the mood without requiring journal entry
    addMoodEntry(mood, '');
    toast({
      title: 'Mood Logged',
      description: `Your ${mood} mood has been recorded!`,
    });
    
    // Reset the selection after a brief moment
    setTimeout(() => setSelectedMood(undefined), 500);
  };

  const handleJournalSave = (text: string) => {
    if (selectedMood) {
      addMoodEntry(selectedMood, text);
      toast({
        title: 'Entry Saved',
        description: 'Your mood and journal entry have been saved!',
      });
    } else {
      toast({
        title: 'Please select a mood first',
        description: 'Choose how you\'re feeling before writing your entry.',
        variant: 'destructive'
      });
    }
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

          <Card className="border shadow-md overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BookOpen size={18} />
                Journal Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <JournalEditor onSave={handleJournalSave} />
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
                  Your Garden
                </span>
                <Link to="/insights" className="text-sm text-primary flex items-center hover:underline">
                  View Insights <ChevronRight size={16} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(320px-65px)] relative">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
