
import React, { useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import MoodEntryCard from '@/components/MoodEntryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const History = () => {
  const { moodEntries } = useMood();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  
  // Filter entries by date range if selected
  const filteredEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    let includeEntry = true;
    
    if (dateFrom) {
      dateFrom.setHours(0, 0, 0, 0);
      includeEntry = includeEntry && entryDate >= dateFrom;
    }
    
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      includeEntry = includeEntry && entryDate <= endOfDay;
    }
    
    return includeEntry;
  });
  
  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
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
  
  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Mood History</h1>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PP') : <span>From date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PP') : <span>To date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
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
            <p>No mood entries found for the selected period</p>
            {dateFrom || dateTo ? (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            ) : (
              <p className="text-sm mt-1">Start tracking your mood on the dashboard</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
