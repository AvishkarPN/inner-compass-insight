
import React, { useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodEntry } from '@/types/mood';
import MoodCanvas from '@/components/MoodCanvas';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Download, Calendar } from 'lucide-react';
import { getTimePeriodDescription } from '@/utils/artUtils';

const MoodArt = () => {
  const { moodEntries } = useMood();
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'all'>('week');
  
  // Filter entries based on selected timeframe
  const getFilteredEntries = () => {
    if (timeFrame === 'all') return moodEntries;
    
    const now = new Date();
    const cutoffDate = new Date(now);
    
    switch (timeFrame) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }
    
    return moodEntries.filter(entry => new Date(entry.timestamp) >= cutoffDate);
  };
  
  const filteredEntries = getFilteredEntries();
  const timePeriod = getTimePeriodDescription(filteredEntries);
  
  // Handle download canvas as image
  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `mood-art-${timeFrame}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  // Handle share functionality (dummy implementation)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Mood Art',
        text: `Check out my mood art for ${timePeriod}!`,
        url: window.location.href,
      }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      alert("Sharing is not supported in your browser. You can download the image instead.");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mood Canvas</h1>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Your unique mood fingerprint visualized as art. This generative artwork is created based on your emotional patterns.
          </p>
          
          <Tabs defaultValue="week" className="mb-6" onValueChange={(value) => setTimeFrame(value as any)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 bg-muted/50 p-2 rounded text-sm text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Showing your mood art for <strong>{timePeriod}</strong></span>
            </div>
          </Tabs>
          
          {filteredEntries.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-10 text-center">
              <p className="text-muted-foreground mb-4">No mood data available for this time period.</p>
              <p className="text-sm text-muted-foreground">Log your moods to generate unique artwork.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <MoodCanvas entries={filteredEntries} width={600} height={400} />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">About Your Mood Canvas</h2>
          <p className="text-muted-foreground mb-4">
            Your mood data is transformed into a unique piece of generative art. The colors, shapes, and patterns all represent different aspects of your emotional state.
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li><strong>Colors:</strong> Derived directly from your mood selections</li>
            <li><strong>Shapes:</strong> Fluid shapes represent calm/peaceful moods, while angular shapes represent energetic/angry moods</li>
            <li><strong>Complexity:</strong> Based on the diversity of your emotions</li>
            <li><strong>Patterns:</strong> Influenced by your creative and energetic moods</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodArt;
