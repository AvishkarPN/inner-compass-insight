import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodEntry, MoodType, WeeklyMoodData } from '../types/mood';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { reminderService } from '@/utils/reminderService';

interface MoodContextType {
  moodEntries: MoodEntry[];
  addMoodEntry: (mood: MoodType, journalText: string) => void;
  deleteMoodEntry: (id: string) => void;
  getWeeklyMoodData: () => WeeklyMoodData[];
  recentMoods: MoodEntry[];
  syncing: boolean;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [localDataMigrated, setLocalDataMigrated] = useState(false);

  // Initialize reminder service
  useEffect(() => {
    reminderService.initialize();
  }, []);

  // Load local data on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        const localEntries = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setMoodEntries(localEntries);
      } catch (error) {
        console.error('Error loading local mood entries:', error);
      }
    }
  }, []);

  // Sync with Supabase when user signs in
  useEffect(() => {
    if (user && session && !localDataMigrated) {
      syncWithSupabase();
    } else if (!user) {
      // User signed out, keep local data but clear migration flag
      setLocalDataMigrated(false);
    }
  }, [user, session, localDataMigrated]);

  // Update recent moods when entries change
  useEffect(() => {
    const sorted = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setRecentMoods(sorted.slice(0, 5));
  }, [moodEntries]);

  const syncWithSupabase = async () => {
    if (!user) return;
    
    setSyncing(true);
    
    try {
      // Fetch existing mood entries from Supabase cloud storage
      const { data: existingEntries, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) {
        console.error('Error fetching mood entries:', fetchError);
        toast({
          title: 'Sync Error',
          description: 'Failed to load your cloud data.',
          variant: 'destructive'
        });
        setSyncing(false);
        return;
      }

      // If user has existing data in Supabase, use that (override local)
      if (existingEntries && existingEntries.length > 0) {
        const supabaseEntries: MoodEntry[] = existingEntries.map(entry => ({
          id: entry.id,
          timestamp: new Date(entry.timestamp),
          mood: entry.mood as MoodType,
          journalText: entry.notes || ''
        }));
        
        setMoodEntries(supabaseEntries);
        
        toast({
          title: 'Data Synced',
          description: 'Your cloud data has been loaded.'
        });
      } else {
        // No data in Supabase, migrate local data
        const localEntries = [...moodEntries];
        if (localEntries.length > 0) {
          await migrateLocalDataToSupabase(localEntries);
        }
      }
      
      setLocalDataMigrated(true);
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync your data.',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const migrateLocalDataToSupabase = async (localEntries: MoodEntry[]) => {
    if (!user || localEntries.length === 0) return;

    try {
      const entriesToInsert = localEntries.map(entry => ({
        id: entry.id,
        user_id: user.id,
        mood: entry.mood,
        notes: entry.journalText,
        timestamp: entry.timestamp.toISOString(),
        created_at: entry.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('mood_entries')
        .insert(entriesToInsert);

      if (error) {
        console.error('Error migrating data:', error);
        throw error;
      }

      toast({
        title: 'Data Migrated',
        description: `${localEntries.length} mood entries have been saved to your account.`
      });
    } catch (error) {
      console.error('Error migrating local data:', error);
      throw error;
    }
  };

  const addMoodEntry = async (mood: MoodType, journalText: string) => {
    const newEntry: MoodEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      mood,
      journalText,
    };
    
    // Update local state immediately
    setMoodEntries((prev) => [...prev, newEntry]);
    
    // Save to localStorage for offline access
    const updatedEntries = [...moodEntries, newEntry];
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    
    // Clear any reminder dismissal for today since user just added an entry
    const today = new Date();
    localStorage.removeItem(`reminder-dismissed-${today.toDateString()}`);
    
    // If user is signed in, also save to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('mood_entries')
          .insert({
            id: newEntry.id,
            user_id: user.id,
            mood: newEntry.mood,
            notes: newEntry.journalText,
            timestamp: newEntry.timestamp.toISOString(),
            created_at: newEntry.timestamp.toISOString()
          });

        if (error) {
          console.error('Error saving to Supabase:', error);
          toast({
            title: 'Sync Warning',
            description: 'Mood saved locally, but failed to sync to cloud.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error saving mood entry:', error);
      }
    }
  };
  
  const deleteMoodEntry = async (id: string) => {
    // Update local state
    setMoodEntries((prev) => prev.filter(entry => entry.id !== id));
    
    // Update localStorage
    const updatedEntries = moodEntries.filter(entry => entry.id !== id);
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    
    // If user is signed in, also delete from Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('mood_entries')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting from Supabase:', error);
          toast({
            title: 'Sync Warning',
            description: 'Mood deleted locally, but failed to sync to cloud.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting mood entry:', error);
      }
    }
  };
  
  // Get mood data for the past 7 days
  const getWeeklyMoodData = (): WeeklyMoodData[] => {
    const data: WeeklyMoodData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const entriesForDay = moodEntries.filter(entry => 
        entry.timestamp >= dayStart && entry.timestamp <= dayEnd
      );
      
      const lastEntry = entriesForDay[entriesForDay.length - 1];
      
      data.push({
        day: dayStr,
        mood: lastEntry ? lastEntry.mood : null
      });
    }
    
    return data;
  };
  
  const value = {
    moodEntries,
    addMoodEntry,
    deleteMoodEntry,
    getWeeklyMoodData,
    recentMoods,
    syncing
  };
  
  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
