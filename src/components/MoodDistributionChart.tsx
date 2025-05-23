
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';

const moodColorMap: Record<MoodType, string> = {
  angry: '#ff6b6b',
  energetic: '#ffa502',
  happy: '#feca57',
  peaceful: '#2ecc71',
  calm: '#3498db',
  anxious: '#9b59b6',
};

const MoodDistributionChart = () => {
  const { moodEntries } = useMood();
  
  // Calculate mood distribution
  const distribution = moodEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);
  
  const data = Object.entries(distribution).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count
  }));
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No mood data available yet</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          animationDuration={500}
          animationBegin={0}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={moodColorMap[entry.name.toLowerCase() as MoodType]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MoodDistributionChart;
