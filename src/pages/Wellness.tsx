import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import GuidedMeditation from '@/components/wellness/GuidedMeditation';
import BreathingExercise from '@/components/wellness/BreathingExercise';
import GratitudeJournal from '@/components/wellness/GratitudeJournal';
import EducationalResource from '@/components/wellness/EducationalResource';
import MockDataLoader from '@/components/MockDataLoader';
import { achievements } from '@/components/mood-garden/constants';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Brain, 
  Heart,
  Award,
  Activity,
  Lightbulb,
  BookOpen,
  Phone
} from 'lucide-react';

const Wellness = () => {
  const { moodEntries, getWeeklyMoodData } = useMood();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<'anxiety' | 'depression' | 'stress' | 'sleep'>('anxiety');

  const weeklyData = getWeeklyMoodData();
  const totalEntries = moodEntries.length;
  const recentEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const positiveEntries = moodEntries.filter(entry => 
    ['happy', 'energetic', 'calm'].includes(entry.mood)
  );

  const calculateWellnessScore = () => {
    if (totalEntries === 0) return 0;
    
    let score = 0;
    const weights = {
      consistency: 0.25,
      moodBalance: 0.20,
      journalQuality: 0.15,
      positivity: 0.15,
      recentTrend: 0.15,
      streakBonus: 0.10
    };
    
    const consistencyScore = Math.min((recentEntries.length / 7) * 100, 100);
    
    const moodCounts: Record<string, number> = moodEntries.reduce((acc: Record<string, number>, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueMoods = Object.keys(moodCounts).length;
    const moodVariety = Math.min((uniqueMoods / 6) * 100, 100);
    
    const avgCount = totalEntries / uniqueMoods;
    const variance = Object.values(moodCounts).reduce((acc: number, count: number) => 
      acc + Math.pow(count - avgCount, 2), 0) / uniqueMoods;
    const balanceScore = Math.max(0, 100 - (variance / avgCount) * 10);
    
    const moodBalanceScore = (moodVariety + balanceScore) / 2;
    
    const avgJournalLength = moodEntries.reduce((acc: number, entry) => 
      acc + entry.journalText.length, 0) / totalEntries;
    const meaningfulEntries = moodEntries.filter(entry => 
      entry.journalText.length > 20).length;
    const qualityRatio = meaningfulEntries / totalEntries;
    const journalQualityScore = Math.min(
      (avgJournalLength / 150) * 50 + qualityRatio * 50, 100
    );
    
    const positivityRatio = positiveEntries.length / totalEntries;
    const positivityScore = positivityRatio <= 0.7 ? 
      (positivityRatio / 0.7) * 100 : 
      100 - ((positivityRatio - 0.7) / 0.3) * 20;
    
    const previousWeekEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const twoWeeksAgo = new Date();
      const oneWeekAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
    });
    
    const recentPositiveRatio = recentEntries.length > 0 ? 
      recentEntries.filter(entry => positiveEntries.some(pe => pe.id === entry.id)).length / recentEntries.length : 0;
    const previousPositiveRatio = previousWeekEntries.length > 0 ?
      previousWeekEntries.filter(entry => positiveEntries.some(pe => pe.id === entry.id)).length / previousWeekEntries.length : 0;
    
    const trendImprovement = recentPositiveRatio - previousPositiveRatio;
    const recentTrendScore = Math.max(0, Math.min(100, 50 + trendImprovement * 100));
    
    const streakBonusScore = Math.min(recentEntries.length * 15, 100);
    
    score = (
      consistencyScore * weights.consistency +
      moodBalanceScore * weights.moodBalance +
      journalQualityScore * weights.journalQuality +
      positivityScore * weights.positivity +
      recentTrendScore * weights.recentTrend +
      streakBonusScore * weights.streakBonus
    );
    
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const wellnessScore = calculateWellnessScore();
  const streakDays = Math.min(recentEntries.length, 7);

  const calculateStreak = () => {
    if (moodEntries.length === 0) return 0;
    
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (entryDate.getTime() < expectedDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  const calculateConsistencyPercentage = () => {
    if (moodEntries.length === 0) return 0;
    
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.timestamp) >= last30Days
    );
    
    const daysWithEntries = new Set(
      recentEntries.map(entry => 
        new Date(entry.timestamp).toDateString()
      )
    ).size;
    
    return Math.round((daysWithEntries / 30) * 100);
  };

  const consistencyPercentage = calculateConsistencyPercentage();

  const earnedAchievements = achievements.filter(achievement => 
    achievement.requirement(totalEntries, currentStreak, positiveEntries.length, consistencyPercentage)
  );

  const handleCrisisCall = () => {
    window.open('tel:988', '_self');
  };

  const handleQuickAction = (action: string) => {
    setActiveComponent(action);
  };

  const handleEducationalResource = (topic: 'anxiety' | 'depression' | 'stress' | 'sleep') => {
    setSelectedTopic(topic);
    setActiveComponent('educational');
  };

  const renderActiveComponent = () => {
    if (!activeComponent) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
        <div className="max-h-[90vh] overflow-y-auto w-full max-w-4xl">
          {activeComponent === 'meditation' && (
            <GuidedMeditation onClose={() => setActiveComponent(null)} />
          )}
          {activeComponent === 'breathing' && (
            <BreathingExercise onClose={() => setActiveComponent(null)} />
          )}
          {activeComponent === 'gratitude' && (
            <GratitudeJournal onClose={() => setActiveComponent(null)} />
          )}
          {activeComponent === 'educational' && (
            <EducationalResource 
              topic={selectedTopic} 
              onClose={() => setActiveComponent(null)} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveComponent()}
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Wellness Hub</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Your comprehensive mental health companion</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full min-w-[480px] sm:min-w-0 h-auto gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Patterns</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Progress</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Resources</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Tips</TabsTrigger>
              <TabsTrigger value="demo" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Demo Data</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card className="min-h-[100px] sm:min-h-[120px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Wellness Score</CardTitle>
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{wellnessScore}%</div>
                  <Progress value={wellnessScore} className="h-2" />
                </CardContent>
              </Card>

              <Card className="min-h-[100px] sm:min-h-[120px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Current Streak</CardTitle>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{currentStreak}</div>
                  <p className="text-xs text-muted-foreground">consecutive days</p>
                </CardContent>
              </Card>

              <Card className="min-h-[100px] sm:min-h-[120px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Entries</CardTitle>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{totalEntries}</div>
                  <p className="text-xs text-muted-foreground">logged moods</p>
                </CardContent>
              </Card>

              <Card className="min-h-[100px] sm:min-h-[120px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{recentEntries.length}</div>
                  <p className="text-xs text-muted-foreground">new entries</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="px-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                    Achievements ({earnedAchievements.length}/{achievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-60 overflow-y-auto px-3 sm:px-6">
                  {earnedAchievements.length > 0 ? (
                    earnedAchievements.map(achievement => (
                      <div key={achievement.id} className="flex flex-col gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs w-fit">
                          <span>{achievement.icon}</span>
                          {achievement.title}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{achievement.description}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">Start logging moods to earn achievements!</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-3 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-3 sm:px-6">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs sm:text-sm h-auto py-2 sm:py-3"
                    onClick={() => handleQuickAction('meditation')}
                  >
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>5-Minute Meditation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs sm:text-sm h-auto py-2 sm:py-3"
                    onClick={() => handleQuickAction('breathing')}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>Breathing Exercise</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs sm:text-sm h-auto py-2 sm:py-3"
                    onClick={() => handleQuickAction('gratitude')}
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>Gratitude Journal</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <MockDataLoader />
          </TabsContent>

          <TabsContent value="patterns">
            <h2>Mood Patterns Content</h2>
            <p>Analyze your mood trends over time.</p>
          </TabsContent>

          <TabsContent value="progress">
            <h2>Progress Tracker</h2>
            <p>Visualize your progress and improvements.</p>
          </TabsContent>

          <TabsContent value="resources">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Understanding Anxiety
                  </CardTitle>
                  <CardDescription>Learn about the causes and symptoms of anxiety.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleEducationalResource('anxiety')}
                  >
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Understanding Depression
                  </CardTitle>
                  <CardDescription>Learn about the causes and symptoms of depression.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleEducationalResource('depression')}
                  >
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Managing Stress
                  </CardTitle>
                  <CardDescription>Effective strategies for stress reduction.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleEducationalResource('stress')}
                  >
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Improving Sleep
                  </CardTitle>
                  <CardDescription>Tips and techniques for better sleep quality.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleEducationalResource('sleep')}
                  >
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Practice Mindfulness
                  </CardTitle>
                  <CardDescription>Engage in daily mindfulness exercises to reduce stress and improve focus.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start">
                    Start Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Connect with Others
                  </CardTitle>
                  <CardDescription>Reach out to friends, family, or support groups to share your feelings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start">
                    Find Support
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Stay Active
                  </CardTitle>
                  <CardDescription>Regular physical activity can boost your mood and reduce anxiety.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start">
                    Get Moving
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Crisis Support
                  </CardTitle>
                  <CardDescription>If you're in crisis, please call or text 988 in the US and Canada.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleCrisisCall}>
                    Call 988 Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wellness;
