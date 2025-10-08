
import React from 'react';
import { MoodEntry } from '@/types/mood';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useMood } from '@/contexts/MoodContext';

interface MoodEntryCardProps {
  entry: MoodEntry;
  highlight?: string;
}

const moodColorMap = {
  angry: '#ff6b6b',
  energetic: '#ffa502',
  happy: '#feca57',
  peaceful: '#2ecc71',
  calm: '#3498db',
  anxious: '#9b59b6',
  sad: '#74b9ff', // Fixed to match MoodSelector
};

const MoodEntryCard: React.FC<MoodEntryCardProps> = ({ entry, highlight }) => {
  const { deleteMoodEntry } = useMood();
  const q = (highlight || '').trim().toLowerCase();
  const highlightText = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{match}</mark>
        {after}
      </>
    ) as unknown as string;
  };
  
  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: moodColorMap[entry.mood] }}
      />
      
      <CardContent className="pt-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: moodColorMap[entry.mood] }} 
            />
            <h3 className="font-medium capitalize">{entry.mood}</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
          </span>
        </div>
        
        <div className="text-sm mt-2 text-muted-foreground line-clamp-3">
          {entry.journalText ? highlightText(entry.journalText) : <em>No journal entry</em>}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(entry.timestamp).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => deleteMoodEntry(entry.id)}
          className="text-xs h-7 px-2"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodEntryCard;
