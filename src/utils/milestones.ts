import * as confettiModule from 'canvas-confetti';
const confetti = (confettiModule as any).default ?? confettiModule;

export interface Milestone {
  streak: number;
  label: string;
  emoji: string;
}

// Feature 11: Streak milestones that trigger confetti
export const STREAK_MILESTONES: Milestone[] = [
  { streak: 1,  label: 'First Entry!',         emoji: '🌱' },
  { streak: 3,  label: '3-Day Streak',          emoji: '🔥' },
  { streak: 7,  label: 'One Week Streak!',      emoji: '🌟' },
  { streak: 14, label: 'Two Weeks Going!',      emoji: '💪' },
  { streak: 21, label: '3 Weeks — Habit Set!',  emoji: '🏆' },
  { streak: 30, label: '30-Day Milestone!',     emoji: '🎊' },
  { streak: 50, label: '50 Days — Legendary!',  emoji: '👑' },
  { streak: 100,label: '100 Days — Iconic!',    emoji: '🚀' },
];

/** Checks if the new streak just crossed a milestone threshold */
export function getNewMilestone(prevStreak: number, newStreak: number): Milestone | null {
  return STREAK_MILESTONES.find(m => m.streak === newStreak && prevStreak < newStreak) ?? null;
}

/** Fires a confetti burst appropriate to the milestone */
export function fireMilestoneCelebration(milestone: Milestone) {
  // For rare milestones, do a bigger burst
  const big = milestone.streak >= 30;

  confetti({
    particleCount: big ? 200 : 100,
    spread: big ? 120 : 80,
    origin: { y: 0.6 },
    colors: ['#feca57', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'],
    scalar: big ? 1.2 : 1,
    gravity: 0.9,
    ticks: big ? 300 : 200,
  });

  if (big) {
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#feca57', '#ff6b6b', '#48dbfb'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff9ff3', '#54a0ff', '#5f27cd'],
      });
    }, 300);
  }
}
