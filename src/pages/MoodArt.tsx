
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
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Filter entries based on timeframe
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
    
    // Create stunning background gradient
    const createBackgroundGradient = () => {
      if (filteredEntries.length === 0) {
        const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        return gradient;
      }
      
      // Use mood colors for gradient
      const moodColors = filteredEntries.map(entry => moodColorMap[entry.mood]);
      const uniqueColors = [...new Set(moodColors)];
      
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
      
      uniqueColors.forEach((color, index) => {
        gradient.addColorStop(index / (uniqueColors.length - 1), color + '20');
      });
      
      return gradient;
    };
    
    // Apply background
    ctx.fillStyle = createBackgroundGradient();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle texture overlay
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    // Generate art based on moods
    filteredEntries.forEach((entry, index) => {
      const color = moodColorMap[entry.mood];
      const progress = index / Math.max(filteredEntries.length - 1, 1);
      
      // Position based on time and mood
      const baseX = (progress * canvas.width * 0.8) + (canvas.width * 0.1);
      const baseY = canvas.height / 2;
      
      // Create multiple layers for each mood
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 20;
        const x = baseX + (Math.sin(progress * Math.PI * 4) * 80) + (Math.random() - 0.5) * 40;
        const y = baseY + (Math.cos(progress * Math.PI * 3) * 60) + (Math.random() - 0.5) * 60 + layerOffset;
        const size = 30 + (Math.random() * 40) - (layer * 8);
        
        switch (entry.mood) {
          case 'angry':
            drawAngryArt(ctx, x, y, size, color, layer);
            break;
          case 'energetic':
            drawEnergeticArt(ctx, x, y, size, color, layer);
            break;
          case 'happy':
            drawHappyArt(ctx, x, y, size, color, layer);
            break;
          case 'sad':
            drawSadArt(ctx, x, y, size, color, layer);
            break;
          case 'calm':
            drawCalmArt(ctx, x, y, size, color, layer);
            break;
          case 'anxious':
            drawAnxiousArt(ctx, x, y, size, color, layer);
            break;
        }
      }
    });
    
    // Add connecting lines between moods
    if (filteredEntries.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      filteredEntries.forEach((entry, index) => {
        const progress = index / Math.max(filteredEntries.length - 1, 1);
        const x = (progress * canvas.width * 0.8) + (canvas.width * 0.1);
        const y = canvas.height / 2 + (Math.sin(progress * Math.PI * 4) * 80);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
  }, [moodEntries, timeFrame]);
  
  // Art generation functions for each mood
  const drawAngryArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.7 - (layer * 0.2);
    
    // Sharp, jagged shapes
    ctx.beginPath();
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const spikeLength = size + (Math.random() * size * 0.5);
      const pointX = x + Math.cos(angle) * spikeLength;
      const pointY = y + Math.sin(angle) * spikeLength;
      
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '00');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };
  
  const drawEnergeticArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.8 - (layer * 0.2);
    
    // Radiating energy lines
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const length = size + (Math.random() * size);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 - layer;
      ctx.stroke();
    }
    
    // Central burst
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.restore();
  };
  
  const drawHappyArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.7 - (layer * 0.15);
    
    // Bright, rounded bubbles
    for (let i = 0; i < 5; i++) {
      const bubbleX = x + (Math.random() - 0.5) * size;
      const bubbleY = y + (Math.random() - 0.5) * size;
      const bubbleSize = (size * 0.3) + (Math.random() * size * 0.4);
      
      const gradient = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, bubbleSize);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color + '80');
      gradient.addColorStop(1, color + '00');
      
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  const drawSadArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.6 - (layer * 0.15);
    
    // Downward flowing teardrops
    for (let i = 0; i < 3; i++) {
      const tearX = x + (Math.random() - 0.5) * size * 0.5;
      const tearY = y - size * 0.5;
      const tearHeight = size + (Math.random() * size * 0.5);
      
      ctx.beginPath();
      ctx.ellipse(tearX, tearY + tearHeight * 0.7, size * 0.2, tearHeight * 0.3, 0, 0, Math.PI * 2);
      
      const gradient = ctx.createLinearGradient(tearX, tearY, tearX, tearY + tearHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '20');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  const drawCalmArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.6 - (layer * 0.1);
    
    // Gentle, flowing waves
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const radius = size + Math.sin(angle * 6) * (size * 0.3);
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;
      
      if (angle === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, color + '10');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  };
  
  const drawAnxiousArt = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, layer: number) => {
    ctx.save();
    ctx.globalAlpha = 0.7 - (layer * 0.2);
    
    // Chaotic, overlapping patterns
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const startX = x + (Math.random() - 0.5) * size;
      const startY = y + (Math.random() - 0.5) * size;
      
      ctx.moveTo(startX, startY);
      
      for (let j = 0; j < 4; j++) {
        const controlX = startX + (Math.random() - 0.5) * size;
        const controlY = startY + (Math.random() - 0.5) * size;
        const endX = x + (Math.random() - 0.5) * size;
        const endY = y + (Math.random() - 0.5) * size;
        
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 - (layer * 0.5);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
      
      alert('Sharing is not supported on this browser. You can download the image instead.');
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mood Canvas</h1>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Your unique mood fingerprint visualized as stunning generative art.
          </p>
          
          <Tabs defaultValue="today" className="mb-4" onValueChange={(value) => setTimeFrame(value as any)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="rounded-md overflow-hidden border mb-4 bg-black">
            <canvas 
              ref={canvasRef} 
              className="w-full max-w-full"
              style={{ aspectRatio: '8/5' }}
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
            Your emotional journey transformed into a mesmerizing work of art. Each mood creates unique visual patterns that flow together to tell your story.
          </p>
          
          <ul className="space-y-2 list-disc pl-5">
            <li><span className="font-medium">Angry:</span> Sharp, jagged bursts of energy</li>
            <li><span className="font-medium">Energetic:</span> Radiating lines and bright centers</li>
            <li><span className="font-medium">Happy:</span> Glowing bubbles of light</li>
            <li><span className="font-medium">Sad:</span> Flowing teardrops and gentle streams</li>
            <li><span className="font-medium">Calm:</span> Smooth, wave-like patterns</li>
            <li><span className="font-medium">Anxious:</span> Chaotic, overlapping curves</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodArt;
