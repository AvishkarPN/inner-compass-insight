
import React, { useState } from 'react';
import { MoodEntry } from '@/types/mood';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Brain, TrendingUp, Calendar, Palette } from 'lucide-react';

interface MoodInsightsProps {
  entries: MoodEntry[];
  timeFrame: string;
}

const MoodInsights: React.FC<MoodInsightsProps> = ({ entries, timeFrame }) => {
  const [selectedInsight, setSelectedInsight] = useState<string>('overall');

  const generateInsights = () => {
    if (entries.length === 0) {
      return {
        overall: "No mood data available for this period. Start logging your moods to see personalized insights!",
        patterns: "Not enough data to identify patterns yet.",
        trends: "Begin tracking to discover your emotional trends.",
        colors: "Your mood canvas will be more vibrant as you add more entries."
      };
    }

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const totalEntries = entries.length;
    const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    const moodVariety = Object.keys(moodCounts).length;
    const averageEntriesPerDay = timeFrame === 'day' ? totalEntries : 
                                timeFrame === 'week' ? totalEntries / 7 :
                                timeFrame === 'month' ? totalEntries / 30 :
                                totalEntries / Math.max(1, getDaysBetween(entries));

    // Generate insights
    const insights = {
      overall: generateOverallInsight(dominantMood, totalEntries, moodVariety, timeFrame),
      patterns: generatePatternsInsight(moodCounts, totalEntries, timeFrame),
      trends: generateTrendsInsight(entries, averageEntriesPerDay),
      colors: generateColorsInsight(moodCounts, moodVariety)
    };

    return insights;
  };

  const generateOverallInsight = (dominantMood: string, total: number, variety: number, period: string) => {
    const moodDescriptions: Record<string, string> = {
      happy: "joy and positivity",
      calm: "peace and tranquility", 
      energetic: "vitality and enthusiasm",
      sad: "introspection and emotional processing",
      anxious: "heightened awareness and sensitivity",
      angry: "passion and strong feelings"
    };

    const description = moodDescriptions[dominantMood] || "emotional awareness";
    
    if (total === 1) {
      return `You've started your mood tracking journey! Your single entry shows ${description}. Keep logging to build a richer emotional picture.`;
    }

    if (variety === 1) {
      return `Your mood canvas for ${period} shows consistency in ${description}. This sustained emotional state suggests stability in this area of your life.`;
    }

    if (variety <= 3) {
      return `Your emotional landscape for ${period} centers around ${description}, with ${variety} different moods captured. This shows focused emotional experiences with some variation.`;
    }

    return `Your mood canvas for ${period} reveals a rich emotional tapestry with ${variety} different moods, predominantly featuring ${description}. This diversity suggests you're experiencing a full range of emotions and staying emotionally aware.`;
  };

  const generatePatternsInsight = (moodCounts: Record<string, number>, total: number, period: string) => {
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const topMood = sortedMoods[0];
    const percentage = Math.round((topMood[1] / total) * 100);

    if (sortedMoods.length === 1) {
      return `You've maintained ${topMood[0]} mood consistently during ${period}. Consider exploring what factors contribute to this emotional state.`;
    }

    if (percentage > 60) {
      return `${topMood[0]} dominates your emotional pattern (${percentage}% of entries), suggesting this is your primary emotional state during ${period}. The remaining ${100 - percentage}% shows emotional flexibility.`;
    }

    if (percentage < 30) {
      return `Your emotions are well-balanced across different states, with no single mood dominating. This suggests emotional adaptability and responsiveness to different situations.`;
    }

    return `${topMood[0]} is your most frequent mood (${percentage}% of entries), while you've also experienced ${sortedMoods.length - 1} other emotional states. This shows both stability and emotional range.`;
  };

  const generateTrendsInsight = (entries: MoodEntry[], avgPerDay: number) => {
    if (entries.length < 3) {
      return "Track more moods to identify meaningful trends in your emotional patterns.";
    }

    const recentEntries = entries.slice(-3);
    const earlierEntries = entries.slice(0, -3);
    
    if (earlierEntries.length === 0) {
      return "Your recent entries show you're actively engaging with mood tracking. Continue this practice to identify trends over time.";
    }

    // Simple trend analysis
    const positiveStates = ['happy', 'calm', 'energetic'];
    const recentPositive = recentEntries.filter(e => positiveStates.includes(e.mood)).length;
    const earlierPositive = earlierEntries.filter(e => positiveStates.includes(e.mood)).length;
    
    const recentPositiveRatio = recentPositive / recentEntries.length;
    const earlierPositiveRatio = earlierPositive / earlierEntries.length;

    if (avgPerDay >= 1) {
      if (recentPositiveRatio > earlierPositiveRatio) {
        return "Your tracking shows an upward trend in positive emotions recently. You're maintaining consistent daily tracking, which helps identify these positive patterns.";
      } else if (recentPositiveRatio < earlierPositiveRatio) {
        return "Recent entries suggest you're navigating some challenges. Your consistent tracking helps you stay aware of these patterns and can guide supportive actions.";
      }
    }

    return "Your mood tracking reveals natural emotional rhythms. The consistency in your entries helps create a clear picture of your emotional landscape over time.";
  };

  const generateColorsInsight = (moodCounts: Record<string, number>, variety: number) => {
    const colorMappings: Record<string, string> = {
      happy: "warm yellows and golds",
      calm: "soothing greens",
      energetic: "vibrant oranges",
      sad: "cool blues",
      anxious: "soft purples",
      angry: "intense reds"
    };

    if (variety === 1) {
      const mood = Object.keys(moodCounts)[0];
      return `Your mood canvas is painted primarily in ${colorMappings[mood] || 'single tones'}, creating a cohesive and focused artistic expression of your emotional state.`;
    }

    if (variety <= 3) {
      const colors = Object.keys(moodCounts).map(mood => colorMappings[mood] || mood).join(', ');
      return `Your artwork features a harmonious blend of ${colors}, creating a balanced and aesthetically pleasing mood canvas that reflects your emotional range.`;
    }

    return `Your mood canvas bursts with a full spectrum of colors - from ${Object.keys(moodCounts).slice(0, 3).map(mood => colorMappings[mood] || mood).join(', ')} and beyond. This creates a vibrant, complex artwork that mirrors the richness of your emotional experience.`;
  };

  const getDaysBetween = (entries: MoodEntry[]) => {
    if (entries.length < 2) return 1;
    const dates = entries.map(e => new Date(e.timestamp).toDateString());
    const uniqueDates = new Set(dates);
    return uniqueDates.size;
  };

  const insights = generateInsights();

  const insightOptions = [
    { value: 'overall', label: 'Overall Analysis', icon: Brain },
    { value: 'patterns', label: 'Mood Patterns', icon: TrendingUp },
    { value: 'trends', label: 'Emotional Trends', icon: Calendar },
    { value: 'colors', label: 'Canvas Colors', icon: Palette }
  ];

  const selectedOption = insightOptions.find(option => option.value === selectedInsight);
  const SelectedIcon = selectedOption?.icon || Brain;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SelectedIcon className="w-5 h-5" />
          Canvas Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedInsight} onValueChange={setSelectedInsight}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select insight type" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg">
            {insightOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground leading-relaxed">
            {insights[selectedInsight as keyof typeof insights]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodInsights;
