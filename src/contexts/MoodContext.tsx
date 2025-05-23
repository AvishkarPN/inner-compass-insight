
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodEntry, MoodType, WeeklyMoodData } from '../types/mood';
import { v4 as uuidv4 } from 'uuid';

interface MoodContextType {
  moodEntries: MoodEntry[];
  addMoodEntry: (mood: MoodType, journalText: string) => void;
  deleteMoodEntry: (id: string) => void;
  getWeeklyMoodData: () => WeeklyMoodData[];
  recentMoods: MoodEntry[];
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }
    return [];
  });
  
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  
  useEffect(() => {
    // Save to localStorage whenever mood entries change
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    
    // Update recent moods (last 5)
    const sorted = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setRecentMoods(sorted.slice(0, 5));
  }, [moodEntries]);
  
  const addMoodEntry = (mood: MoodType, journalText: string) => {
    const newEntry: MoodEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      mood,
      journalText,
      // Simple sentiment scoring could be added here in future
    };
    
    setMoodEntries((prev) => [...prev, newEntry]);
  };
  
  const deleteMoodEntry = (id: string) => {
    setMoodEntries((prev) => prev.filter(entry => entry.id !== id));
  };
  
  // Get mood data for the past 7 days
  const getWeeklyMoodData = (): WeeklyMoodData[] => {
    const data: WeeklyMoodData[] = [];
    const today = new Date();
    
    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Find mood entry for this day
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const entriesForDay = moodEntries.filter(entry => 
        entry.timestamp >= dayStart && entry.timestamp <= dayEnd
      );
      
      // Use the last entry of the day if multiple
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
    recentMoods
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
