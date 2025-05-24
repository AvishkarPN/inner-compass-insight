
import React, { useEffect, useRef, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodType } from '@/types/mood';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';

const moodColorMap: Record<MoodType, string> = {
  angry: '#ff6b6b',
  energetic: '#ffa502',
  happy: '#feca57',
  sad: '#74b9ff',
  calm: '#3498db',
  anxious: '#9b59b6',
};

const MoodArt = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { moodEntries } = useMood();
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month' | 'all'>('today');
  
  // Generate and render mood art based on selected timeframe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get relevant mood entries based on timeframe
    const now = new Date();
    const filteredEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      
      switch (timeFrame) {
        case 'today':
          return entryDate.toDateString() === now.toDateString();
        case 'week': 
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return entryDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
    
    // Create gradient background based on mood colors
    const createGradientBackground = () => {
      // Default colors if no entries
      let startColor = '#ff6b6b';  // angry
      let endColor = '#3498db';    // calm
      
      if (filteredEntries.length > 0) {
        // Use first and last mood for gradient
        const firstMood = filteredEntries[0].mood;
        const lastMood = filteredEntries[filteredEntries.length - 1].mood;
        
        startColor = moodColorMap[firstMood];
        endColor = moodColorMap[lastMood];
      }
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      return gradient;
    };
    
    // Apply background
    ctx.fillStyle = createGradientBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw mood shapes
    filteredEntries.forEach((entry, index) => {
      const color = moodColorMap[entry.mood];
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 10;
      
      // Draw different shapes based on mood
      switch (entry.mood) {
        case 'angry':
          drawAngularShape(ctx, x, y, size, color);
          break;
        case 'energetic':
        case 'happy':
          drawCircle(ctx, x, y, size, color);
          break;
        case 'sad':
        case 'calm':
          drawFluidShape(ctx, x, y, size, color);
          break;
        case 'anxious':
          drawComplexShape(ctx, x, y, size, color);
          break;
      }
    });
    
  }, [moodEntries, timeFrame]);
  
  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  const drawAngularShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.beginPath();
    const sides = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const distance = size + Math.random() * (size / 2);
      
      const pointX = x + Math.cos(angle) * distance;
      const pointY = y + Math.sin(angle) * distance;
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  const drawFluidShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.beginPath();
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const variance = Math.random() * (size / 3);
      const distance = size + variance;
      
      const pointX = x + Math.cos(angle) * distance;
      const pointY = y + Math.sin(angle) * distance;
      
      if (angle === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  const drawComplexShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.beginPath();
    
    const points = 7 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = Math.random() * size;
      const distance = size / 2 + variance;
      
      const pointX = x + Math.cos(angle) * distance;
      const pointY = y + Math.sin(angle) * distance;
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.quadraticCurveTo(
          x + Math.cos(angle - Math.PI / points) * distance * 1.5,
          y + Math.sin(angle - Math.PI / points) * distance * 1.5,
          pointX,
          pointY
        );
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `mood-art-${timeFrame}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob(blob => {
      if (!blob) return;
      
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'mood-art.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'My Mood Art',
            text: 'Check out my mood visualization!'
          }).catch(error => console.error('Error sharing:', error));
          return;
        }
      }
      
      // Fallback if Web Share API is not available
      alert('Sharing is not supported on this browser. You can download the image instead.');
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mood Canvas</h1>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Your unique mood fingerprint visualized as art. This generative artwork is created based on your emotional patterns.
          </p>
          
          <Tabs defaultValue="today" className="mb-4" onValueChange={(value) => setTimeFrame(value as any)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="text-xs text-muted-foreground flex items-center gap-2 mb-4">
            <span className="i-lucide-calendar text-sm"></span>
            Showing your mood art for {timeFrame}
          </div>
          
          <div className="rounded-md overflow-hidden border mb-4 bg-white">
            <canvas 
              ref={canvasRef} 
              className="w-full h-64"
              width={600}
              height={300}
            />
          </div>
          
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-2">
              <Download size={16} />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
              <Share size={16} />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">About Your Mood Canvas</h2>
          
          <p className="text-muted-foreground mb-4">
            Your mood data is transformed into a unique piece of generative art. The colors, shapes, and patterns all represent different aspects of your emotional state.
          </p>
          
          <ul className="space-y-2 list-disc pl-5">
            <li><span className="font-medium">Colors:</span> Derived directly from your mood selections</li>
            <li><span className="font-medium">Shapes:</span> Fluid shapes represent calm/sad moods, while angular shapes represent energetic/angry moods</li>
            <li><span className="font-medium">Complexity:</span> Based on the diversity of your emotions</li>
            <li><span className="font-medium">Patterns:</span> Influenced by your creative and energetic moods</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodArt;
