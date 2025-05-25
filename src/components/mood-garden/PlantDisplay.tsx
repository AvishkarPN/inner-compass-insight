
import React from 'react';
import { MoodType } from '@/types/mood';
import { moodPlantMap } from './constants';

interface PlantDisplayProps {
  dominantMood: MoodType;
  plantSize: number;
  plantHealth: number;
}

const PlantDisplay: React.FC<PlantDisplayProps> = ({ dominantMood, plantSize, plantHealth }) => {
  // Plant appearance affected by health
  const getOpacity = () => {
    return 0.8 + (plantHealth / 500); // Better range from 0.8 to 1.0
  };

  const plantEmoji = moodPlantMap[dominantMood];

  return (
    <div className="absolute inset-0 flex justify-center items-end">
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-in-out z-10"
        style={{
          fontSize: `${plantSize}px`,
          opacity: getOpacity(),
          filter: `saturate(${Math.min(plantHealth / 100 * 1.5, 2)}) brightness(${Math.min(plantHealth / 100 * 1.2, 1.3)})`,
          textShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="relative">
          {/* Enhanced ambient particles for visual effect */}
          {plantHealth > 70 && (
            <>
              <span className="absolute -top-6 -left-4 opacity-40 animate-float-gentle text-sm">✨</span>
              <span className="absolute -top-3 right-2 opacity-40 animate-float text-xs delay-1000">✨</span>
              <span className="absolute -top-8 left-1 opacity-30 animate-float-gentle text-xs delay-2000">🌟</span>
            </>
          )}
          
          {/* The plant with improved styling */}
          <span 
            className="animate-float-gentle inline-block relative z-20"
            style={{
              transform: `scale(${1 + (plantHealth - 50) / 200})`, // Slight scale based on health
            }}
          >
            {plantEmoji}
          </span>
          
          {/* Improved ground/pot element */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-center z-0">
            <span className="text-sm opacity-60">🪨</span>
          </div>
          
          {/* Subtle glow effect for healthy plants */}
          {plantHealth > 80 && (
            <div 
              className="absolute inset-0 rounded-full opacity-20 animate-pulse"
              style={{
                background: `radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)`,
                transform: 'scale(1.5)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDisplay;
