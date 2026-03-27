
import React, { useMemo } from 'react';
import { MoodEntry } from '@/types/mood';
import { MOOD_LABELS, MOOD_EMOJIS, MOOD_COLORS } from '@/constants/moodColors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, TrendingDown, Minus, Lightbulb, Sun, Moon, Clock } from 'lucide-react';
import { calculateStreak } from '@/utils/streakUtils';
import { format, subDays, isSameDay } from 'date-fns';
import { MoodType } from '@/types/mood';

interface MoodAISummaryProps {
  entries: MoodEntry[];
}

// Feature 7: Deterministic, locally-generated mood pattern summary (no API needed)
export default function MoodAISummary({ entries }: MoodAISummaryProps) {
  const summary = useMemo(() => {
    if (entries.length < 2) return null;

    const now = new Date();
    const last7 = entries.filter(e => new Date(e.timestamp) >= subDays(now, 7));
    const prev7 = entries.filter(e => {
      const d = new Date(e.timestamp);
      return d >= subDays(now, 14) && d < subDays(now, 7);
    });

    // Mood frequency
    const freqMap = (list: MoodEntry[]) =>
      list.reduce((acc, e) => { acc[e.mood] = (acc[e.mood] || 0) + 1; return acc; }, {} as Record<string, number>);

    const freq7 = freqMap(last7);
    const freqPrev = freqMap(prev7);

    const dominantMood = Object.entries(freq7).sort((a, b) => b[1] - a[1])[0] as [MoodType, number] | undefined;
    const streak = calculateStreak(entries);

    // Positive moods for trend
    const positives = ['happy', 'calm', 'energetic'];
    const score7 = last7.filter(e => positives.includes(e.mood)).length / Math.max(last7.length, 1);
    const scorePrev = prev7.filter(e => positives.includes(e.mood)).length / Math.max(prev7.length, 1);
    const trend = score7 > scorePrev + 0.1 ? 'up' : score7 < scorePrev - 0.1 ? 'down' : 'stable';

    // Time-of-day analysis
    const morning = last7.filter(e => { const h = new Date(e.timestamp).getHours(); return h >= 5 && h < 12; });
    const evening = last7.filter(e => { const h = new Date(e.timestamp).getHours(); return h >= 17 && h < 24; });
    const prefersEvening = evening.length > morning.length;

    // Word count check
    const avgWords = last7.reduce((sum, e) => sum + (e.journalText?.split(/\s+/).filter(Boolean).length ?? 0), 0) / Math.max(last7.length, 1);

    // Build insights
    const insights: { icon: React.ReactNode; text: string; color: string }[] = [];

    if (dominantMood) {
      const pct = Math.round((dominantMood[1] / last7.length) * 100);
      insights.push({
        icon: <span aria-hidden="true">{MOOD_EMOJIS[dominantMood[0]]}</span>,
        text: `Your dominant mood this week is **${MOOD_LABELS[dominantMood[0]]}** — appearing in ${pct}% of entries.`,
        color: MOOD_COLORS[dominantMood[0]],
      });
    }

    if (trend === 'up') {
      insights.push({
        icon: <TrendingUp size={16} aria-hidden="true" />,
        text: 'Positive shift: Your mood wellbeing **improved** compared to last week. Keep going!',
        color: '#10b981',
      });
    } else if (trend === 'down') {
      insights.push({
        icon: <TrendingDown size={16} aria-hidden="true" />,
        text: 'Your positive mood ratio is slightly lower than last week. Be gentle with yourself.',
        color: '#f59e0b',
      });
    } else {
      insights.push({
        icon: <Minus size={16} aria-hidden="true" />,
        text: 'Your mood has been **consistent** this week — stable is good.',
        color: '#6366f1',
      });
    }

    if (streak >= 3) {
      insights.push({
        icon: <TrendingUp size={16} aria-hidden="true" />,
        text: `**${streak}-day streak!** Showing up every day is the hardest part — you're doing great.`,
        color: '#f97316',
      });
    }

    insights.push({
      icon: prefersEvening ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />,
      text: prefersEvening
        ? 'You tend to **journal in the evenings** — a great way to reflect and wind down.'
        : 'You prefer **morning check-ins** — setting a mindful tone for the day.',
      color: '#8b5cf6',
    });

    if (avgWords > 30) {
      insights.push({
        icon: <Brain size={16} aria-hidden="true" />,
        text: `Strong self-reflection habit — averaging **${Math.round(avgWords)} words** per entry this week.`,
        color: '#06b6d4',
      });
    } else if (last7.length > 0) {
      insights.push({
        icon: <Lightbulb size={16} aria-hidden="true" />,
        text: 'Try writing a few more sentences — even 2–3 extra words per entry deepens self-awareness.',
        color: '#eab308',
      });
    }

    // Suggestion
    let suggestion = '';
    if (dominantMood) {
      const m = dominantMood[0];
      if (m === 'anxious') suggestion = 'Try the 4-7-8 breathing exercise in Wellness to calm your nervous system.';
      else if (m === 'sad') suggestion = 'A 5-minute guided meditation or a gratitude prompt might help lift your spirits.';
      else if (m === 'angry') suggestion = 'Box breathing or a short walk can help discharge tension before journaling.';
      else if (m === 'happy') suggestion = 'You\'re thriving! Use this energy to write a gratitude journal entry.';
      else if (m === 'calm') suggestion = 'Your calm state is perfect for deeper reflective journaling. Try a longer prompt today.';
      else if (m === 'energetic') suggestion = 'Channel that energy into a longer journal entry or tackle something you\'ve been putting off.';
    }

    return { insights, suggestion, totalWeek: last7.length, trend };
  }, [entries]);

  if (!summary || entries.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain size={18} aria-hidden="true" /> Weekly Mood Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Log at least 2 entries to unlock your personalized summary.</p>
        </CardContent>
      </Card>
    );
  }

  // Render text with **bold** markers
  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain size={18} aria-hidden="true" />
          Weekly Mood Summary
          <span className="ml-auto text-xs font-normal text-muted-foreground">{summary.totalWeek} entries this week</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <div
              className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: insight.color }}
            >
              {insight.icon}
            </div>
            <p className="text-foreground/80 leading-relaxed">{renderText(insight.text)}</p>
          </div>
        ))}

        {summary.suggestion && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
            <p className="font-medium text-primary mb-0.5 flex items-center gap-1">
              <Lightbulb size={13} aria-hidden="true" /> This week's tip
            </p>
            <p className="text-foreground/70">{summary.suggestion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
