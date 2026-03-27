
import React, { useState, useMemo } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';
import { MoodType } from '@/types/mood';
import { DayPicker } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Smile } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MoodEntry } from '@/types/mood';
import 'react-day-picker/dist/style.css';

const Calendar = () => {
  const { moodEntries } = useMood();
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build a map: dateString → dominant mood
  const moodDayMap = useMemo(() => {
    const map: Record<string, MoodType> = {};
    // Count moods per day
    const dayMoodCount: Record<string, Record<string, number>> = {};
    moodEntries.forEach(entry => {
      const day = format(new Date(entry.timestamp), 'yyyy-MM-dd');
      if (!dayMoodCount[day]) dayMoodCount[day] = {};
      dayMoodCount[day][entry.mood] = (dayMoodCount[day][entry.mood] || 0) + 1;
    });
    // Find dominant mood for each day
    Object.entries(dayMoodCount).forEach(([day, counts]) => {
      map[day] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as MoodType;
    });
    return map;
  }, [moodEntries]);

  // Entries for selectedDay
  const selectedDayEntries: MoodEntry[] = useMemo(() => {
    if (!selectedDay) return [];
    return moodEntries.filter(e => isSameDay(new Date(e.timestamp), selectedDay));
  }, [selectedDay, moodEntries]);

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    setSelectedDay(day);
    const key = format(day, 'yyyy-MM-dd');
    if (moodDayMap[key]) setSheetOpen(true);
  };

  // Custom CSS for coloured days
  const modifiers = useMemo(() => {
    const mods: Record<string, Date[]> = {};
    Object.entries(moodDayMap).forEach(([dateStr, mood]) => {
      if (!mods[mood]) mods[mood] = [];
      mods[mood].push(new Date(dateStr));
    });
    return mods;
  }, [moodDayMap]);

  const modifiersStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    (Object.keys(MOOD_COLORS) as MoodType[]).forEach(mood => {
      styles[mood] = {
        backgroundColor: MOOD_COLORS[mood] + '40',
        borderRadius: '50%',
        fontWeight: 600,
      };
    });
    return styles;
  }, []);

  // Summary stats for the current month
  const monthStats = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const monthEntries = moodEntries.filter(e => {
      const d = new Date(e.timestamp);
      return d >= start && d <= end;
    });
    const counts = monthEntries.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { total: monthEntries.length, topMood, counts };
  }, [moodEntries, month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mood Calendar</h1>
          <p className="text-sm text-muted-foreground">See your emotional pattern across the month</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDayClick}
              month={month}
              onMonthChange={setMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              showOutsideDays
              className="mx-auto"
              styles={{
                caption: { fontSize: '1rem', fontWeight: 600 },
                day: { width: 40, height: 40, fontSize: '0.875rem', position: 'relative' },
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" aria-hidden="true" />,
                IconRight: () => <ChevronRight className="h-4 w-4" aria-hidden="true" />,
              }}
              footer={
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click a coloured day to see entries
                </p>
              }
            />
          </CardContent>
        </Card>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Month summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{format(month, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total entries</span>
                <span className="font-semibold">{monthStats.total}</span>
              </div>
              {monthStats.topMood && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dominant mood</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <span aria-hidden="true">{MOOD_EMOJIS[monthStats.topMood[0] as MoodType]}</span>
                    {MOOD_LABELS[monthStats.topMood[0] as MoodType]}
                  </span>
                </div>
              )}
              {monthStats.total === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No entries this month</p>
              )}
            </CardContent>
          </Card>

          {/* Mood breakdown */}
          {monthStats.total > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Mood Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(monthStats.counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const pct = Math.round((count / monthStats.total) * 100);
                    const color = MOOD_COLORS[mood as MoodType] ?? '#888';
                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <span aria-hidden="true">{MOOD_EMOJIS[mood as MoodType]}</span>
                            {MOOD_LABELS[mood as MoodType]}
                          </span>
                          <span className="text-muted-foreground">{count}× ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Colour legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1">
                <Smile size={14} aria-hidden="true" /> Mood Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.entries(MOOD_COLORS) as [MoodType, string][]).map(([mood, color]) => (
                  <div key={mood} className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span>{MOOD_EMOJIS[mood]} {MOOD_LABELS[mood]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Day detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : ''}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedDayEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No entries for this day.</p>
            ) : (
              selectedDayEntries.map(entry => (
                <div
                  key={entry.id}
                  className="rounded-lg border p-4 space-y-2"
                  style={{ borderLeftColor: MOOD_COLORS[entry.mood], borderLeftWidth: 3 }}
                >
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <span aria-hidden="true">{MOOD_EMOJIS[entry.mood]}</span>
                    <span style={{ color: MOOD_COLORS[entry.mood] }}>{MOOD_LABELS[entry.mood]}</span>
                    <span className="text-muted-foreground text-xs ml-auto">
                      {format(new Date(entry.timestamp), 'h:mm a')}
                    </span>
                  </div>
                  {entry.journalText && (
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {entry.journalText}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Calendar;
