
import React, { useState, useEffect } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { MoodEntry } from '@/types/mood';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Download, Calendar } from 'lucide-react';

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
  
  const getTimePeriodDescription = (entries: MoodEntry[]) => {
    if (entries.length === 0) return 'no data';
    
    const dates = entries.map(e => new Date(e.timestamp));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    
    if (timeFrame === 'day') return 'today';
    if (timeFrame === 'all') return 'all time';
    
    return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
  };
  
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
        // In a real implementation, we'd generate a shareable URL
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

// MoodCanvas component
const MoodCanvas: React.FC<{ entries: MoodEntry[], width: number, height: number }> = ({ entries, width, height }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Mood color mapping
    const moodColors: Record<string, string> = {
      angry: '#ff6b6b',
      energetic: '#ffa502',
      happy: '#feca57',
      sad: '#74b9ff',
      calm: '#3498db',
      anxious: '#9b59b6',
    };
    
    if (entries.length === 0) return;
    
    // Create background gradient
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
    );
    
    const uniqueColors = [...new Set(entries.map(e => moodColors[e.mood]))];
    uniqueColors.forEach((color, index) => {
      gradient.addColorStop(index / Math.max(uniqueColors.length - 1, 1), color + '20');
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate art based on moods
    entries.forEach((entry, index) => {
      const color = moodColors[entry.mood];
      const progress = index / Math.max(entries.length - 1, 1);
      
      // Position
      const x = (progress * canvas.width * 0.8) + (canvas.width * 0.1);
      const y = canvas.height / 2 + Math.sin(progress * Math.PI * 4) * 80;
      const size = 30 + Math.random() * 40;
      
      // Draw mood-specific art
      ctx.save();
      ctx.globalAlpha = 0.7;
      
      switch (entry.mood) {
        case 'angry':
          // Sharp, jagged shapes
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = size + Math.random() * size * 0.5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          break;
          
        case 'energetic':
          // Radiating lines
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const length = size + Math.random() * size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          break;
          
        case 'happy':
          // Bright bubbles
          for (let i = 0; i < 5; i++) {
            const bx = x + (Math.random() - 0.5) * size;
            const by = y + (Math.random() - 0.5) * size;
            const radius = size * 0.3 + Math.random() * size * 0.4;
            
            const bubbleGradient = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
            bubbleGradient.addColorStop(0, color);
            bubbleGradient.addColorStop(1, color + '00');
            
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fillStyle = bubbleGradient;
            ctx.fill();
          }
          break;
          
        case 'sad':
          // Teardrops
          for (let i = 0; i < 3; i++) {
            const tx = x + (Math.random() - 0.5) * size * 0.5;
            const ty = y - size * 0.5;
            const th = size + Math.random() * size * 0.5;
            
            ctx.beginPath();
            ctx.ellipse(tx, ty + th * 0.7, size * 0.2, th * 0.3, 0, 0, Math.PI * 2);
            
            const tearGradient = ctx.createLinearGradient(tx, ty, tx, ty + th);
            tearGradient.addColorStop(0, color);
            tearGradient.addColorStop(1, color + '20');
            
            ctx.fillStyle = tearGradient;
            ctx.fill();
          }
          break;
          
        case 'calm':
          // Gentle waves
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const radius = size + Math.sin(angle * 6) * (size * 0.3);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (angle === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          
          const waveGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          waveGradient.addColorStop(0, color + '60');
          waveGradient.addColorStop(1, color + '10');
          
          ctx.fillStyle = waveGradient;
          ctx.fill();
          break;
          
        case 'anxious':
          // Chaotic curves
          for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            const sx = x + (Math.random() - 0.5) * size;
            const sy = y + (Math.random() - 0.5) * size;
            ctx.moveTo(sx, sy);
            
            for (let j = 0; j < 4; j++) {
              const cx = sx + (Math.random() - 0.5) * size;
              const cy = sy + (Math.random() - 0.5) * size;
              const ex = x + (Math.random() - 0.5) * size;
              const ey = y + (Math.random() - 0.5) * size;
              ctx.quadraticCurveTo(cx, cy, ex, ey);
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
    });
    
    // Add connecting flow lines
    if (entries.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      entries.forEach((entry, index) => {
        const progress = index / Math.max(entries.length - 1, 1);
        const x = (progress * canvas.width * 0.8) + (canvas.width * 0.1);
        const y = canvas.height / 2 + Math.sin(progress * Math.PI * 4) * 80;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
    }
    
  }, [entries, width, height]);
  
  return (
    <div className="rounded-md overflow-hidden border bg-black">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-full"
        style={{ aspectRatio: `${width}/${height}` }}
      />
    </div>
  );
};

export default MoodArt;
