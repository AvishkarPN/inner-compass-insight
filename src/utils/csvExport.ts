import { MoodEntry } from '@/types/mood';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';

/** Feature 5: Convert moodEntries array to a downloadable CSV string */
export function entriesToCSV(entries: MoodEntry[]): string {
  const headers = ['Date', 'Time', 'Mood', 'Emoji', 'Journal Entry'];
  const rows = entries
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(entry => {
      const d = new Date(entry.timestamp);
      const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const mood = MOOD_LABELS[entry.mood] ?? entry.mood;
      const emoji = MOOD_EMOJIS[entry.mood] ?? '';
      const journal = `"${(entry.journalText ?? '').replace(/"/g, '""')}"`;
      return [date, time, mood, emoji, journal].join(',');
    });

  return [headers.join(','), ...rows].join('\n');
}

/** Trigger a browser download of CSV data */
export function downloadCSV(csv: string, filename = 'mind-garden.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Feature 5: One-call export helper */
export function exportMoodCSV(entries: MoodEntry[]) {
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(entriesToCSV(entries), `mind-garden-${date}.csv`);
}
