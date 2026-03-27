
import React, { useState } from 'react';
import { WeeklyMoodData } from '@/types/mood';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';

// A2: Use canonical colors — no more local moodColorMap
interface WeeklyMoodChartProps {
  data: WeeklyMoodData[];
}

export default function WeeklyMoodChart({ data }: WeeklyMoodChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  return (
    <div>
      {/* Bar chart */}
      <div className="flex items-end justify-between h-[200px] gap-1" role="img" aria-label="Weekly mood overview bar chart">
        {data.map((dayData, index) => {
          const isMoodDay = dayData.mood !== null;
          const color = isMoodDay ? MOOD_COLORS[dayData.mood!] : undefined;
          const isHovered = hoveredDay === index;

          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex flex-col items-center flex-1 cursor-default"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    role="presentation"
                  >
                    <div className="w-full h-full flex items-end justify-center pb-2">
                      {isMoodDay ? (
                        <div
                          className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${isHovered ? 'scale-105' : ''} animate-fade-in`}
                          style={{
                            backgroundColor: color,
                            height: '120px',
                            boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.08)'
                          }}
                          aria-label={`${dayData.day}: ${MOOD_LABELS[dayData.mood!]}`}
                        />
                      ) : (
                        /* #22: empty day — labelled "no entry" instead of an artifact */
                        <div
                          className={`w-full max-w-[40px] flex flex-col items-center justify-end gap-0.5 transition-opacity ${isHovered ? 'opacity-70' : 'opacity-30'}`}
                          aria-label={`${dayData.day}: no entry`}
                        >
                          <span className="text-[9px] text-muted-foreground leading-none">no entry</span>
                          <div className="w-full h-4 bg-muted rounded-t-sm" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium pt-2 transition-all duration-300 ${isHovered ? 'text-primary font-semibold' : ''}`}>
                      {dayData.day}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="px-3 py-2">
                  {dayData.mood ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span aria-hidden="true">{MOOD_EMOJIS[dayData.mood]}</span>
                        <span className="font-medium">{MOOD_LABELS[dayData.mood]}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{dayData.day}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No mood recorded</span>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Colour legend */}
      <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Mood colour legend">
        {(Object.entries(MOOD_COLORS) as [string, string][]).map(([mood, color]) => (
          <div key={mood} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
            <span className="text-xs capitalize">{MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
