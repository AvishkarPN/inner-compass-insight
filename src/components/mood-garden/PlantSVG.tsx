import React from 'react';
import { MoodType } from '@/types/mood';

interface PlantSVGProps {
  mood: MoodType;
  stage: number;
  health: number;
  size: number;
}

const PlantSVG: React.FC<PlantSVGProps> = ({ mood, stage, health, size }) => {
  const baseSize = size;
  const healthScale = Math.max(0.5, health / 100);
  
  // Color schemes based on mood
  const moodColors: Record<MoodType, { primary: string; secondary: string; accent: string }> = {
    happy: { primary: '#feca57', secondary: '#ff9ff3', accent: '#54a0ff' },
    energetic: { primary: '#ff9ff3', secondary: '#feca57', accent: '#ff6348' },
    calm: { primary: '#54a0ff', secondary: '#48dbfb', accent: '#00d2d3' },
    sad: { primary: '#74b9ff', secondary: '#a29bfe', accent: '#6c5ce7' },
    anxious: { primary: '#a29bfe', secondary: '#fd79a8', accent: '#fdcb6e' },
    angry: { primary: '#ff6348', secondary: '#ff4757', accent: '#ff6b81' }
  };

  const colors = moodColors[mood];
  
  // Opacity based on health
  const opacity = 0.6 + (healthScale * 0.4);
  
  // Different plant stages
  const renderPlant = () => {
    switch (stage) {
      case 0: // Seed/Sprout
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="90" rx="25" ry="8" fill="#8B7355" opacity="0.6"/>
            {/* Small sprout */}
            <path
              d="M 50 85 Q 48 75 50 70 L 52 65"
              stroke={colors.primary}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tiny leaf */}
            <ellipse cx="52" cy="65" rx="4" ry="6" fill={colors.secondary} opacity="0.8"/>
            <ellipse cx="48" cy="68" rx="3" ry="5" fill={colors.secondary} opacity="0.8"/>
          </g>
        );
      
      case 1: // Young plant
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="90" rx="30" ry="10" fill="#8B7355" opacity="0.6"/>
            {/* Stem */}
            <path
              d="M 50 90 Q 48 70 50 50 Q 52 40 50 35"
              stroke={colors.primary}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Leaves */}
            <ellipse cx="45" cy="60" rx="8" ry="12" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="55" cy="55" rx="9" ry="13" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="48" cy="45" rx="7" ry="10" fill={colors.accent} opacity="0.8"/>
            <ellipse cx="52" cy="40" rx="8" ry="11" fill={colors.accent} opacity="0.8"/>
          </g>
        );
      
      case 2: // Growing plant
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="92" rx="35" ry="12" fill="#8B7355" opacity="0.6"/>
            {/* Main stem */}
            <path
              d="M 50 92 Q 48 65 50 40 Q 52 25 50 20"
              stroke={colors.primary}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Branches */}
            <path d="M 50 70 Q 40 65 35 60" stroke={colors.primary} strokeWidth="3" fill="none"/>
            <path d="M 50 60 Q 60 55 65 50" stroke={colors.primary} strokeWidth="3" fill="none"/>
            <path d="M 50 50 Q 42 45 38 40" stroke={colors.primary} strokeWidth="3" fill="none"/>
            
            {/* Leaves */}
            <ellipse cx="35" cy="60" rx="10" ry="15" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="30" cy="58" rx="8" ry="12" fill={colors.accent} opacity="0.8"/>
            <ellipse cx="65" cy="50" rx="11" ry="16" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="70" cy="48" rx="9" ry="13" fill={colors.accent} opacity="0.8"/>
            <ellipse cx="38" cy="40" rx="9" ry="14" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="33" cy="38" rx="7" ry="11" fill={colors.accent} opacity="0.8"/>
            
            {/* Top leaves */}
            <ellipse cx="48" cy="30" rx="10" ry="14" fill={colors.primary} opacity="0.9"/>
            <ellipse cx="52" cy="25" rx="9" ry="13" fill={colors.primary} opacity="0.9"/>
          </g>
        );
      
      case 3: // Mature plant
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="94" rx="40" ry="14" fill="#8B7355" opacity="0.6"/>
            {/* Main trunk */}
            <path
              d="M 50 94 Q 48 60 50 30 Q 52 15 50 10"
              stroke={colors.primary}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Multiple branches */}
            <path d="M 50 75 Q 38 70 30 65" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 70 Q 62 65 70 60" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 60 Q 40 55 32 50" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 55 Q 60 50 68 45" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 45 Q 42 40 35 35" stroke={colors.primary} strokeWidth="3" fill="none"/>
            
            {/* Abundant leaves */}
            <ellipse cx="30" cy="65" rx="12" ry="17" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="25" cy="63" rx="10" ry="14" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="70" cy="60" rx="13" ry="18" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="75" cy="58" rx="11" ry="15" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="32" cy="50" rx="11" ry="16" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="68" cy="45" rx="12" ry="17" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="35" cy="35" rx="10" ry="15" fill={colors.accent} opacity="0.9"/>
            
            {/* Crown leaves */}
            <ellipse cx="45" cy="20" rx="12" ry="16" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="55" cy="18" rx="11" ry="15" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="50" cy="15" rx="10" ry="14" fill={colors.secondary} opacity="0.9"/>
            
            {/* Flowers/blooms */}
            {health > 70 && (
              <>
                <circle cx="30" cy="65" r="4" fill="#FFD700" opacity="0.9"/>
                <circle cx="70" cy="60" r="4" fill="#FFD700" opacity="0.9"/>
                <circle cx="50" cy="15" r="5" fill="#FFD700" opacity="0.95"/>
              </>
            )}
          </g>
        );
      
      case 4: // Full tree
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="95" rx="45" ry="15" fill="#8B7355" opacity="0.6"/>
            {/* Strong trunk */}
            <path
              d="M 50 95 Q 48 50 50 20 Q 52 8 50 5"
              stroke={colors.primary}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Complex branch system */}
            <path d="M 50 80 Q 35 75 25 70" stroke={colors.primary} strokeWidth="5" fill="none"/>
            <path d="M 50 78 Q 65 73 75 68" stroke={colors.primary} strokeWidth="5" fill="none"/>
            <path d="M 50 65 Q 38 60 28 55" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 63 Q 62 58 72 53" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 50 Q 40 45 30 40" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 48 Q 60 43 70 38" stroke={colors.primary} strokeWidth="4" fill="none"/>
            <path d="M 50 35 Q 42 30 35 25" stroke={colors.primary} strokeWidth="3" fill="none"/>
            <path d="M 50 33 Q 58 28 65 23" stroke={colors.primary} strokeWidth="3" fill="none"/>
            
            {/* Dense foliage */}
            <ellipse cx="25" cy="70" rx="14" ry="19" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="20" cy="68" rx="12" ry="16" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="75" cy="68" rx="15" ry="20" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="80" cy="66" rx="13" ry="17" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="28" cy="55" rx="13" ry="18" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="72" cy="53" rx="14" ry="19" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="30" cy="40" rx="12" ry="17" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="70" cy="38" rx="13" ry="18" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="35" cy="25" rx="11" ry="16" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="65" cy="23" rx="12" ry="17" fill={colors.secondary} opacity="0.9"/>
            
            {/* Majestic crown */}
            <ellipse cx="42" cy="15" rx="14" ry="18" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="58" cy="13" rx="13" ry="17" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="50" cy="10" rx="12" ry="16" fill={colors.secondary} opacity="0.95"/>
            
            {/* Multiple blooms */}
            {health > 60 && (
              <>
                <circle cx="25" cy="70" r="5" fill="#FFD700" opacity="0.95"/>
                <circle cx="75" cy="68" r="5" fill="#FFD700" opacity="0.95"/>
                <circle cx="30" cy="40" r="4" fill="#FFD700" opacity="0.9"/>
                <circle cx="70" cy="38" r="4" fill="#FFD700" opacity="0.9"/>
                <circle cx="50" cy="10" r="6" fill="#FFD700" opacity="1"/>
              </>
            )}
            
            {/* Sparkles for healthy plant */}
            {health > 80 && (
              <>
                <circle cx="15" cy="60" r="2" fill="#FFF" opacity="0.8">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="85" cy="58" r="2" fill="#FFF" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="50" cy="5" r="3" fill="#FFF" opacity="0.9">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
                </circle>
              </>
            )}
          </g>
        );
      
      default:
        return renderPlant();
    }
  };

  return (
    <svg
      width={baseSize}
      height={baseSize}
      viewBox="0 0 100 100"
      className="transition-all duration-700 ease-in-out"
      style={{
        filter: health > 80 ? `drop-shadow(0 0 10px ${colors.primary}40)` : 'none',
      }}
      aria-label={`${mood} mood plant at stage ${stage} with ${health}% health`}
      role="img"
    >
      {renderPlant()}
    </svg>
  );
};

export default PlantSVG;
