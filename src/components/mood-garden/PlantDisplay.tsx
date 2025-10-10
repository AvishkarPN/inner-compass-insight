import React from 'react';
import { MoodType } from '@/types/mood';
import PlantSVG from './PlantSVG';

interface PlantDisplayProps {
  dominantMood: MoodType;
  plantSize: number;
  plantHealth: number;
  streak: number;
}

const PlantDisplay: React.FC<PlantDisplayProps> = ({ dominantMood, plantSize, plantHealth, streak }) => {
  // Calculate plant stage based on size
  const getPlantStage = () => {
    if (plantSize >= 120) return 4;
    if (plantSize >= 96) return 3;
    if (plantSize >= 72) return 2;
    if (plantSize >= 48) return 1;
    return 0;
  };

  const plantStage = getPlantStage();

  return (
    <div className="absolute inset-0 flex justify-center items-end z-20" role="region" aria-label="Mood Garden Plant Display">
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out will-change-transform">
        {/* Ambient particles for healthy plants */}
        {plantHealth > 70 && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <span className="absolute -top-12 -left-8 text-2xl animate-float-gentle opacity-60">✨</span>
            <span className="absolute -top-10 right-8 text-xl animate-float opacity-60 delay-1000">✨</span>
            <span className="absolute -top-14 left-0 text-lg animate-float-gentle opacity-50 delay-2000">🌟</span>
          </div>
        )}
        
        {/* SVG Plant */}
        <div 
          className="animate-float-gentle"
          style={{
            filter: plantHealth > 80 ? 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))' : 'none',
          }}
        >
          <PlantSVG 
            mood={dominantMood}
            stage={plantStage}
            health={plantHealth}
            size={plantSize * 2.5}
          />
        </div>
      </div>
    </div>
  );
};

export default PlantDisplay;
