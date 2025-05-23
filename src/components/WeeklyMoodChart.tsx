
import React from 'react';
import { WeeklyMoodData } from '@/types/mood';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const moodColorMap = {
  angry: '#ff6b6b',
  energetic: '#ffa502',
  happy: '#feca57',
  peaceful: '#2ecc71',
  calm: '#3498db',
  anxious: '#9b59b6',
};

interface WeeklyMoodChartProps {
  data: WeeklyMoodData[];
}

export default function WeeklyMoodChart({ data }: WeeklyMoodChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Mood Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-[200px] gap-1">
          {data.map((dayData, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full h-full flex items-end justify-center pb-2">
                {dayData.mood ? (
                  <div 
                    className="w-full max-w-[40px] h-[120px] rounded-t-lg transition-all duration-500 ease-out animate-float"
                    style={{ 
                      backgroundColor: moodColorMap[dayData.mood],
                      height: '120px',
                    }}
                  />
                ) : (
                  <div className="w-full max-w-[40px] h-[30px] bg-gray-200 dark:bg-gray-700 rounded-t-lg opacity-40"></div>
                )}
              </div>
              <span className="text-xs font-medium pt-2">
                {dayData.day}
              </span>
            </div>
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
      </CardContent>
    </Card>
  );
}
