import React, { useMemo } from 'react';
import { MoodEntry } from '@/types/mood';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, HeartPulse, Activity } from 'lucide-react';
import { subDays, differenceInDays } from 'date-fns';

interface AIPatternDetectorProps {
  entries: MoodEntry[];
}

const MOOD_SCORES: Record<string, number> = {
  happy: 5, energetic: 5, calm: 4, neutral: 3, sad: 2, anxious: 2, angry: 1
};

const STRESS_WORDS = ['frustrated', 'overwhelmed', 'hopeless', 'tired', 'exhausted', 'stressed', 'can\'t', 'done', 'burnout', 'heavy', 'dread'];
const SOCIAL_WORDS = ['friend', 'friends', 'classmate', 'classmates', 'group', 'family', 'hanging out', 'talking', 'met', 'together', 'party', 'people', 'social'];
const ISOLATION_WORDS = ['lonely', 'alone', 'no one', 'avoided', 'stayed in', 'ignored', 'by myself', 'isolated'];

export default function AIPatternDetector({ entries }: AIPatternDetectorProps) {
  const analysis = useMemo(() => {
    if (entries.length < 5) return null; // Need enough data

    const now = new Date();
    const last14Days = entries.filter(e => new Date(e.timestamp) >= subDays(now, 14)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (last14Days.length === 0) return null;

    // --- 1. Burnout Prediction Logic ---
    let burnoutRiskScore = 0;

    // A. Mood Trend Decline
    const last7 = last14Days.filter(e => new Date(e.timestamp) >= subDays(now, 7));
    const prev7 = last14Days.filter(e => new Date(e.timestamp) < subDays(now, 7));
    
    const avgMood7 = last7.reduce((sum, e) => sum + (MOOD_SCORES[e.mood] || 3), 0) / Math.max(last7.length, 1);
    const avgMoodPrev = prev7.reduce((sum, e) => sum + (MOOD_SCORES[e.mood] || 3), 0) / Math.max(prev7.length, 1);
    
    if (avgMood7 < avgMoodPrev - 0.5) burnoutRiskScore += 1;
    if (avgMood7 <= 2.5) burnoutRiskScore += 1;

    // B. Sentiment & Emotional Language Change
    let stressWordCount = 0;
    let totalWordsLast7 = 0;
    last7.forEach(e => {
      const text = (e.journalText || '').toLowerCase();
      const words = text.split(/\s+/).filter(Boolean);
      totalWordsLast7 += words.length;
      STRESS_WORDS.forEach(sw => { if (text.includes(sw)) stressWordCount++; });
    });
    
    if (totalWordsLast7 > 0 && (stressWordCount / totalWordsLast7) > 0.05) burnoutRiskScore += 1; // High stress vocab
    if (stressWordCount >= 3) burnoutRiskScore += 1;

    // C. Consistency Drop
    let missedDays = 0;
    for (let i = 1; i <= 7; i++) {
      const targetDate = subDays(now, i);
      const hasEntry = last7.some(e => differenceInDays(targetDate, new Date(e.timestamp)) === 0);
      if (!hasEntry) missedDays++;
    }
    if (missedDays >= 3) burnoutRiskScore += 1;

    // D. Journaling Behavior (shorter entries)
    let avgWords7 = totalWordsLast7 / Math.max(last7.length, 1);
    let avgWordsPrev = prev7.reduce((sum, e) => sum + (e.journalText?.split(/\s+/).filter(Boolean).length || 0), 0) / Math.max(prev7.length, 1);
    if (avgWordsPrev > 20 && avgWords7 < (avgWordsPrev * 0.5)) burnoutRiskScore += 1;

    // --- 2. Isolation / Social Signal Logic ---
    let isolationScore = 0;
    let socialWordCount = 0;
    let isolationWordCount = 0;

    last14Days.forEach(e => {
      const text = (e.journalText || '').toLowerCase();
      SOCIAL_WORDS.forEach(sw => { if (text.includes(sw)) socialWordCount++; });
      ISOLATION_WORDS.forEach(iw => { if (text.includes(iw)) isolationWordCount++; });
    });

    if (socialWordCount === 0 && last14Days.length >= 5) isolationScore += 2;
    if (isolationWordCount >= 2) isolationScore += 2;
    if (avgMood7 <= 3 && socialWordCount === 0) isolationScore += 1;

    return {
      burnoutRisk: burnoutRiskScore, // Max is ~6
      isolationRisk: isolationScore, // Max is ~5
      evaluated: true,
    };
  }, [entries]);

  if (!analysis) return null;

  const showBurnout = analysis.burnoutRisk >= 3;
  const showIsolation = analysis.isolationRisk >= 3;

  if (!showBurnout && !showIsolation) return null;

  return (
    <div className="space-y-4">
      {showBurnout && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-orange-800 dark:text-orange-400">
              <Activity className="h-5 w-5" />
              Burnout Risk Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
              Your mood trend has declined recently, and your journaling patterns indicate rising stress or fatigue. Burnout often builds up gradually.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-md border border-orange-100 dark:border-orange-900/40 text-sm">
              <strong className="block text-orange-800 dark:text-orange-400 mb-1 flex items-center gap-1">
                <HeartPulse className="h-4 w-4" /> Recommended Action
              </strong>
              Consider taking a short sensory break, stepping away from screens, or trying a 5-minute breathing exercise in the Wellness tab to reset your nervous system.
            </div>
          </CardContent>
        </Card>
      )}

      {showIsolation && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-blue-800 dark:text-blue-400">
              <Users className="h-5 w-5" />
              Social Connection Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
              Recent journal entries show fewer references to social interactions and a slight shift in emotional tone. During stressful times, we sometimes withdraw without realizing it.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-md border border-blue-100 dark:border-blue-900/40 text-sm">
              <strong className="block text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Gentle Suggestion
              </strong>
              Connecting with others can be a powerful mood booster. Consider reaching out to a friend, joining a campus event, or just studying in a shared social space today.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
