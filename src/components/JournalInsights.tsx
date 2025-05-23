
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, AlertCircle, TrendingUp, Heart, Brain, Award } from 'lucide-react';

const JournalInsights = () => {
  const { moodEntries } = useMood();
  
  // Filter out entries that have journal text
  const journalEntries = moodEntries.filter(entry => entry.journalText.trim().length > 0);
  
  if (journalEntries.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No journal entries yet</AlertTitle>
        <AlertDescription>
          Start writing in your journal to receive personalized insights about your thoughts and behavior patterns.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get the total number of words written
  const totalWords = journalEntries.reduce((total, entry) => {
    return total + entry.journalText.split(/\s+/).filter(Boolean).length;
  }, 0);
  
  // Find the most common time of day for journaling
  const timeOfDayCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  journalEntries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (hour >= 5 && hour < 12) timeOfDayCount.morning++;
    else if (hour >= 12 && hour < 17) timeOfDayCount.afternoon++;
    else if (hour >= 17 && hour < 22) timeOfDayCount.evening++;
    else timeOfDayCount.night++;
  });
  
  const preferredTime = Object.entries(timeOfDayCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  // Calculate average journal length (in words)
  const avgLength = Math.round(totalWords / journalEntries.length);
  
  // Generate basic insights based on available data
  const generateMockInsights = () => {
    // These are simplified mock insights - in a real app, this would use natural language processing
    const insights = [
      {
        title: "Writing Patterns",
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        content: `You typically write ${avgLength < 30 ? 'brief' : avgLength < 100 ? 'moderate' : 'lengthy'} journal entries, with an average of ${avgLength} words per entry. ${avgLength < 30 ? 'Consider expanding your thoughts to gain deeper insights.' : avgLength > 200 ? 'Your detailed entries show deep reflection.' : 'This is a good balance for regular journaling.'}`
      },
      {
        title: "Timing Preference",
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        content: `You tend to journal most often during the ${preferredTime}. This may indicate when you have the most mental clarity or emotional availability for reflection.`
      }
    ];
    
    // Add mood-related insight if we have enough entries
    if (journalEntries.length >= 3) {
      // Get mood distribution
      const moodDistribution = journalEntries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Find most common mood
      let dominantMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0][0];
      
      insights.push({
        title: "Emotional Patterns",
        icon: <Heart className="h-5 w-5 text-red-500" />,
        content: `Your journal entries often reflect a ${dominantMood} mood state. Consider exploring what factors contribute to this emotional pattern in your life.`
      });
    }
    
    // Add consistency insight if we have enough entries
    if (journalEntries.length >= 5) {
      insights.push({
        title: "Consistency",
        icon: <Award className="h-5 w-5 text-green-500" />,
        content: `You've maintained a journal practice with ${journalEntries.length} entries so far. Consistent reflection is linked to greater self-awareness and emotional regulation.`
      });
    }
    
    return insights;
  };
  
  const insights = generateMockInsights();
  
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground italic">
        <p className="flex items-center gap-1.5">
          <Brain className="h-4 w-4" />
          Insights are based on patterns detected in your journal entries
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="bg-muted/30 border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              {insight.icon}
              <h3 className="font-medium">{insight.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{insight.content}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Reflection Prompt</p>
        <p className="text-blue-700 dark:text-blue-300">
          Next time you journal, try reflecting on how your environment affects your mood and thought patterns. Notice what external factors might be influencing your emotional state.
        </p>
      </div>
    </div>
  );
};

export default JournalInsights;
