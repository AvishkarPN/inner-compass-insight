
import React, { useMemo, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import MoodEntryCard from '@/components/MoodEntryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

const History = () => {
  const { moodEntries } = useMood();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  
  // Filter entries by date range if selected
  const filteredEntries = useMemo(() => moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    let includeEntry = true;

    if (dateFrom) {
      // A6 FIX: Avoid mutating the Date state object — create a copy first
      const d = new Date(dateFrom);
      d.setHours(0, 0, 0, 0);
      includeEntry = includeEntry && entryDate >= d;
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      includeEntry = includeEntry && entryDate <= endOfDay;
    }

    // Text/mood filter
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      const matchesMood = entry.mood.toLowerCase().includes(q);
      const matchesJournal = (entry.journalText || '').toLowerCase().includes(q);
      const matchesDate = new Date(entry.timestamp).toLocaleDateString().toLowerCase().includes(q);
      includeEntry = includeEntry && (matchesMood || matchesJournal || matchesDate);
    }

    return includeEntry;
  }), [moodEntries, dateFrom, dateTo, debouncedQuery]);
  
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
  
  // B10 #38 FIX: Clear resets ALL filters — dates AND text search
  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setQuery('');
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Mood History</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <div className="w-full sm:w-[220px] lg:w-[260px]">
            <Input
              placeholder="Search by mood, text, or date..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search mood history"
            />
            {debouncedQuery && (
              <p className="mt-1 text-xs text-muted-foreground">{filteredEntries.length} entries found</p>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[140px] lg:w-[180px] justify-start text-left font-normal text-xs sm:text-sm">
                <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
              <Button variant="outline" className="w-full sm:w-[140px] lg:w-[180px] justify-start text-left font-normal text-xs sm:text-sm">
                <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
          
          {(dateFrom || dateTo || debouncedQuery) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs sm:text-sm">
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {Object.keys(entriesByDate).length > 0 ? (
        Object.entries(entriesByDate).map(([date, entries]) => (
          <Card key={date} className="border shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(entry => (
                  <MoodEntryCard key={entry.id} entry={entry} highlight={debouncedQuery} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 sm:py-10 text-center text-muted-foreground px-3 sm:px-6">
            <p className="text-sm sm:text-base">No mood entries found for the selected period</p>
            {dateFrom || dateTo ? (
              <Button variant="link" onClick={clearFilters} className="mt-2 text-xs sm:text-sm">
                Clear filters
              </Button>
            ) : (
              <p className="text-xs sm:text-sm mt-1">Start tracking your mood on the dashboard</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
