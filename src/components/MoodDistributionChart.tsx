
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';

const MoodDistributionChart = () => {
  const { moodEntries } = useMood();

  // Calculate mood distribution
  const distribution = moodEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);

  const data = Object.entries(distribution).map(([mood, count]) => ({
    mood: mood as MoodType,
    name: `${MOOD_EMOJIS[mood as MoodType]} ${MOOD_LABELS[mood as MoodType]}`,
    value: count,
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
              fill={MOOD_COLORS[entry.mood]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MoodDistributionChart;
