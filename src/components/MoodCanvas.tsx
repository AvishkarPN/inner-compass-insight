
import React, { useEffect, useRef, useState } from 'react';
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

const MoodCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { moodEntries } = useMood();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [currentMood, setCurrentMood] = useState<MoodType>('peaceful');
  
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
      
      // Add some ambient particles
      drawAmbientParticles(ctx, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Draw ambient particles
  const drawAmbientParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
      ctx.fill();
    }
  };
  
  // Handle drawing
  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const position = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    setLastPosition(position);
  };
  
  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling while drawing
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const currentPosition = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    // Draw a line
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.strokeStyle = moodColorMap[currentMood];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    setLastPosition(currentPosition);
  };
  
  const handleDrawEnd = () => {
    setIsDrawing(false);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50">
        {Object.entries(moodColorMap).map(([mood, color]) => (
          <button 
            key={mood} 
            className={`w-6 h-6 rounded-full transition-transform ${currentMood === mood ? 'scale-110 ring-2 ring-offset-1' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentMood(mood as MoodType)}
            title={`Draw with ${mood} mood`}
          />
        ))}
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-crosshair"
          onMouseDown={handleDrawStart}
          onMouseMove={handleDrawMove}
          onMouseUp={handleDrawEnd}
          onMouseLeave={handleDrawEnd}
          onTouchStart={handleDrawStart}
          onTouchMove={handleDrawMove}
          onTouchEnd={handleDrawEnd}
        />
      </div>
    </div>
  );
};

export default MoodCanvas;
