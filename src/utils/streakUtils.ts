import { MoodEntry } from '@/types/mood';

/**
 * Unified streak calculation used across Dashboard, Insights, and Wellness.
 * Resolves Issue #21 — previously each page had its own divergent logic.
 */
export function calculateStreak(entries: MoodEntry[]): number {
  if (!entries.length) return 0;

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(sorted[0].timestamp);
  mostRecent.setHours(0, 0, 0, 0);

  const diffDays = (today.getTime() - mostRecent.getTime()) / 86400000;
  // If the most recent entry is more than 1 day ago, streak is 0
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].timestamp);
    const curr = new Date(sorted[i].timestamp);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const gap = (prev.getTime() - curr.getTime()) / 86400000;
    if (gap === 1) {
      streak++;
    } else if (gap > 1) {
      break; // streak broken
    }
    // gap === 0 means multiple entries on same day — skip, don't break
  }

  return streak;
}

/**
 * Returns true if the user has already logged an entry today.
 */
export function hasLoggedToday(entries: MoodEntry[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return entries.some(entry => {
    const d = new Date(entry.timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}
