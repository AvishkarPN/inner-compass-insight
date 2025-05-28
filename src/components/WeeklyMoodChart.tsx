
import React, { useState } from 'react';
import { WeeklyMoodData } from '@/types/mood';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const moodColorMap = {
  angry: '#ff6b6b',
  energetic: '#ffa502',
  happy: '#feca57',
  sad: '#74b9ff', // Fixed to match MoodSelector
  calm: '#3498db',
  anxious: '#9b59b6',
};

const moodDescriptions = {
  angry: 'Angry',
  energetic: 'Energetic',
  happy: 'Happy',
  sad: 'Sad',
  calm: 'Calm',
  anxious: 'Anxious',
};

interface WeeklyMoodChartProps {
  data: WeeklyMoodData[];
}

export default function WeeklyMoodChart({ data }: WeeklyMoodChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  return (
    <div>
      <div className="flex items-end justify-between h-[200px] gap-1">
        {data.map((dayData, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="flex flex-col items-center flex-1"
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="w-full h-full flex items-end justify-center pb-2">
                    {dayData.mood ? (
                      <div 
                        className={`
                          w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out
                          ${hoveredDay === index ? 'scale-105 shadow-lg' : ''}
                          animate-fade-in
                        `}
                        style={{ 
                          backgroundColor: moodColorMap[dayData.mood],
                          height: '120px',
                          boxShadow: hoveredDay === index ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <div className={`
                        w-full max-w-[40px] h-[30px] bg-gray-200 dark:bg-gray-700 rounded-t-lg opacity-40
                        ${hoveredDay === index ? 'opacity-60' : ''}
                        animate-fade-in
                      `}></div>
                    )}
                  </div>
                  <span className={`
                    text-xs font-medium pt-2 transition-all duration-300
                    ${hoveredDay === index ? 'text-primary font-semibold' : ''}
                  `}>
                    {dayData.day}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="px-3 py-2">
                {dayData.mood ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColorMap[dayData.mood] }} />
                      <span className="font-medium">{moodDescriptions[dayData.mood]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{dayData.day}</span>
                  </div>
                ) : (
                  <span>No mood recorded</span>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Object.entries(moodColorMap).map(([mood, color]) => (
          <div key={mood} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }} 
            />
            <span className="text-xs capitalize">{mood}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
