
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import MoodEntryCard from '@/components/MoodEntryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const History = () => {
  const { moodEntries } = useMood();
  
  // Sort entries by date (newest first)
  const sortedEntries = [...moodEntries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const entriesByDate: Record<string, typeof moodEntries> = {};
  
  // Group entries by date
  sortedEntries.forEach(entry => {
    const dateStr = new Date(entry.timestamp).toLocaleDateString();
    if (!entriesByDate[dateStr]) {
      entriesByDate[dateStr] = [];
    }
    entriesByDate[dateStr].push(entry);
  });
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mood History</h1>
      
      {Object.keys(entriesByDate).length > 0 ? (
        Object.entries(entriesByDate).map(([date, entries]) => (
          <Card key={date} className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(entry => (
                  <MoodEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>No mood entries found</p>
            <p className="text-sm mt-1">Start tracking your mood on the dashboard</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
