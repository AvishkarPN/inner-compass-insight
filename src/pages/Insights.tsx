
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeeklyMoodChart from '@/components/WeeklyMoodChart';
import { useMood } from '@/contexts/MoodContext';
import MoodDistributionChart from '@/components/MoodDistributionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, BookOpen, Brain, Download, Trophy } from 'lucide-react';
import JournalInsights from '@/components/JournalInsights';
import AchievementsDisplay from '@/components/AchievementsDisplay';
import jsPDF from 'jspdf';

const Insights = () => {
  const { getWeeklyMoodData, moodEntries } = useMood();
  const weeklyData = getWeeklyMoodData();
  
  // Calculate comprehensive statistics
  const calculateInsights = () => {
    if (!moodEntries.length) return null;

    const moodCounts: Record<string, number> = {};
    const dailyEntries: Record<string, number> = {};
    let totalWords = 0;
    let journalEntriesCount = 0;

    moodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      
      const dateKey = entry.timestamp.toDateString();
      dailyEntries[dateKey] = (dailyEntries[dateKey] || 0) + 1;
      
      if (entry.journalText.trim()) {
        journalEntriesCount++;
        totalWords += entry.journalText.split(/\s+/).filter(Boolean).length;
      }
    });

    const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const avgWordsPerEntry = journalEntriesCount > 0 ? Math.round(totalWords / journalEntriesCount) : 0;
    const avgEntriesPerDay = Object.keys(dailyEntries).length > 0 ? 
      (moodEntries.length / Object.keys(dailyEntries).length).toFixed(1) : '0';

    // Calculate streak
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      if (!previousDate) {
        currentStreak = 1;
        previousDate = entryDate;
        continue;
      }
      
      const diffDays = Math.floor((previousDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        previousDate = entryDate;
      } else if (diffDays > 1) {
        break;
      } else {
        previousDate = entryDate;
      }
    }

    return {
      totalEntries: moodEntries.length,
      currentStreak,
      mostCommonMood,
      journalEntriesCount,
      totalWords,
      avgWordsPerEntry,
      avgEntriesPerDay,
      moodCounts,
      uniqueDays: Object.keys(dailyEntries).length
    };
  };

  const insights = calculateInsights();
  
  // Handle export insights as PDF
  const handleExportInsights = () => {
    const pdf = new jsPDF();
    
    // Modern color palette
    const colors = {
      primary: [79, 70, 229] as [number, number, number],     // Indigo
      secondary: [99, 102, 241] as [number, number, number],  // Light indigo
      accent: [16, 185, 129] as [number, number, number],     // Emerald
      warning: [245, 158, 11] as [number, number, number],    // Amber
      surface: [248, 250, 252] as [number, number, number],   // Slate 50
      text: [15, 23, 42] as [number, number, number],         // Slate 900
      textLight: [71, 85, 105] as [number, number, number]    // Slate 600
    };
    
    // Header with gradient effect
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, 210, 45, 'F');
    
    // Add subtle gradient effect
    pdf.setFillColor(...colors.secondary);
    pdf.rect(0, 35, 210, 10, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', 20, 25);
    
    // Subtitle with date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${currentDate}`, 20, 37);
    
    let yPos = 65;
    
    if (!insights) {
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.text('No mood data available to generate insights.', 20, yPos);
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Executive Summary Card
    pdf.setFillColor(...colors.surface);
    pdf.roundedRect(15, yPos - 10, 180, 50, 3, 3, 'F');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📊 Executive Summary', 25, yPos + 5);
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const summaryData = [
      `Total Mood Entries: ${insights.totalEntries}`,
      `Tracking Days: ${insights.uniqueDays}`,
      `Current Streak: ${insights.currentStreak} days`,
      `Most Common Mood: ${insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1)} (${insights.mostCommonMood[1]} times)`,
      `Journal Entries: ${insights.journalEntriesCount}`,
      `Average Words per Entry: ${insights.avgWordsPerEntry}`
    ];
    
    summaryData.forEach((item, index) => {
      pdf.text(`• ${item}`, 30, yPos + 20 + (index * 5));
    });
    
    yPos += 70;
    
    // Mood Distribution Section
    pdf.setFillColor(...colors.accent);
    pdf.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎭 Mood Distribution Analysis', 25, yPos);
    
    yPos += 20;
    
    const sortedMoods = Object.entries(insights.moodCounts).sort((a, b) => b[1] - a[1]);
    const moodColors: Record<string, [number, number, number]> = {
      angry: [239, 68, 68],     // Red
      energetic: [245, 158, 11], // Amber
      happy: [251, 191, 36],    // Yellow
      peaceful: [34, 197, 94],   // Green
      calm: [59, 130, 246],     // Blue
      anxious: [147, 51, 234],  // Purple
      sad: [107, 114, 128]      // Gray
    };
    
    sortedMoods.forEach(([mood, count], index) => {
      const percentage = ((count / insights.totalEntries) * 100).toFixed(1);
      
      // Mood indicator circle
      if (moodColors[mood]) {
        pdf.setFillColor(...moodColors[mood]);
        pdf.circle(30, yPos - 2, 3, 'F');
      }
      
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${mood.charAt(0).toUpperCase() + mood.slice(1)}`, 40, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${count} entries (${percentage}%)`, 85, yPos);
      
      // Progress bar
      const barWidth = (count / insights.totalEntries) * 80;
      pdf.setFillColor(...colors.surface);
      pdf.rect(140, yPos - 4, 80, 6, 'F');
      if (moodColors[mood]) {
        pdf.setFillColor(...moodColors[mood]);
        pdf.rect(140, yPos - 4, barWidth, 6, 'F');
      }
      
      yPos += 12;
    });
    
    yPos += 10;
    
    // Weekly Trends Section
    pdf.setFillColor(...colors.warning);
    pdf.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📈 Weekly Mood Trends', 25, yPos);
    
    yPos += 20;
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    weeklyData.forEach((day, index) => {
      const moodText = day.mood ? 
        `${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        'No entry';
      
      pdf.text(`${day.day}:`, 30, yPos);
      pdf.text(moodText, 60, yPos);
      
      // Add mood color indicator
      if (day.mood && moodColors[day.mood]) {
        pdf.setFillColor(...moodColors[day.mood]);
        pdf.circle(55, yPos - 2, 2, 'F');
      }
      
      yPos += 8;
    });
    
    // Add new page if needed
    if (yPos > 250) {
      pdf.addPage();
      yPos = 30;
    } else {
      yPos += 15;
    }
    
    // Journal Analytics Section
    if (insights.journalEntriesCount > 0) {
      pdf.setFillColor(...colors.primary);
      pdf.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📝 Journal Analytics', 25, yPos);
      
      yPos += 20;
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const journalStats = [
        `Total Journal Entries: ${insights.journalEntriesCount}`,
        `Total Words Written: ${insights.totalWords.toLocaleString()}`,
        `Average Words per Entry: ${insights.avgWordsPerEntry}`,
        `Journal Completion Rate: ${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%`,
        `Average Entries per Day: ${insights.avgEntriesPerDay}`
      ];
      
      journalStats.forEach((stat, index) => {
        pdf.text(`• ${stat}`, 30, yPos + (index * 8));
      });
      
      yPos += journalStats.length * 8 + 15;
    }
    
    // Insights & Recommendations
    pdf.setFillColor(...colors.secondary);
    pdf.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('💡 Key Insights', 25, yPos);
    
    yPos += 20;
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const recommendations = [
      `You've been consistently tracking for ${insights.currentStreak} days - keep it up!`,
      `Your most frequent mood is "${insights.mostCommonMood[0]}" - consider what contributes to this.`,
      insights.avgWordsPerEntry > 50 ? 
        'Your detailed journal entries show great self-reflection habits.' :
        'Consider writing longer journal entries for deeper insights.',
      parseFloat(insights.avgEntriesPerDay) > 1 ? 
        'You\'re doing great with multiple daily check-ins.' :
        'Try checking in more frequently throughout the day for better patterns.'
    ];
    
    recommendations.forEach((rec, index) => {
      pdf.text(`• ${rec}`, 25, yPos + (index * 6));
    });
    
    // Footer
    const footerY = 280;
    pdf.setFillColor(...colors.surface);
    pdf.rect(0, footerY, 210, 17, 'F');
    
    pdf.setTextColor(...colors.textLight);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Your Mood Tracker - Continue your journey to better mental wellness!', 20, footerY + 10);
    
    // Save the PDF
    pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
            Your Mood Insights
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Analyze your mood patterns and journal entries
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Button 
            onClick={handleExportInsights} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Export as PDF</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-900 p-1 rounded-lg shadow-sm w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[300px] lg:w-fit lg:grid-cols-3 gap-1">
              <TabsTrigger 
                value="charts" 
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <BarChart size={16} className="flex-shrink-0" />
                <span className="hidden sm:inline truncate">Charts</span>
                <span className="sm:hidden">📊</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <Brain size={16} className="flex-shrink-0" />
                <span className="hidden sm:inline truncate">Analysis</span>
                <span className="sm:hidden">🧠</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <Trophy size={16} className="flex-shrink-0" />
                <span className="hidden sm:inline truncate">Achievements</span>
                <span className="sm:hidden">🏆</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="charts" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 space-y-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <BarChart size={18} className="text-primary flex-shrink-0" />
                  <span className="truncate">Weekly Mood Overview</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your mood trends over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <WeeklyMoodChart data={weeklyData} />
              </CardContent>
            </Card>
            
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 space-y-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <PieChart size={18} className="text-primary flex-shrink-0" />
                  <span className="truncate">Mood Distribution</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Breakdown of your recorded moods
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <MoodDistributionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 space-y-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <BookOpen size={18} className="text-primary flex-shrink-0" />
                <span className="truncate">Journal Analysis</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Insights derived from your journal entries
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              <JournalInsights />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 space-y-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Trophy size={18} className="text-primary flex-shrink-0" />
                <span className="truncate">Your Achievements</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track your progress and unlock new milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              <AchievementsDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
