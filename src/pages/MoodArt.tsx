import React, { useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodEntry } from '@/types/mood';
import MoodCanvas from '@/components/MoodCanvas';
import MoodInsights from '@/components/MoodInsights';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import SocialShare from '@/components/SocialShare';

const MoodArt = () => {
  const { moodEntries } = useMood();
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Filter entries based on selected timeframe
  const getFilteredEntries = (): MoodEntry[] => {
    if (timeFrame === 'all') return moodEntries;
    
    const now = new Date();
    const cutoffDate = new Date(now);
    
    switch (timeFrame) {
      case 'day':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }
    
    return moodEntries.filter(entry => new Date(entry.timestamp) >= cutoffDate);
  };

  const getTimePeriodDescription = (timeFrame: string): string => {
    switch (timeFrame) {
      case 'day':
        return 'today';
      case 'week':
        return 'the past week';
      case 'month':
        return 'the past month';
      case 'all':
        return 'all time';
      default:
        return 'the selected period';
    }
  };
  
  const filteredEntries = getFilteredEntries();
  const timePeriod = getTimePeriodDescription(timeFrame);
  
  // Handle download canvas as image
  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `mood-canvas-${timeFrame}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  // Handle share functionality — #30: use toast() instead of alert()
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Mood Canvas',
        text: `Check out my mood canvas for ${timePeriod}!`,
        url: window.location.href,
      }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      // Clipboard copy fallback
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link copied!',
          description: 'The page URL has been copied to your clipboard.',
        });
      }).catch(() => {
        toast({
          title: 'Sharing not supported',
          description: 'Download the image and share it manually.',
        });
      });
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
          
          <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)} className="mb-6">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 bg-muted/50 p-2 rounded text-sm text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Showing your Mood Canvas for <strong>{timePeriod}</strong></span>
            </div>
          </Tabs>
          
          {filteredEntries.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-10 text-center">
              <p className="text-muted-foreground mb-4">No mood data available for this time period.</p>
              <p className="text-sm text-muted-foreground">Log your moods to generate unique artwork.</p>
            </div>
          ) : (
            <>
              <div className="mb-6" key={`canvas-${timeFrame}-${filteredEntries.length}`}>
                <MoodCanvas entries={filteredEntries} width={600} height={400} />
              </div>
              
              <div className="flex justify-center gap-4 flex-wrap">
                <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Download
                </Button>
                <SocialShare
                  title="My Mood Canvas"
                  text={`Check out my mood canvas for ${timePeriod}!`}
                  canvasRef={canvasRef}
                  label="Share"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <MoodInsights entries={filteredEntries} timeFrame={timeFrame} />
      
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
