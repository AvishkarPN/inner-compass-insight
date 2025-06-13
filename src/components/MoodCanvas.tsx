
import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  
  // Handle responsive sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = Math.min(containerWidth - 32, width); // Account for padding
      const aspectRatio = height / width;
      const newHeight = Math.min(maxWidth * aspectRatio, height);
      
      setCanvasSize({
        width: maxWidth,
        height: newHeight
      });
    };

    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [width, height]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvasSize.width;
    const displayHeight = canvasSize.height;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // If no entries, show a default art piece
    if (entries.length === 0) {
      drawDefaultArt(ctx, displayWidth, displayHeight);
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
    drawGenerativeArt(ctx, displayWidth, displayHeight, colors, complexity, fluidity, brightness, patterns, seed);
  }, [entries, canvasSize]);
  
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
    ctx.arc(width * 0.3, height * 0.4, Math.min(width, height) * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.6, Math.min(width, height) * 0.05, 0, Math.PI * 2);
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
    
    // Scale number of shapes based on canvas size
    const baseShapes = 15;
    const sizeMultiplier = Math.min(width, height) / 400; // Base size of 400px
    const numShapes = Math.floor((baseShapes + vibrantComplexity * 50) * sizeMultiplier);
    
    // Draw main shapes with vibrant colors
    for (let i = 0; i < numShapes; i++) {
      const color = colors[Math.floor(seededRandom() * colors.length)];
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3 + (vibrantBrightness * 0.6);
      
      const x = seededRandom() * width;
      const y = seededRandom() * height;
      const size = (15 + seededRandom() * 60 * vibrantPatterns) * sizeMultiplier;
      
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
        ctx.lineWidth = (1 + seededRandom() * 4) * sizeMultiplier;
        ctx.globalAlpha = 0.2 + (vibrantComplexity * 0.3);
        ctx.stroke();
      }
    }
    
    // Add decorative patterns
    if (vibrantPatterns > 0.2) {
      const patternCount = Math.floor(vibrantPatterns * 30 * sizeMultiplier);
      for (let i = 0; i < patternCount; i++) {
        const x = seededRandom() * width;
        const y = seededRandom() * height;
        const radius = (5 + seededRandom() * 25) * sizeMultiplier;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2 * sizeMultiplier;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
      }
    }
  };
  
  return (
    <div ref={containerRef} className="mood-canvas w-full">
      <canvas 
        ref={canvasRef} 
        className="rounded-lg shadow-md mx-auto block max-w-full h-auto"
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default MoodCanvas;
