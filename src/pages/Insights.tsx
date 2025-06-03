
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
  
  // Handle export insights as PDF with modern design
  const handleExportInsights = () => {
    const pdf = new jsPDF();
    
    // Set up the document with better typography
    pdf.setFont('helvetica');
    
    // Header with gradient-like effect using rectangles
    pdf.setFillColor(67, 56, 202); // Indigo-600
    pdf.rect(0, 0, 210, 50, 'F');
    
    pdf.setFillColor(99, 102, 241); // Indigo-500  
    pdf.rect(0, 40, 210, 10, 'F');
    
    // Title styling
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🧠 Mood Insights Report', 20, 30);
    
    // Date subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${reportDate}`, 20, 45);
    
    let yPos = 75;
    
    if (!insights) {
      // Better no-data message
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, yPos - 10, 180, 40, 5, 5, 'F');
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 No Data Available', 25, yPos + 5);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Start tracking your moods to generate insights!', 25, yPos + 20);
      
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Key Statistics Overview Card
    pdf.setFillColor(240, 253, 244); // Green-50
    pdf.setDrawColor(34, 197, 94); // Green-500
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, yPos - 10, 180, 65, 8, 8, 'FD');
    
    pdf.setTextColor(21, 128, 61); // Green-700
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📈 Your Journey at a Glance', 25, yPos + 5);
    
    // Statistics in a grid layout
    const stats = [
      { label: 'Total Entries', value: insights.totalEntries.toString(), icon: '📝' },
      { label: 'Current Streak', value: `${insights.currentStreak} days`, icon: '🔥' },
      { label: 'Days Tracked', value: insights.uniqueDays.toString(), icon: '📅' },
      { label: 'Most Common Mood', value: insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1), icon: '😊' }
    ];
    
    pdf.setTextColor(22, 163, 74); // Green-600
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    stats.forEach((stat, index) => {
      const x = 25 + (index % 2) * 85;
      const y = yPos + 20 + Math.floor(index / 2) * 15;
      
      pdf.text(`${stat.icon} ${stat.label}:`, x, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value, x, y + 8);
      pdf.setFont('helvetica', 'normal');
    });
    
    yPos += 85;
    
    // Mood Distribution with visual bars
    pdf.setFillColor(254, 243, 199); // Amber-100
    pdf.setDrawColor(245, 158, 11); // Amber-500
    pdf.roundedRect(15, yPos - 5, 180, 8, 4, 4, 'FD');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(245, 158, 11);
    pdf.rect(15, yPos - 5, 180, 8, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎭 Mood Distribution Breakdown', 25, yPos);
    
    yPos += 20;
    
    const sortedMoods = Object.entries(insights.moodCounts).sort((a, b) => b[1] - a[1]);
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      calm: '😌',
      energetic: '⚡',
      angry: '😠',
      peaceful: '☮️'
    };
    
    const moodColors: Record<string, [number, number, number]> = {
      happy: [252, 211, 77],    // Yellow-300
      sad: [147, 197, 253],     // Blue-300
      anxious: [196, 181, 253], // Purple-300
      calm: [134, 239, 172],    // Green-300
      energetic: [251, 146, 60], // Orange-300
      angry: [248, 113, 113],   // Red-300
      peaceful: [110, 231, 183] // Emerald-300
    };
    
    sortedMoods.forEach(([mood, count], index) => {
      const percentage = ((count / insights.totalEntries) * 100).toFixed(1);
      
      // Background for each mood entry
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(20, yPos - 5, 170, 14, 3, 3, 'F');
      
      // Mood emoji and name
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${moodEmojis[mood] || '😐'} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`, 30, yPos + 3);
      
      // Count and percentage
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${count} entries (${percentage}%)`, 110, yPos + 3);
      
      // Visual progress bar
      const barWidth = Math.max((count / insights.totalEntries) * 60, 2);
      pdf.setFillColor(229, 231, 235); // Gray-200
      pdf.rect(140, yPos - 1, 60, 6, 'F');
      
      if (moodColors[mood]) {
        pdf.setFillColor(...moodColors[mood]);
        pdf.rect(140, yPos - 1, barWidth, 6, 'F');
      }
      
      yPos += 18;
    });
    
    yPos += 10;
    
    // Journal Analytics Section
    if (insights.journalEntriesCount > 0) {
      pdf.setFillColor(239, 246, 255); // Blue-50
      pdf.setDrawColor(59, 130, 246); // Blue-500
      pdf.roundedRect(15, yPos - 5, 180, 8, 4, 4, 'FD');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, yPos - 5, 180, 8, 'F');
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📝 Journal Writing Analysis', 25, yPos);
      
      yPos += 25;
      
      // Journal statistics with better formatting
      const journalStats = [
        { label: 'Journal Entries Written', value: insights.journalEntriesCount.toString(), icon: '✍️' },
        { label: 'Total Words', value: insights.totalWords.toLocaleString(), icon: '📖' },
        { label: 'Average Words per Entry', value: insights.avgWordsPerEntry.toString(), icon: '📊' },
        { label: 'Journal Completion Rate', value: `${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%`, icon: '✅' }
      ];
      
      pdf.setTextColor(30, 64, 175); // Blue-800
      pdf.setFontSize(11);
      
      journalStats.forEach((stat, index) => {
        const x = 25 + (index % 2) * 85;
        const y = yPos + Math.floor(index / 2) * 15;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${stat.icon} ${stat.label}:`, x, y);
        pdf.setFont('helvetica', 'bold');
        pdf.text(stat.value, x, y + 8);
      });
      
      yPos += 45;
    }
    
    // Weekly Pattern Analysis
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(245, 240, 255); // Purple-50
    pdf.setDrawColor(147, 51, 234); // Purple-600
    pdf.roundedRect(15, yPos - 5, 180, 8, 4, 4, 'FD');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(147, 51, 234);
    pdf.rect(15, yPos - 5, 180, 8, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📅 Weekly Mood Pattern', 25, yPos);
    
    yPos += 25;
    
    pdf.setTextColor(88, 28, 135); // Purple-800
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    weeklyData.forEach((day) => {
      const moodText = day.mood ? 
        `${moodEmojis[day.mood] || '😐'} ${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        '⚪ No entry';
      
      pdf.text(`${day.day}:`, 30, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.text(moodText, 80, yPos);
      pdf.setFont('helvetica', 'normal');
      
      yPos += 12;
    });
    
    yPos += 15;
    
    // Insights and Recommendations
    pdf.setFillColor(254, 242, 242); // Red-50
    pdf.setDrawColor(239, 68, 68); // Red-500
    pdf.roundedRect(15, yPos - 5, 180, 8, 4, 4, 'FD');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(239, 68, 68);
    pdf.rect(15, yPos - 5, 180, 8, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('💡 Personalized Insights', 25, yPos);
    
    yPos += 25;
    
    const personalizedInsights = [
      `🎯 You've maintained a ${insights.currentStreak}-day tracking streak - excellent consistency!`,
      `🎭 Your dominant mood is "${insights.mostCommonMood[0]}" - consider what factors contribute to this pattern.`,
      insights.avgWordsPerEntry > 50 ? 
        '📚 Your detailed journal entries demonstrate strong self-reflection habits.' :
        '✍️ Consider writing longer journal entries to gain deeper self-insights.',
      parseFloat(insights.avgEntriesPerDay) > 1 ? 
        '⭐ Great job with multiple daily check-ins - this provides rich mood data.' :
        '📱 Try checking in more frequently throughout the day for better pattern recognition.',
      `📈 You've tracked ${insights.uniqueDays} unique days - building a comprehensive mood history.`
    ];
    
    pdf.setTextColor(153, 27, 27); // Red-800
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    personalizedInsights.forEach((insight, index) => {
      // Wrap text for long insights
      const lines = pdf.splitTextToSize(insight, 160);
      lines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, 25, yPos + (index * 15) + (lineIndex * 5));
      });
    });
    
    // Footer with branding
    const footerY = 280;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, footerY, 210, 17, 'F');
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('🌱 Generated by Your Personal Mood Tracker - Continue your wellness journey!', 20, footerY + 8);
    pdf.text(`Report ID: ${Date.now().toString(36)} | Page 1`, 20, footerY + 13);
    
    // Save with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    pdf.save(`mood-insights-${timestamp}.pdf`);
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
