
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import { Leaf, Flower2, TreePine, Sprout, TreeDeciduous, Settings2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { MOOD_COLORS } from '@/constants/moodColors';
import { MoodType } from '@/types/mood';
import { calculateStreak } from '@/utils/streakUtils';

// Feature 10: Customisable garden plant types
export type PlantStyle = 'sprout' | 'flower' | 'tree' | 'pine' | 'bamboo';

export interface GardenConfig {
  plantStyle: PlantStyle;
  potColor: string;
}

const PLANT_OPTIONS: { id: PlantStyle; label: string; emoji: string; icon: React.ReactNode }[] = [
  { id: 'sprout',  label: 'Sprout',  emoji: '🌱', icon: <Sprout size={20} />  },
  { id: 'flower',  label: 'Flower',  emoji: '🌸', icon: <Flower2 size={20} /> },
  { id: 'tree',    label: 'Oak',     emoji: '🌳', icon: <TreeDeciduous size={20} /> },
  { id: 'pine',    label: 'Pine',    emoji: '🌲', icon: <TreePine size={20} /> },
  { id: 'bamboo',  label: 'Bamboo',  emoji: '🎋', icon: <Leaf size={20} />    },
];

const POT_COLORS = [
  { id: 'terracotta', label: 'Terracotta', hex: '#c2724f' },
  { id: 'cobalt',     label: 'Cobalt',     hex: '#2563eb' },
  { id: 'sage',       label: 'Sage',       hex: '#4d7c60' },
  { id: 'lavender',   label: 'Lavender',   hex: '#7c3aed' },
  { id: 'charcoal',   label: 'Charcoal',   hex: '#374151' },
  { id: 'rose',       label: 'Rose',       hex: '#e11d48' },
];

const STORAGE_KEY = 'gardenConfig';

function loadConfig(): GardenConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { plantStyle: 'sprout', potColor: '#c2724f' };
}

function saveConfig(cfg: GardenConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function useGardenConfig() {
  const [config, setConfig] = useState<GardenConfig>(loadConfig);

  const update = (partial: Partial<GardenConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  };

  return { config, update };
}

interface GardenCustomiserProps {
  config: GardenConfig;
  onUpdate: (partial: Partial<GardenConfig>) => void;
}

export const GardenCustomiser: React.FC<GardenCustomiserProps> = ({ config, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const { moodEntries } = useMood();
  const currentStreak = calculateStreak(moodEntries);

  // Define unlock requirements
  const PLANT_UNLOCKS: Record<PlantStyle, number> = {
    sprout: 0,
    flower: 3,
    tree: 7,
    pine: 14,
    bamboo: 30
  };

  const POT_UNLOCKS: Record<string, number> = {
    '#c2724f': 0, // Terracotta
    '#2563eb': 3, // Cobalt
    '#4d7c60': 7, // Sage
    '#7c3aed': 14, // Lavender
    '#374151': 21, // Charcoal
    '#e11d48': 30, // Rose
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
        aria-label="Customise garden"
        title="Customise garden"
      >
        <Settings2 size={15} aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Leaf size={18} aria-hidden="true" /> Customise Your Garden
            </SheetTitle>
            <SheetDescription>
              Pick a plant style and pot colour. Keep journaling to unlock more!
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Plant style */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Plant Style</p>
                <Badge variant="outline" className="text-xs">{currentStreak} Day Streak</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PLANT_OPTIONS.map(opt => {
                  const req = PLANT_UNLOCKS[opt.id];
                  const isLocked = currentStreak < req;
                  return (
                    <Button
                      key={opt.id}
                      variant={config.plantStyle === opt.id ? 'default' : 'outline'}
                      className={`h-auto py-3 flex items-center justify-start gap-2 ${isLocked ? 'opacity-50 grayscale' : ''}`}
                      onClick={() => !isLocked && onUpdate({ plantStyle: opt.id })}
                      disabled={isLocked}
                      aria-pressed={config.plantStyle === opt.id}
                      title={isLocked ? `Unlocks at ${req} day streak` : `Select ${opt.label}`}
                    >
                      <span aria-hidden="true">{isLocked ? '🔒' : opt.emoji}</span>
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Pot colour */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Pot Colour</p>
              <div className="flex flex-wrap gap-3">
                {POT_COLORS.map(pot => {
                  const req = POT_UNLOCKS[pot.hex] || 0;
                  const isLocked = currentStreak < req;
                  return (
                    <button
                      key={pot.id}
                      title={isLocked ? `Unlocks at ${req} streak` : pot.label}
                      aria-label={`${pot.label} pot${config.potColor === pot.hex ? ' (selected)' : ''}`}
                      aria-pressed={config.potColor === pot.hex}
                      disabled={isLocked}
                      className="w-8 h-8 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center relative shadow-sm"
                      style={{
                        backgroundColor: isLocked ? '#e5e7eb' : pot.hex,
                        borderColor: config.potColor === pot.hex ? '#fff' : 'transparent',
                        outline: config.potColor === pot.hex ? `2px solid ${pot.hex}` : undefined,
                        opacity: isLocked ? 0.5 : 1
                      }}
                      onClick={() => onUpdate({ potColor: pot.hex })}
                    >
                      {isLocked && <span className="text-xs relative z-10" aria-hidden="true">🔒</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Selected: <span className="font-medium">{POT_COLORS.find(p => p.hex === config.potColor)?.label ?? 'Custom'}</span></p>
            </div>

            {/* Preview badge */}
            <div className="p-4 bg-muted/40 rounded-lg text-center space-y-2">
              <p className="text-2xl" aria-hidden="true">
                {PLANT_OPTIONS.find(p => p.id === config.plantStyle)?.emoji ?? '🌱'}
              </p>
              <div
                className="mx-auto w-8 h-4 rounded-b-full"
                style={{ backgroundColor: config.potColor }}
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">Preview</p>
            </div>

            <Button variant="default" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default GardenCustomiser;
