
import React from 'react';
import { MoodType } from '@/types/mood';
import { moodPlantMap, getStreakColor } from './constants';

interface PlantDisplayProps {
  dominantMood: MoodType;
  plantSize: number;
  plantHealth: number;
  streak: number;
}

const PlantDisplay: React.FC<PlantDisplayProps> = ({ dominantMood, plantSize, plantHealth, streak }) => {
  // Plant appearance affected by health
  const getOpacity = () => {
    return 0.9 + (plantHealth / 1000); // Better range from 0.9 to 1.0
  };

  const plantEmoji = moodPlantMap[dominantMood];
  const streakColor = getStreakColor(streak);

  return (
    <div className="absolute inset-0 flex justify-center items-end">
      <div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-in-out z-20"
        style={{
          fontSize: `${plantSize}px`,
          opacity: getOpacity(),
          filter: `saturate(${Math.min(plantHealth / 100 * 2, 2.5)}) brightness(${Math.min(plantHealth / 100 * 1.3, 1.4)}) hue-rotate(${streak >= 10 ? '20deg' : '0deg'})`,
          textShadow: `0 4px 12px ${streakColor}40`,
          color: streakColor,
        }}
      >
        <div className="relative">
          {/* Enhanced ambient particles for visual effect */}
          {plantHealth > 70 && (
            <>
              <span className="absolute -top-8 -left-6 opacity-50 animate-float-gentle text-lg">✨</span>
              <span className="absolute -top-6 right-4 opacity-50 animate-float text-sm delay-1000">✨</span>
              <span className="absolute -top-10 left-2 opacity-40 animate-float-gentle text-sm delay-2000">🌟</span>
            </>
          )}
          
          {/* The plant with improved styling */}
          <span 
            className="animate-float-gentle inline-block relative z-30"
            style={{
              transform: `scale(${1 + (plantHealth - 50) / 150})`, // Better scale based on health
            }}
          >
            {plantEmoji}
          </span>
          
          {/* Improved ground/pot element with better positioning */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center z-10">
            <span className="text-lg opacity-70">🪨</span>
          </div>
          
          {/* Streak-based glow effect */}
          {plantHealth > 80 && (
            <div 
              className="absolute inset-0 rounded-full opacity-25 animate-pulse z-0"
              style={{
                background: `radial-gradient(circle, ${streakColor}40 0%, transparent 70%)`,
                transform: 'scale(2)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDisplay;
