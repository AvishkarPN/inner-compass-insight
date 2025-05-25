
import React, { useEffect, useRef } from 'react';
import { MoodEntry } from '@/types/mood';
import { generateArtParameters, generateSeed } from '@/utils/artUtils';

interface MoodCanvasProps {
  entries: MoodEntry[];
  width?: number;
  height?: number;
}

const MoodCanvas: React.FC<MoodCanvasProps> = ({ 
  entries, 
  width = 600, 
  height = 400 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // If no entries, show a default art piece
    if (entries.length === 0) {
      drawDefaultArt(ctx, width, height);
      return;
    }
    
    // Get art parameters based on mood entries
    const { 
      colors, 
      complexity, 
      fluidity, 
      brightness, 
      patterns 
    } = generateArtParameters(entries);
    
    const seed = generateSeed(entries);
    
    // Use the parameters to create a unique generative art piece
    drawGenerativeArt(ctx, width, height, colors, complexity, fluidity, brightness, patterns, seed);
  }, [entries, width, height]);
  
  // Function to draw default art when no entries exist
  const drawDefaultArt = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e3f2fd');
    gradient.addColorStop(1, '#f8f9fa');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some subtle shapes
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#2196f3';
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.4, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.6, 30, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Function to create generative art
  const drawGenerativeArt = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    colors: string[], 
    complexity: number,
    fluidity: number,
    brightness: number,
    patterns: number,
    seed: number
  ) => {
    // Set a deterministic random function based on the seed
    let currentSeed = seed;
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    // Background with vibrant gradient
    const gradientColors = colors.length >= 2 ? colors : [...colors, '#ffffff'];
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradientColors.forEach((color, i) => {
      gradient.addColorStop(i / (gradientColors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Ensure minimum vibrant parameters
    const vibrantComplexity = Math.max(complexity, 0.3);
    const vibrantBrightness = Math.max(brightness, 0.4);
    const vibrantPatterns = Math.max(patterns, 0.2);
    
    // Number of shapes based on complexity
    const numShapes = Math.floor(15 + vibrantComplexity * 50);
    
    // Draw main shapes with vibrant colors
    for (let i = 0; i < numShapes; i++) {
      const color = colors[Math.floor(seededRandom() * colors.length)];
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3 + (vibrantBrightness * 0.6); // Ensure minimum visibility
      
      const x = seededRandom() * width;
      const y = seededRandom() * height;
      const size = 15 + seededRandom() * 60 * vibrantPatterns;
      
      // Different shapes based on fluidity
      if (seededRandom() < fluidity) {
        // Fluid shapes (circles)
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Angular shapes (rectangles)
        ctx.fillRect(x, y, size, size);
      }
      
      // Add connecting lines for complexity
      if (i > 0 && seededRandom() < vibrantComplexity) {
        const prevX = seededRandom() * width;
        const prevY = seededRandom() * height;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 1 + seededRandom() * 4;
        ctx.globalAlpha = 0.2 + (vibrantComplexity * 0.3);
        ctx.stroke();
      }
    }
    
    // Add decorative patterns
    if (vibrantPatterns > 0.2) {
      const patternCount = Math.floor(vibrantPatterns * 30);
      for (let i = 0; i < patternCount; i++) {
        const x = seededRandom() * width;
        const y = seededRandom() * height;
        const radius = 5 + seededRandom() * 25;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
      }
    }
  };
  
  return (
    <div className="mood-canvas">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="rounded-lg shadow-md mx-auto"
      />
    </div>
  );
};

export default MoodCanvas;
