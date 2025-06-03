
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MoodSelector from '@/components/MoodSelector';
import MoodEntryCard from '@/components/MoodEntryCard';
import MoodGarden from '@/components/MoodGarden';
import JournalEditor from '@/components/JournalEditor';
import { MoodType } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, Sprout, History, Save } from 'lucide-react';

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [journalText, setJournalText] = useState('');
  const { addMoodEntry, recentMoods } = useMood();
  const { toast } = useToast();
  
  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleJournalChange = (text: string) => {
    setJournalText(text);
  };

  const handleSaveEntry = () => {
    if (!selectedMood) {
      toast({
        title: 'Please select a mood',
        description: 'Choose how you\'re feeling before saving your entry.',
        variant: 'destructive'
      });
      return;
    }

    if (!journalText.trim()) {
      toast({
        title: 'Please add a journal entry',
        description: 'Write something about your day before saving.',
        variant: 'destructive'
      });
      return;
    }

    addMoodEntry(selectedMood, journalText);
    toast({
      title: 'Entry Saved',
      description: 'Your mood and journal entry have been saved!',
    });

    // Reset form
    setSelectedMood(undefined);
    setJournalText('');
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main content area - spans full width on mobile, 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="border shadow-md overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-medium">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
            </CardContent>
          </Card>

          <Card className="border shadow-md overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-medium">Journal Entry</CardTitle>
              <Button 
                onClick={handleSaveEntry}
                disabled={!selectedMood || !journalText.trim()}
                className="flex items-center gap-2 w-full sm:w-auto text-sm"
                size="sm"
              >
                <Save size={14} />
                Save Entry
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <JournalEditor 
                value={journalText}
                onChange={handleJournalChange}
                placeholder="Write about your day..."
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar content - full width on mobile, 1 column on large screens */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="border shadow-md h-[280px] sm:h-[320px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30 px-3 sm:px-6">
              <CardTitle className="flex justify-between items-center text-sm sm:text-base">
                <span className="flex items-center gap-1.5">
                  <Sprout size={16} className="sm:w-[18px] sm:h-[18px] text-green-500" />
                  Your Garden
                </span>
                <Link to="/insights" className="text-xs sm:text-sm text-primary flex items-center hover:underline">
                  View Insights <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(280px-65px)] sm:h-[calc(320px-65px)] relative">
              <MoodGarden />
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30 px-3 sm:px-6">
              <CardTitle className="flex justify-between items-center text-sm sm:text-base">
                <span className="flex items-center gap-1.5">
                  <History size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Recent Entries
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3">
                {recentMoods.length > 0 ? (
                  recentMoods.slice(0, 3).map(entry => (
                    <MoodEntryCard key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="text-center py-4 sm:py-6 text-muted-foreground">
                    <p className="text-sm">No mood entries yet</p>
                    <p className="text-xs sm:text-sm mt-1">Start tracking your mood to see your entries here</p>
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
