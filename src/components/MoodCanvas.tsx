
import React, { useEffect, useRef } from 'react';
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

const moodBgMap: Record<MoodType, string> = {
  angry: 'bg-red-50 dark:bg-red-950/30',
  energetic: 'bg-orange-50 dark:bg-orange-950/30',
  happy: 'bg-yellow-50 dark:bg-yellow-950/30',
  peaceful: 'bg-green-50 dark:bg-green-950/30',
  calm: 'bg-blue-50 dark:bg-blue-950/30',
  anxious: 'bg-purple-50 dark:bg-purple-950/30',
};

const MoodCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { moodEntries } = useMood();
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Fill with light background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw mood patterns
      drawMoodArt(ctx, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [moodEntries]);
  
  // Draw mood art based on entries
  const drawMoodArt = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // If no mood entries, show placeholder
    if (moodEntries.length === 0) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Your mood art will appear here as you log entries', width / 2, height / 2);
      return;
    }
    
    // Create an abstract representation of mood history
    // For each mood entry, create an element in the visualization
    const recent = moodEntries.slice(-20).reverse(); // Get last 20 entries
    
    recent.forEach((entry, index) => {
      const color = moodColorMap[entry.mood];
      const x = width * (0.2 + (index % 5) * 0.15);
      const y = height * (0.2 + Math.floor(index / 5) * 0.15);
      const size = Math.max(20, 40 * (1 - index / recent.length));
      
      // Draw based on mood type
      switch (entry.mood) {
        case 'happy':
        case 'energetic':
          drawSunburst(ctx, x, y, size, color);
          break;
        case 'peaceful':
        case 'calm':
          drawWave(ctx, x, y, size, color);
          break;
        case 'angry':
        case 'anxious':
          drawSpikes(ctx, x, y, size, color);
          break;
        default:
          drawCircle(ctx, x, y, size, color);
      }
    });
    
    // Add some connecting lines between elements for visual interest
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i < recent.length; i++) {
      const prevX = width * (0.2 + ((i-1) % 5) * 0.15);
      const prevY = height * (0.2 + Math.floor((i-1) / 5) * 0.15);
      const currX = width * (0.2 + (i % 5) * 0.15);
      const currY = height * (0.2 + Math.floor(i / 5) * 0.15);
      
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currX, currY);
      ctx.stroke();
    }
  };
  
  // Drawing helpers
  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  const drawSunburst = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    const rays = 12;
    
    ctx.globalAlpha = 0.7;
    // Center circle
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Rays
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const rayLength = size;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = size / 10;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  
  const drawWave = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.globalAlpha = 0.7;
    const amplitude = size / 3;
    const frequency = size / 40;
    
    ctx.beginPath();
    
    for (let i = -size; i <= size; i += 2) {
      const xPos = x + i;
      const yPos = y + Math.sin(i * frequency) * amplitude;
      
      if (i === -size) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = size / 8;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  
  const drawSpikes = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.globalAlpha = 0.7;
    const spikes = 8;
    const innerRadius = size / 3;
    const outerRadius = size;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      
      const xPoint = x + Math.cos(angle) * radius;
      const yPoint = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(xPoint, yPoint);
      } else {
        ctx.lineTo(xPoint, yPoint);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  
  // Find dominant mood for background styling
  const getDominantMood = (): MoodType => {
    if (moodEntries.length === 0) return 'peaceful';
    
    const moodCounts: Record<MoodType, number> = {
      angry: 0,
      energetic: 0,
      happy: 0,
      peaceful: 0,
      calm: 0,
      anxious: 0,
    };
    
    // Count recent moods (last 7 entries)
    const recentMoods = moodEntries.slice(-7);
    
    recentMoods.forEach(entry => {
      moodCounts[entry.mood]++;
    });
    
    // Return the mood with highest count
    return Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as MoodType;
  };
  
  const dominantMood = getDominantMood();
  
  return (
    <div className={`h-full flex flex-col ${moodBgMap[dominantMood]}`}>
      <div className="p-4 text-sm text-center text-muted-foreground">
        Your mood journey visualized as art
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 touch-none"
        />
      </div>
    </div>
  );
};

export default MoodCanvas;
