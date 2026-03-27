import React from 'react';
import { MoodType } from '@/types/mood';
import { MOOD_COLORS } from '@/constants/moodColors';

interface PlantSVGProps {
  mood: MoodType;
  stage: number;
  health: number;
  size: number;
}

const PlantSVG: React.FC<PlantSVGProps> = ({ mood, stage, health, size }) => {
  const baseSize = size;
  // A9: Clamp stage to [0, 4] to prevent any out-of-range renders
  const safeStage = Math.max(0, Math.min(4, Math.floor(stage)));
  const healthScale = Math.max(0.5, health / 100);
  
  // Build a vibrant palette from base mood color
  // A2: Use single source of truth colors
  const base = MOOD_COLORS[mood] ?? '#10b981';
  const lighten = (hex: string, amount: number) => {
    const clamp = (n: number) => Math.max(0, Math.min(255, n));
    const num = parseInt(hex.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00ff) + amount);
    const b = clamp((num & 0x0000ff) + amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  const darken = (hex: string, amount: number) => lighten(hex, -amount);
  
  // Rich color palette with depth
  const colors = {
    stem: '#2D5016',        // Rich forest green stem
    stemLight: '#4A7C2C',   // Lighter stem highlights
    primary: darken(base, 15),
    secondary: base,
    accent: lighten(base, 30),
    highlight: lighten(base, 50)
  };
  
  // Opacity based on health
  const opacity = 0.7 + (healthScale * 0.3);
  
  // Different plant stages
  const renderPlant = (stageOverride?: number) => {
    switch (stageOverride !== undefined ? stageOverride : safeStage) {
      case 0: // Seed with early sprout
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil mound */}
            <ellipse cx="50" cy="90" rx="28" ry="9" fill="#6B5744" opacity="0.8"/>
            <ellipse cx="50" cy="89" rx="25" ry="7" fill="#8B7355" opacity="0.7"/>
            {/* Seed */}
            <ellipse cx="50" cy="91" rx="4" ry="3" fill="#4A3C2A"/>
            {/* Early sprout with animation */}
            <path d="M 50 88 Q 49 84 50 80" stroke={colors.stem} strokeWidth="2.5" fill="none" strokeLinecap="round">
              <animate attributeName="d" dur="2.5s" repeatCount="indefinite"
                values="M 50 88 Q 49 84 50 80; M 50 88 Q 49 78 50 72; M 50 88 Q 49 84 50 80" />
            </path>
            {/* Tiny leaves emerging */}
            <ellipse cx="48" cy="78" rx="3" ry="5" fill={colors.secondary} opacity="0.9">
              <animateTransform attributeName="transform" type="rotate" from="-8 48 78" to="8 48 78" dur="3s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="52" cy="76" rx="3.5" ry="5.5" fill={colors.accent} opacity="0.85">
              <animateTransform attributeName="transform" type="rotate" from="8 52 76" to="-8 52 76" dur="3s" repeatCount="indefinite"/>
            </ellipse>
          </g>
        );
      
      case 1: // Young sprout
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil */}
            <ellipse cx="50" cy="90" rx="32" ry="11" fill="#6B5744" opacity="0.8"/>
            <ellipse cx="50" cy="89" rx="30" ry="9" fill="#8B7355" opacity="0.7"/>
            {/* Main stem with gradient effect */}
            <defs>
              <linearGradient id="stemGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.stemLight} stopOpacity="1"/>
                <stop offset="100%" stopColor={colors.stem} stopOpacity="1"/>
              </linearGradient>
            </defs>
            <path d="M 50 90 Q 48 68 50 48 Q 52 38 50 32" stroke="url(#stemGrad1)" strokeWidth="4.5" fill="none" strokeLinecap="round">
              <animate attributeName="d" dur="3s" repeatCount="indefinite"
                values="M 50 90 Q 49 75 50 55 Q 51 45 50 38; M 50 90 Q 48 68 50 48 Q 52 38 50 32; M 50 90 Q 49 75 50 55 Q 51 45 50 38" />
            </path>
            {/* Leaves with depth */}
            <ellipse cx="43" cy="62" rx="9" ry="13" fill={colors.primary} opacity="0.95">
              <animateTransform attributeName="transform" type="rotate" values="-3 43 62;3 43 62;-3 43 62" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="45" cy="60" rx="8" ry="11" fill={colors.secondary} opacity="0.9"/>
            <ellipse cx="57" cy="57" rx="10" ry="14" fill={colors.primary} opacity="0.95">
              <animateTransform attributeName="transform" type="rotate" values="3 57 57;-3 57 57;3 57 57" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="55" cy="55" rx="9" ry="12" fill={colors.secondary} opacity="0.9"/>
            {/* Top leaves */}
            <ellipse cx="47" cy="42" rx="7.5" ry="11" fill={colors.accent} opacity="0.9"/>
            <ellipse cx="53" cy="38" rx="8.5" ry="12" fill={colors.highlight} opacity="0.85"/>
          </g>
        );
      
      case 2: // Growing plant with branches
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Soil with texture */}
            <ellipse cx="50" cy="92" rx="37" ry="13" fill="#6B5744" opacity="0.8"/>
            <ellipse cx="50" cy="91" rx="35" ry="11" fill="#8B7355" opacity="0.7"/>
            {/* Main stem with shading */}
            <defs>
              <linearGradient id="stemGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.stem} stopOpacity="0.9"/>
                <stop offset="50%" stopColor={colors.stemLight} stopOpacity="1"/>
                <stop offset="100%" stopColor={colors.stem} stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            <path
              d="M 50 92 Q 48 63 50 38 Q 52 23 50 18"
              stroke="url(#stemGrad2)"
              strokeWidth="5.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Branches with life */}
            <path d="M 50 70 Q 40 66 34 61" stroke={colors.stem} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 60 Q 60 56 66 51" stroke={colors.stem} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 50 Q 41 46 36 41" stroke={colors.stem} strokeWidth="3" fill="none" strokeLinecap="round"/>
            
            {/* Layered leaves for depth */}
            <ellipse cx="32" cy="62" rx="11" ry="16" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="35" cy="60" rx="10" ry="14" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="30" cy="58" rx="8" ry="11" fill={colors.accent} opacity="0.9"/>
            
            <ellipse cx="68" cy="52" rx="12" ry="17" fill={colors.primary} opacity="0.95"/>
            <ellipse cx="65" cy="50" rx="11" ry="15" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="70" cy="48" rx="9" ry="12" fill={colors.highlight} opacity="0.9"/>
            
            <ellipse cx="34" cy="42" rx="10" ry="15" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="38" cy="40" rx="9" ry="13" fill={colors.accent} opacity="0.9"/>
            
            {/* Crown leaves with gentle animation */}
            <ellipse cx="46" cy="28" rx="11" ry="15" fill={colors.primary} opacity="0.95">
              <animateTransform attributeName="transform" type="rotate" values="-2 46 28;2 46 28;-2 46 28" dur="5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="54" cy="24" rx="10" ry="14" fill={colors.secondary} opacity="0.95">
              <animateTransform attributeName="transform" type="rotate" values="2 54 24;-2 54 24;2 54 24" dur="5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="20" rx="9" ry="12" fill={colors.highlight} opacity="0.9"/>
          </g>
        );
      
      case 3: // Mature flourishing plant
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Rich soil base */}
            <ellipse cx="50" cy="94" rx="42" ry="14" fill="#6B5744" opacity="0.85"/>
            <ellipse cx="50" cy="93" rx="40" ry="12" fill="#8B7355" opacity="0.75"/>
            {/* Strong trunk with texture */}
            <defs>
              <linearGradient id="stemGrad3" x1="30%" y1="0%" x2="70%" y2="0%">
                <stop offset="0%" stopColor={colors.stem} stopOpacity="0.85"/>
                <stop offset="40%" stopColor={colors.stemLight} stopOpacity="1"/>
                <stop offset="60%" stopColor={colors.stemLight} stopOpacity="1"/>
                <stop offset="100%" stopColor={colors.stem} stopOpacity="0.85"/>
              </linearGradient>
            </defs>
            <path
              d="M 50 94 Q 48 58 50 28 Q 52 13 50 8"
              stroke="url(#stemGrad3)"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Multiple organic branches */}
            <path d="M 50 75 Q 37 71 28 67" stroke={colors.stem} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 72 Q 63 68 72 64" stroke={colors.stem} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 60 Q 39 56 30 52" stroke={colors.stemLight} strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M 50 57 Q 61 53 70 49" stroke={colors.stemLight} strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M 50 45 Q 41 41 33 37" stroke={colors.stem} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 42 Q 59 38 67 34" stroke={colors.stem} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            
            {/* Lush layered foliage */}
            <ellipse cx="26" cy="68" rx="13" ry="18" fill={colors.primary} opacity="0.98"/>
            <ellipse cx="30" cy="66" rx="12" ry="16" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="24" cy="64" rx="10" ry="13" fill={colors.accent} opacity="0.92"/>
            
            <ellipse cx="74" cy="65" rx="14" ry="19" fill={colors.primary} opacity="0.98"/>
            <ellipse cx="70" cy="63" rx="13" ry="17" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="76" cy="61" rx="11" ry="14" fill={colors.highlight} opacity="0.92"/>
            
            <ellipse cx="28" cy="53" rx="12" ry="17" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="32" cy="51" rx="11" ry="15" fill={colors.accent} opacity="0.92"/>
            
            <ellipse cx="72" cy="50" rx="13" ry="18" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="68" cy="48" rx="12" ry="16" fill={colors.highlight} opacity="0.92"/>
            
            <ellipse cx="31" cy="38" rx="11" ry="16" fill={colors.accent} opacity="0.95"/>
            <ellipse cx="69" cy="35" rx="12" ry="17" fill={colors.accent} opacity="0.95"/>
            
            {/* Magnificent crown with gentle sway */}
            <ellipse cx="43" cy="18" rx="13" ry="17" fill={colors.primary} opacity="0.98">
              <animateTransform attributeName="transform" type="rotate" values="-1.5 43 18;1.5 43 18;-1.5 43 18" dur="6s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="57" cy="16" rx="12" ry="16" fill={colors.secondary} opacity="0.98">
              <animateTransform attributeName="transform" type="rotate" values="1.5 57 16;-1.5 57 16;1.5 57 16" dur="6s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="13" rx="11" ry="15" fill={colors.highlight} opacity="0.95"/>
            
            {/* Beautiful blooms for healthy plants */}
            {health > 70 && (
              <>
                <circle cx="26" cy="68" r="5" fill="#FCD34D" opacity="0.95">
                  <animate attributeName="r" values="5;5.5;5" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="74" cy="65" r="5" fill="#FCD34D" opacity="0.95">
                  <animate attributeName="r" values="5;5.5;5" dur="3s" begin="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="50" cy="13" r="6" fill="#FBBF24" opacity="0.98">
                  <animate attributeName="r" values="6;6.5;6" dur="3s" begin="2s" repeatCount="indefinite"/>
                </circle>
              </>
            )}
          </g>
        );
      
      case 4: // Majestic mature tree
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            {/* Deep root system visualization */}
            <ellipse cx="50" cy="95" rx="48" ry="16" fill="#6B5744" opacity="0.9"/>
            <ellipse cx="50" cy="94" rx="45" ry="14" fill="#8B7355" opacity="0.8"/>
            {/* Robust trunk with rich detail */}
            <defs>
              <radialGradient id="stemGrad4">
                <stop offset="30%" stopColor={colors.stemLight} stopOpacity="1"/>
                <stop offset="80%" stopColor={colors.stem} stopOpacity="0.95"/>
              </radialGradient>
            </defs>
            <path
              d="M 50 95 Q 48 48 50 18 Q 52 6 50 3"
              stroke="url(#stemGrad4)"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
            {/* Complex branch network */}
            <path d="M 50 80 Q 33 76 22 72" stroke={colors.stem} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 78 Q 67 74 78 70" stroke={colors.stem} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 65 Q 36 61 25 57" stroke={colors.stemLight} strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M 50 63 Q 64 59 75 55" stroke={colors.stemLight} strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M 50 50 Q 38 46 27 42" stroke={colors.stem} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 48 Q 62 44 73 40" stroke={colors.stem} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 35 Q 40 31 32 27" stroke={colors.stemLight} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M 50 33 Q 60 29 68 25" stroke={colors.stemLight} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            
            {/* Dense, vibrant foliage with depth */}
            <ellipse cx="20" cy="73" rx="15" ry="20" fill={colors.primary} opacity="0.98"/>
            <ellipse cx="24" cy="71" rx="14" ry="18" fill={colors.secondary} opacity="0.98"/>
            <ellipse cx="18" cy="69" rx="12" ry="15" fill={colors.accent} opacity="0.95"/>
            
            <ellipse cx="80" cy="71" rx="16" ry="21" fill={colors.primary} opacity="0.98"/>
            <ellipse cx="76" cy="69" rx="15" ry="19" fill={colors.secondary} opacity="0.98"/>
            <ellipse cx="82" cy="67" rx="13" ry="16" fill={colors.highlight} opacity="0.95"/>
            
            <ellipse cx="23" cy="58" rx="14" ry="19" fill={colors.secondary} opacity="0.98"/>
            <ellipse cx="27" cy="56" rx="13" ry="17" fill={colors.accent} opacity="0.95"/>
            
            <ellipse cx="77" cy="56" rx="15" ry="20" fill={colors.secondary} opacity="0.98"/>
            <ellipse cx="73" cy="54" rx="14" ry="18" fill={colors.highlight} opacity="0.95"/>
            
            <ellipse cx="25" cy="43" rx="13" ry="18" fill={colors.accent} opacity="0.98"/>
            <ellipse cx="75" cy="41" rx="14" ry="19" fill={colors.accent} opacity="0.98"/>
            
            <ellipse cx="30" cy="28" rx="12" ry="17" fill={colors.secondary} opacity="0.95"/>
            <ellipse cx="70" cy="26" rx="13" ry="18" fill={colors.secondary} opacity="0.95"/>
            
            {/* Majestic crown with animation */}
            <ellipse cx="40" cy="13" rx="15" ry="19" fill={colors.primary} opacity="1">
              <animateTransform attributeName="transform" type="rotate" values="-2 40 13;2 40 13;-2 40 13" dur="7s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="60" cy="11" rx="14" ry="18" fill={colors.secondary} opacity="1">
              <animateTransform attributeName="transform" type="rotate" values="2 60 11;-2 60 11;2 60 11" dur="7s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="8" rx="13" ry="17" fill={colors.highlight} opacity="0.98"/>
            
            {/* Abundant blooms for thriving tree */}
            {health > 60 && (
              <>
                <circle cx="20" cy="73" r="6" fill="#FCD34D" opacity="0.98">
                  <animate attributeName="r" values="6;6.8;6" dur="3.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="80" cy="71" r="6" fill="#FBBF24" opacity="0.98">
                  <animate attributeName="r" values="6;6.8;6" dur="3.5s" begin="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="25" cy="43" r="5" fill="#FCD34D" opacity="0.95">
                  <animate attributeName="r" values="5;5.6;5" dur="3s" begin="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="75" cy="41" r="5" fill="#FBBF24" opacity="0.95">
                  <animate attributeName="r" values="5;5.6;5" dur="3s" begin="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="50" cy="8" r="7" fill="#F59E0B" opacity="1">
                  <animate attributeName="r" values="7;7.8;7" dur="4s" begin="0.5s" repeatCount="indefinite"/>
                </circle>
              </>
            )}
            
            {/* Mood-specific particle effects */}
            {health > 75 && mood === 'happy' && (
              <>
                <circle cx="42" cy="18" r="2" fill={colors.accent} opacity="0.95">
                  <animate attributeName="cy" from="18" to="98" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="42;44;40;42" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0.7;0.95" dur="5s" repeatCount="indefinite" />
                </circle>
                <circle cx="58" cy="14" r="2" fill={colors.secondary} opacity="0.9">
                  <animate attributeName="cy" from="14" to="98" dur="6s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="58;60;56;58" dur="6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.6;0.9" dur="6s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {health > 75 && mood === 'energetic' && (
              <>
                <circle cx="50" cy="6" r="2.5" fill="#FFFFFF" opacity="0.9">
                  <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.5;3;2.5" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="18" cy="50" r="2" fill="#FFFFFF" opacity="0.85">
                  <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2;2.5;2" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="82" cy="48" r="2" fill="#FFFFFF" opacity="0.85">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {health > 75 && mood === 'calm' && (
              <>
                <circle cx="35" cy="25" r="1.5" fill={colors.highlight} opacity="0.7">
                  <animate attributeName="cy" values="25;95" dur="8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="22" r="1.5" fill={colors.accent} opacity="0.7">
                  <animate attributeName="cy" values="22;95" dur="9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="9s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </g>
        );
      
      default:
        // A9 FIX: Was calling renderPlant() recursively — infinite loop when stage is
        // unexpected. Now renders stage 0 directly as a safe fallback.
        return (
          <g transform={`scale(${healthScale})`} opacity={opacity}>
            <ellipse cx="50" cy="90" rx="28" ry="9" fill="#6B5744" opacity="0.8"/>
            <ellipse cx="50" cy="89" rx="25" ry="7" fill="#8B7355" opacity="0.7"/>
            <ellipse cx="50" cy="91" rx="4" ry="3" fill="#4A3C2A"/>
            <path d="M 50 88 Q 49 84 50 80" stroke={colors.stem} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </g>
        );
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
      aria-label={`${mood} mood plant at stage ${safeStage} with ${health}% health`}
      role="img"
    >
      {renderPlant()}
    </svg>
  );
};

export default PlantSVG;
