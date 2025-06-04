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
  
  // Handle export insights as PDF with modern, web-like design
  const handleExportInsights = () => {
    const pdf = new jsPDF();
    
    // Set up the document with modern typography
    pdf.setFont('helvetica');
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Modern header with gradient effect
    pdf.setFillColor(99, 102, 241); // Indigo-500
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    pdf.setFillColor(67, 56, 202); // Indigo-600 (darker gradient)
    pdf.rect(0, 45, pageWidth, 15, 'F');
    
    // Main title with better spacing
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', 20, 25);
    
    // Subtitle with date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${reportDate}`, 20, 40);
    
    // Personal tagline
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your personal wellness journey insights', 20, 52);
    
    let yPos = 80;
    
    if (!insights) {
      // Enhanced no-data section
      pdf.setFillColor(248, 250, 252); // Gray-50
      pdf.setDrawColor(203, 213, 225); // Gray-300
      pdf.setLineWidth(1);
      pdf.roundedRect(15, yPos - 10, 180, 50, 8, 8, 'FD');
      
      pdf.setTextColor(71, 85, 105); // Gray-600
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('No Data Available', 25, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Start tracking your moods to unlock personalized insights', 25, yPos + 25);
      pdf.text('and discover patterns in your emotional wellness journey.', 25, yPos + 35);
      
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Executive Summary Card
    pdf.setFillColor(240, 253, 244); // Green-50
    pdf.setDrawColor(34, 197, 94); // Green-500
    pdf.setLineWidth(1);
    pdf.roundedRect(15, yPos - 5, 180, 75, 6, 6, 'FD');
    
    pdf.setTextColor(21, 128, 61); // Green-700
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 25, yPos + 10);
    
    // Key metrics in a clean grid
    const keyMetrics = [
      { label: 'Total Entries', value: insights.totalEntries.toString() },
      { label: 'Current Streak', value: `${insights.currentStreak} days` },
      { label: 'Days Tracked', value: insights.uniqueDays.toString() },
      { label: 'Completion Rate', value: `${((insights.totalEntries / insights.uniqueDays) * 100).toFixed(0)}%` }
    ];
    
    pdf.setTextColor(22, 163, 74); // Green-600
    pdf.setFontSize(10);
    
    keyMetrics.forEach((metric, index) => {
      const x = 25 + (index % 2) * 85;
      const y = yPos + 25 + Math.floor(index / 2) * 18;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(metric.label, x, y);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(metric.value, x, y + 8);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
    });
    
    // Most common mood highlight
    pdf.setTextColor(21, 128, 61);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Most Common Mood:', 25, yPos + 62);
    pdf.setFont('helvetica', 'bold');
    pdf.text(insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1), 85, yPos + 62);
    
    yPos += 90;
    
    // Mood Analytics Section
    pdf.setFillColor(254, 249, 195); // Yellow-100
    pdf.setDrawColor(251, 191, 36); // Yellow-400
    pdf.roundedRect(15, yPos - 5, 180, 15, 4, 4, 'FD');
    
    pdf.setTextColor(146, 64, 14); // Yellow-800
    pdf.setFillColor(251, 191, 36);
    pdf.rect(15, yPos - 5, 180, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Distribution Analysis', 25, yPos + 5);
    
    yPos += 25;
    
    const sortedMoods = Object.entries(insights.moodCounts).sort((a, b) => b[1] - a[1]);
    const moodColors: Record<string, [number, number, number]> = {
      happy: [34, 197, 94],      // Green-500
      sad: [59, 130, 246],       // Blue-500
      anxious: [147, 51, 234],   // Purple-600
      calm: [16, 185, 129],      // Emerald-500
      energetic: [249, 115, 22], // Orange-500
      angry: [239, 68, 68],      // Red-500
      peaceful: [6, 182, 212]    // Cyan-500
    };
    
    sortedMoods.forEach(([mood, count], index) => {
      const percentage = ((count / insights.totalEntries) * 100).toFixed(1);
      
      // Clean mood entry background
      pdf.setFillColor(249, 250, 251); // Gray-50
      pdf.setDrawColor(229, 231, 235); // Gray-200
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPos - 3, 170, 16, 3, 3, 'FD');
      
      // Mood name
      pdf.setTextColor(31, 41, 55); // Gray-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mood.charAt(0).toUpperCase() + mood.slice(1), 30, yPos + 6);
      
      // Count and percentage
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${count} entries (${percentage}%)`, 100, yPos + 6);
      
      // Modern progress bar
      const barWidth = Math.max((count / insights.totalEntries) * 60, 3);
      pdf.setFillColor(229, 231, 235); // Gray-200 background
      pdf.roundedRect(140, yPos + 1, 60, 8, 2, 2, 'F');
      
      if (moodColors[mood]) {
        pdf.setFillColor(...moodColors[mood]);
        pdf.roundedRect(140, yPos + 1, barWidth, 8, 2, 2, 'F');
      }
      
      yPos += 20;
    });
    
    yPos += 15;
    
    // Weekly Pattern Analysis
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(239, 246, 255); // Blue-50
    pdf.setDrawColor(59, 130, 246); // Blue-500
    pdf.roundedRect(15, yPos - 5, 180, 15, 4, 4, 'FD');
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(15, yPos - 5, 180, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Mood Pattern', 25, yPos + 5);
    
    yPos += 25;
    
    // Weekly data in a structured format
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(20, yPos - 5, 170, (weeklyData.length * 12) + 10, 4, 4, 'FD');
    
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day', 30, yPos + 5);
    pdf.text('Mood Status', 80, yPos + 5);
    pdf.text('Entry Count', 140, yPos + 5);
    
    yPos += 15;
    
    weeklyData.forEach((day, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      pdf.setFillColor(...bgColor);
      pdf.rect(25, yPos - 3, 160, 10, 'F');
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.text(day.day, 30, yPos + 3);
      
      const moodText = day.mood ? 
        `${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        'No entry';
      
      pdf.setFont('helvetica', day.mood ? 'bold' : 'italic');
      pdf.setTextColor(day.mood ? 31 : 156, day.mood ? 41 : 163, day.mood ? 55 : 175);
      pdf.text(moodText, 80, yPos + 3);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(day.mood ? '1' : '0', 140, yPos + 3);
      
      yPos += 12;
    });
    
    yPos += 20;
    
    // Journal Analytics (if applicable)
    if (insights.journalEntriesCount > 0) {
      if (yPos > 220) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFillColor(253, 244, 255); // Purple-50
      pdf.setDrawColor(147, 51, 234); // Purple-600
      pdf.roundedRect(15, yPos - 5, 180, 15, 4, 4, 'FD');
      
      pdf.setFillColor(147, 51, 234);
      pdf.rect(15, yPos - 5, 180, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journal Writing Analysis', 25, yPos + 5);
      
      yPos += 25;
      
      const journalStats = [
        { label: 'Journal Entries', value: insights.journalEntriesCount.toString(), desc: 'entries with text' },
        { label: 'Total Words', value: insights.totalWords.toLocaleString(), desc: 'words written' },
        { label: 'Avg Words/Entry', value: insights.avgWordsPerEntry.toString(), desc: 'average length' },
        { label: 'Completion Rate', value: `${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%`, desc: 'with journal text' }
      ];
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(20, yPos - 5, 170, 60, 4, 4, 'FD');
      
      journalStats.forEach((stat, index) => {
        const x = 30 + (index % 2) * 85;
        const y = yPos + 10 + Math.floor(index / 2) * 25;
        
        pdf.setTextColor(88, 28, 135); // Purple-800
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(stat.label, x, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(stat.value, x, y + 8);
        
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        pdf.text(stat.desc, x, y + 16);
      });
      
      yPos += 75;
    }
    
    // Insights and Recommendations
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(254, 242, 242); // Red-50
    pdf.setDrawColor(239, 68, 68); // Red-500
    pdf.roundedRect(15, yPos - 5, 180, 15, 4, 4, 'FD');
    
    pdf.setFillColor(239, 68, 68);
    pdf.rect(15, yPos - 5, 180, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personalized Insights & Recommendations', 25, yPos + 5);
    
    yPos += 25;
    
    const personalizedInsights = [
      {
        title: 'Consistency Achievement',
        content: `You've maintained a ${insights.currentStreak}-day tracking streak, demonstrating excellent commitment to self-awareness.`,
        recommendation: 'Continue this momentum by setting daily reminders for mood check-ins.'
      },
      {
        title: 'Dominant Mood Pattern',
        content: `Your most frequent mood is "${insights.mostCommonMood[0]}", appearing in ${((insights.mostCommonMood[1] / insights.totalEntries) * 100).toFixed(1)}% of entries.`,
        recommendation: 'Reflect on environmental and situational factors that contribute to this pattern.'
      },
      {
        title: 'Journal Engagement',
        content: insights.avgWordsPerEntry > 50 ? 
          'Your detailed journal entries demonstrate strong self-reflection habits and emotional processing.' :
          'Consider writing longer journal entries to deepen your self-understanding and emotional awareness.',
        recommendation: insights.avgWordsPerEntry > 50 ?
          'Try exploring specific emotions and their triggers in greater detail.' :
          'Aim for 3-5 sentences per entry to capture more nuanced emotional experiences.'
      }
    ];
    
    personalizedInsights.forEach((insight, index) => {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(20, yPos - 5, 170, 35, 4, 4, 'FD');
      
      pdf.setTextColor(153, 27, 27); // Red-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, 25, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      
      const contentLines = pdf.splitTextToSize(insight.content, 160);
      let lineY = yPos + 13;
      contentLines.forEach((line: string) => {
        pdf.text(line, 25, lineY);
        lineY += 4;
      });
      
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(107, 114, 128);
      const recLines = pdf.splitTextToSize(`Tip: ${insight.recommendation}`, 160);
      recLines.forEach((line: string) => {
        pdf.text(line, 25, lineY);
        lineY += 4;
      });
      
      yPos += 45;
    });
    
    // Footer with enhanced branding
    const footerY = pageHeight - 25;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, footerY, pageWidth, 25, 'F');
    
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(15, footerY + 5, pageWidth - 15, footerY + 5);
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by Mood Journal - Your Personal Wellness Companion', 20, footerY + 12);
    
    pdf.setFont('helvetica', 'italic');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Report generated: ${timestamp}`, 20, footerY + 18);
    
    pdf.setTextColor(156, 163, 175);
    pdf.text('Continue your wellness journey at your own pace', pageWidth - 80, footerY + 12);
    
    // Save with improved filename
    const dateString = new Date().toISOString().slice(0, 10);
    pdf.save(`mood-insights-report-${dateString}.pdf`);
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
