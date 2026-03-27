// 30+ mindfulness, gratitude, and reflection prompts — rotated daily by date seed
export const JOURNAL_PROMPTS = [
  "What moment today made you feel most alive?",
  "Name three things you're genuinely grateful for right now.",
  "What emotion has dominated your day, and what triggered it?",
  "Describe a challenge you faced today. What did it teach you?",
  "Who made a positive impact on your day, and how?",
  "What's one thing you're proud of yourself for this week?",
  "If you could change one thing about today, what would it be?",
  "What does your body need right now — rest, movement, nourishment?",
  "Complete this sentence: 'I feel most like myself when…'",
  "What's been weighing on your mind lately? Let it out here.",
  "Describe a small joy you experienced today.",
  "What are you looking forward to in the next 24 hours?",
  "What boundary did you uphold (or wish you had) today?",
  "What would you tell your morning self that you now know?",
  "How did you show up for someone else today?",
  "What's something you've been putting off? Why?",
  "Describe your mood as a weather pattern. What's the forecast?",
  "What drained your energy today, and how can you protect it tomorrow?",
  "Name one thing you learned — about the world or yourself.",
  "What coping skill helped you through a tough moment?",
  "What made you laugh or smile today?",
  "If your feelings could talk, what would they say right now?",
  "What act of self-care do you need most this week?",
  "What's a fear you've been avoiding? Can you write it down?",
  "Describe your relationships today — how did you connect with others?",
  "What would make this week feel successful?",
  "What is one negative thought you'd like to reframe positively?",
  "Describe a place where you feel completely at peace.",
  "What values guided your decisions today?",
  "Write about a person who inspires you and why.",
  "What's something you're working on accepting?",
  "How has your mood shifted since this morning? What changed it?",
];

/** Returns a deterministic daily prompt based on today's date */
export function getDailyPrompt(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return JOURNAL_PROMPTS[dayOfYear % JOURNAL_PROMPTS.length];
}
