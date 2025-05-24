
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
    return 0.5 + (plantHealth / 200); // Range from 0.5 to 1.0
  };

  const plantEmoji = moodPlantMap[dominantMood];

  return (
    <div className="absolute inset-0 flex justify-center items-end">
      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-in-out"
        style={{
          fontSize: `${plantSize}px`,
          opacity: getOpacity(),
          filter: `saturate(${plantHealth / 100 * 1.2})`,
          textShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <div className="relative">
          {/* Ambient particles for visual effect */}
          {plantHealth > 70 && (
            <>
              <span className="absolute -top-4 -left-3 opacity-30 animate-float-gentle text-xs">✨</span>
              <span className="absolute -top-2 right-1 opacity-30 animate-float text-xs">✨</span>
            </>
          )}
          
          {/* The plant */}
          <span className="animate-float-gentle inline-block">{plantEmoji}</span>
          
          {/* Ground/pot element */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-center">
            <span className="text-xs opacity-80">🪨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDisplay;
