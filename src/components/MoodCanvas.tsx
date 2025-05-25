
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
    if (!canvasRef.current || entries.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
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
    
    // Background
    const gradientColors = colors.length >= 2 ? colors : [...colors, '#ffffff'];
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradientColors.forEach((color, i) => {
      gradient.addColorStop(i / (gradientColors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Number of shapes based on complexity
    const numShapes = Math.floor(10 + complexity * 40);
    
    // Draw shapes
    for (let i = 0; i < numShapes; i++) {
      const color = colors[Math.floor(seededRandom() * colors.length)];
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.2 + (brightness * 0.5);
      
      const x = seededRandom() * width;
      const y = seededRandom() * height;
      const size = 10 + seededRandom() * 50 * patterns;
      
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
      if (i > 0 && seededRandom() < complexity) {
        const prevX = seededRandom() * width;
        const prevY = seededRandom() * height;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 1 + seededRandom() * 3;
        ctx.globalAlpha = 0.1 + (complexity * 0.2);
        ctx.stroke();
      }
    }
    
    // Add patterns
    if (patterns > 0.3) {
      const patternCount = Math.floor(patterns * 20);
      for (let i = 0; i < patternCount; i++) {
        const x = seededRandom() * width;
        const y = seededRandom() * height;
        const radius = 5 + seededRandom() * 20;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
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
