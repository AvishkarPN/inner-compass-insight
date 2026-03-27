import { MoodType } from '@/types/mood';

/**
 * Single source of truth for all mood-related constants.
 * All components must import from here — never define mood colors inline.
 * Resolves Issues #2, #5.
 */

export const MOOD_COLORS: Record<MoodType, string> = {
  happy:     '#feca57',
  calm:      '#48dbfb',
  sad:       '#a29bfe',
  anxious:   '#fd79a8',
  angry:     '#ff7675',
  energetic: '#55efc4',
};

export const MOOD_LABELS: Record<MoodType, string> = {
  happy:     'Happy',
  calm:      'Calm',
  sad:       'Sad',
  anxious:   'Anxious',
  angry:     'Angry',
  energetic: 'Energetic',
};

export const MOOD_EMOJIS: Record<MoodType, string> = {
  happy:     '😊',
  calm:      '😌',
  sad:       '😢',
  anxious:   '😰',
  angry:     '😤',
  energetic: '⚡',
};
