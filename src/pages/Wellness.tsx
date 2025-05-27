
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Brain, 
  Heart, 
  Phone,
  Award,
  Activity,
  Lightbulb,
  BookOpen
} from 'lucide-react';

const Wellness = () => {
  const { moodEntries, getWeeklyMoodData } = useMood();
  const weeklyData = getWeeklyMoodData();

  // Calculate wellness metrics
  const totalEntries = moodEntries.length;
  const recentEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const positiveEntries = moodEntries.filter(entry => 
    ['happy', 'energetic', 'calm', 'creative'].includes(entry.mood)
  );
  
  const wellnessScore = totalEntries > 0 ? Math.round((positiveEntries.length / totalEntries) * 100) : 0;
  const streakDays = Math.min(recentEntries.length, 7);

  const handleCrisisCall = () => {
    window.open('tel:988', '_self'); // National Suicide Prevention Lifeline
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wellness Hub</h1>
          <p className="text-muted-foreground">Your comprehensive mental health companion</p>
        </div>
        
        <Button 
          onClick={handleCrisisCall}
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700"
        >
          <Phone className="w-4 h-4 mr-2" />
          Crisis Support
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="recommendations">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wellnessScore}%</div>
                <Progress value={wellnessScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakDays}</div>
                <p className="text-xs text-muted-foreground">days this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEntries}</div>
                <p className="text-xs text-muted-foreground">logged moods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentEntries.length}</div>
                <p className="text-xs text-muted-foreground">new entries</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {streakDays >= 7 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">🔥 Week Warrior</Badge>
                    <span className="text-sm">7-day logging streak!</span>
                  </div>
                )}
                {totalEntries >= 10 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">📚 Dedicated Logger</Badge>
                    <span className="text-sm">10+ mood entries</span>
                  </div>
                )}
                {wellnessScore >= 70 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">😊 Positivity Champion</Badge>
                    <span className="text-sm">High positive mood ratio</span>
                  </div>
                )}
                {totalEntries === 0 && (
                  <p className="text-sm text-muted-foreground">Start logging moods to earn achievements!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  5-Minute Meditation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Breathing Exercise
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Gratitude Journal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood Pattern Analysis</CardTitle>
              <CardDescription>Understanding your emotional trends and triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Most Common Mood</h4>
                    <div className="flex items-center gap-2">
                      {totalEntries > 0 ? (
                        <>
                          <Badge>
                            {Object.entries(
                              moodEntries.reduce((acc, entry) => {
                                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((Object.entries(
                              moodEntries.reduce((acc, entry) => {
                                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).sort(([,a], [,b]) => b - a)[0]?.[1] || 0) / totalEntries * 100)}% of entries
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data available</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Weekly Trend</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {recentEntries.length > 0 ? 'Active this week' : 'Start logging to see trends'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress Journey</CardTitle>
              <CardDescription>Celebrating your mental health milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Consistency Goal</span>
                    <span>{streakDays}/7 days</span>
                  </div>
                  <Progress value={(streakDays / 7) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Wellness Score</span>
                    <span>{wellnessScore}/100</span>
                  </div>
                  <Progress value={wellnessScore} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalEntries}</div>
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{positiveEntries.length}</div>
                    <div className="text-sm text-muted-foreground">Positive Moods</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{streakDays}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Crisis Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">24/7 Crisis Hotlines</h4>
                  <div className="space-y-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleCrisisCall} className="w-full">
                      988 - Suicide & Crisis Lifeline
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      741741 - Crisis Text Line
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Self-Care Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Guided Meditation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Breathing Exercises
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Progressive Muscle Relaxation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Mindfulness Activities
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Educational Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Understanding Anxiety
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Coping with Depression
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Stress Management
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Sleep Hygiene
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Professional Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Find a Therapist
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Support Groups
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Insurance Coverage
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Online Therapy Options
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>Based on your mood patterns and current state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessScore < 50 && (
                  <div className="p-4 border-l-4 border-orange-400 bg-orange-50">
                    <h4 className="font-medium text-orange-800">Focus on Self-Care</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Your recent mood patterns suggest you might benefit from extra self-care. 
                      Try incorporating daily meditation or gentle exercise.
                    </p>
                  </div>
                )}
                
                {streakDays < 3 && (
                  <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                    <h4 className="font-medium text-blue-800">Build Consistency</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Regular mood tracking helps identify patterns. Set a daily reminder to log your mood.
                    </p>
                  </div>
                )}

                {wellnessScore >= 70 && (
                  <div className="p-4 border-l-4 border-green-400 bg-green-50">
                    <h4 className="font-medium text-green-800">Keep It Up!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      You're doing great! Consider sharing your positive strategies or helping others in their journey.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Quick Mood Boosters</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Take 5 deep breaths</li>
                      <li>• Listen to uplifting music</li>
                      <li>• Step outside for fresh air</li>
                      <li>• Call a friend or family member</li>
                      <li>• Practice gratitude</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Long-term Wellness</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Maintain regular sleep schedule</li>
                      <li>• Exercise 3-4 times per week</li>
                      <li>• Practice mindfulness daily</li>
                      <li>• Connect with supportive people</li>
                      <li>• Engage in meaningful activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Wellness;
