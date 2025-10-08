
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, Sparkles, Trophy, Phone, MessageCircle, Calendar, Clock, Target, Award, Zap, Shield } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import GratitudeJournal from '@/components/wellness/GratitudeJournal';
import BreathingExercise from '@/components/wellness/BreathingExercise';
import GuidedMeditation from '@/components/wellness/GuidedMeditation';
import EducationalResource from '@/components/wellness/EducationalResource';

const achievements = [
  {
    id: 'streak-7',
    title: '7-Day Streak',
    description: 'Log your mood for 7 consecutive days.',
    icon: Zap,
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 7,
  },
  {
    id: 'streak-30',
    title: '30-Day Streak',
    description: 'Log your mood for 30 consecutive days.',
    icon: Zap,
    requirement: (totalEntries: number, currentStreak: number) => currentStreak >= 30,
  },
  {
    id: 'first-entry',
    title: 'First Entry',
    description: 'Log your first mood entry.',
    icon: Sparkles,
    requirement: (totalEntries: number) => totalEntries >= 1,
  },
  {
    id: '10-entries',
    title: '10 Entries',
    description: 'Log 10 mood entries.',
    icon: Target,
    requirement: (totalEntries: number) => totalEntries >= 10,
  },
   {
    id: '50-entries',
    title: '50 Entries',
    description: 'Log 50 mood entries.',
    icon: Target,
    requirement: (totalEntries: number) => totalEntries >= 50,
  },
  {
    id: 'positive-moods-10',
    title: '10 Positive Days',
    description: 'Log 10 days with positive moods.',
    icon: Heart,
    requirement: (totalEntries: number, currentStreak: number, positiveEntries: number) => positiveEntries >= 10,
  },
  {
    id: 'consistency-80',
    title: '80% Consistency',
    description: 'Maintain 80% consistency in logging moods over the last 30 days.',
    icon: Shield,
    requirement: (totalEntries: number, currentStreak: number, positiveEntries: number, consistencyPercentage: number) => consistencyPercentage >= 80,
  },
];

const wellnessResources = [
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Practice deep breathing techniques to reduce stress and anxiety.',
    icon: Brain,
    component: 'breathing',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    description: 'Reflect on the things you are grateful for to boost your mood.',
    icon: Heart,
    component: 'gratitude',
  },
  {
    id: 'meditation',
    title: 'Guided Meditation',
    description: 'Follow a guided meditation session to calm your mind.',
    icon: Brain,
    component: 'meditation',
  },
  {
    id: 'resource1',
    title: 'Understanding Anxiety',
    description: 'Learn about the causes, symptoms, and treatments for anxiety.',
    icon: Brain,
    component: 'resource1',
    link: 'https://www.helpguide.org/articles/anxiety/anxiety-disorders-and-anxiety-attacks.htm'
  },
  {
    id: 'resource2',
    title: 'Coping with Stress',
    description: 'Discover healthy ways to manage and reduce stress in your life.',
    icon: Brain,
    component: 'resource2',
    link: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-management/art-20044151'
  },
];

const Wellness = () => {
  const { moodEntries } = useMood();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const handleComponentClose = () => {
    setActiveComponent(null);
  };

  if (activeComponent === 'gratitude') {
    return <GratitudeJournal onClose={handleComponentClose} />;
  }

  if (activeComponent === 'breathing') {
    return <BreathingExercise onClose={handleComponentClose} />;
  }

  if (activeComponent === 'meditation') {
    return <GuidedMeditation onClose={handleComponentClose} />;
  }

  const crisisResources = [
    {
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741 to connect with a crisis counselor.',
      phone: '741741',
      icon: MessageCircle,
      link: 'https://www.crisistextline.org/'
    },
    {
      name: 'The Trevor Project',
      description: 'Suicide prevention and crisis intervention for LGBTQ young people.',
      phone: '1-866-488-7386',
      icon: Phone,
      link: 'https://www.thetrevorproject.org/'
    },
    {
      name: 'National Suicide Prevention Lifeline',
      description: 'Call or text 988 anytime in the US and Canada.',
      phone: '988',
      icon: Phone,
      link: 'https://988lifeline.org/'
    },
  ];

  const totalEntries = moodEntries.length;
  const positiveEntries = moodEntries.filter(entry => entry.mood === 'happy' || entry.mood === 'energetic').length;

  const calculateCurrentStreak = () => {
    if (moodEntries.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Sort entries by timestamp in descending order
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    let previousEntryDate = new Date(sortedEntries[0].timestamp);
    previousEntryDate.setHours(0, 0, 0, 0);

    // If the most recent entry isn't today, streak is 0
    if (previousEntryDate.getTime() !== currentDate.getTime()) {
      return 0;
    }

    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].timestamp);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(previousEntryDate);
      expectedDate.setDate(previousEntryDate.getDate() - 1);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
        previousEntryDate = entryDate;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

  const currentStreak = calculateCurrentStreak();

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

  // Get earned achievements - fix the function call to pass all required arguments
  const earnedAchievements = achievements.filter(achievement => 
    achievement.requirement(totalEntries, currentStreak, positiveEntries, consistencyPercentage)
  );

  const handleCrisisButtonClick = (resource: { link: string | URL; }) => {
    window.open(resource.link, '_blank');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl font-bold">Wellness Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resources" className="space-y-4">
            <TabsList>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
            </TabsList>
            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wellnessResources.map((resource) => (
                  <Card key={resource.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {resource.icon && <resource.icon className="w-5 h-5" />}
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <Button 
                        variant="secondary" 
                        className="mt-4 w-full"
                        onClick={() => {
                          if (resource.component && !resource.link) {
                            setActiveComponent(resource.component);
                          } else if (resource.link) {
                            window.open(resource.link, '_blank');
                          }
                        }}
                      >
                        {resource.link ? 'Learn More' : 'Open'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {achievement.icon && <achievement.icon className="w-5 h-5" />}
                        {achievement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge variant="outline">Earned</Badge>
                    </CardContent>
                  </Card>
                ))}
                {earnedAchievements.length === 0 && (
                  <div className="text-center py-6 col-span-full">
                    <Award className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No achievements earned yet. Keep tracking your mood to unlock achievements!</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Entries</span>
                    <span className="text-sm text-muted-foreground">{totalEntries}</span>
                  </div>
                  <Progress value={(totalEntries / 50) * 100} max={100} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Streak</span>
                    <span className="text-sm text-muted-foreground">{currentStreak} days</span>
                  </div>
                  <Progress value={(currentStreak / 30) * 100} max={100} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Positive Days</span>
                    <span className="text-sm text-muted-foreground">{positiveEntries}</span>
                  </div>
                  <Progress value={(positiveEntries / 10) * 100} max={100} />

                   <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Logging Consistency (Last 30 Days)</span>
                    <span className="text-sm text-muted-foreground">{consistencyPercentage}%</span>
                  </div>
                  <Progress value={consistencyPercentage} max={100} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="crisis" className="space-y-4">
              <p className="text-muted-foreground">If you're in immediate danger, please call 911.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crisisResources.map((resource) => (
                  <Card key={resource.name} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {resource.icon && <resource.icon className="w-5 h-5" />}
                        {resource.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <Button variant="secondary" className="mt-4 w-full" onClick={() => handleCrisisButtonClick(resource)}>
                        Contact
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wellness;
