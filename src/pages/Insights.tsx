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
    
    // Modern gradient header
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    pdf.setFillColor(67, 56, 202);
    pdf.rect(0, 35, pageWidth, 15, 'F');
    
    // Clean title styling
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', 20, 20);
    
    // Subtitle with date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${reportDate}`, 20, 32);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your personal wellness journey insights', 20, 42);
    
    let yPos = 70;
    
    if (!insights) {
      // No data section with card-like design
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, yPos - 5, 180, 40, 5, 5, 'FD');
      
      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('No Data Available', 25, yPos + 10);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Start tracking your moods to unlock personalized insights', 25, yPos + 22);
      pdf.text('and discover patterns in your emotional wellness journey.', 25, yPos + 30);
      
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Key Metrics Card
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1);
    pdf.roundedRect(15, yPos - 5, 180, 65, 5, 5, 'FD');
    
    pdf.setTextColor(29, 78, 216);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overview Statistics', 25, yPos + 8);
    
    // Stats grid
    const stats = [
      { label: 'Total Entries', value: insights.totalEntries.toString() },
      { label: 'Current Streak', value: `${insights.currentStreak} days` },
      { label: 'Days Tracked', value: insights.uniqueDays.toString() },
      { label: 'Journal Completion', value: `${Math.round((insights.journalEntriesCount / insights.totalEntries) * 100)}%` }
    ];
    
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(9);
    
    stats.forEach((stat, index) => {
      const x = 25 + (index % 2) * 85;
      const y = yPos + 20 + Math.floor(index / 2) * 16;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.label, x, y);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(stat.value, x, y + 7);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
    });
    
    // Most common mood
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Most Common Mood:', 25, yPos + 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text(insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1), 80, yPos + 55);
    
    yPos += 80;
    
    // Mood Distribution Section
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(34, 197, 94);
    pdf.roundedRect(15, yPos - 5, 180, 12, 3, 3, 'FD');
    
    pdf.setFillColor(34, 197, 94);
    pdf.rect(15, yPos - 5, 180, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Distribution Analysis', 25, yPos + 2);
    
    yPos += 20;
    
    const sortedMoods = Object.entries(insights.moodCounts).sort((a, b) => b[1] - a[1]);
    const moodColors: Record<string, [number, number, number]> = {
      happy: [34, 197, 94],
      sad: [59, 130, 246],
      anxious: [147, 51, 234],
      calm: [16, 185, 129],
      energetic: [249, 115, 22],
      angry: [239, 68, 68],
      peaceful: [6, 182, 212]
    };
    
    sortedMoods.forEach(([mood, count], index) => {
      const percentage = ((count / insights.totalEntries) * 100).toFixed(1);
      
      // Card-like mood entry
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(20, yPos - 2, 170, 12, 2, 2, 'FD');
      
      // Mood info
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mood.charAt(0).toUpperCase() + mood.slice(1), 25, yPos + 4);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${count} entries (${percentage}%)`, 85, yPos + 4);
      
      // Progress bar
      const barWidth = Math.max((count / insights.totalEntries) * 50, 2);
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(135, yPos + 1, 50, 6, 1, 1, 'F');
      
      if (moodColors[mood]) {
        const [r, g, b] = moodColors[mood];
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(135, yPos + 1, barWidth, 6, 1, 1, 'F');
      }
      
      yPos += 15;
    });
    
    yPos += 10;
    
    // Weekly Pattern Analysis
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(254, 249, 195);
    pdf.setDrawColor(251, 191, 36);
    pdf.roundedRect(15, yPos - 5, 180, 12, 3, 3, 'FD');
    
    pdf.setFillColor(251, 191, 36);
    pdf.rect(15, yPos - 5, 180, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Mood Pattern', 25, yPos + 2);
    
    yPos += 20;
    
    // Weekly data table
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(20, yPos - 5, 170, (weeklyData.length * 10) + 15, 3, 3, 'FD');
    
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day', 30, yPos + 5);
    pdf.text('Mood Status', 80, yPos + 5);
    pdf.text('Entry Count', 140, yPos + 5);
    
    yPos += 12;
    
    weeklyData.forEach((day, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      const [r, g, b] = bgColor;
      pdf.setFillColor(r, g, b);
      pdf.rect(25, yPos - 2, 160, 8, 'F');
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(day.day, 30, yPos + 2);
      
      const moodText = day.mood ? 
        `${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        'No entry';
      
      pdf.setFont('helvetica', day.mood ? 'bold' : 'italic');
      pdf.setTextColor(day.mood ? 31 : 156, day.mood ? 41 : 163, day.mood ? 55 : 175);
      pdf.text(moodText, 80, yPos + 2);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(day.mood ? '1' : '0', 140, yPos + 2);
      
      yPos += 10;
    });
    
    yPos += 15;
    
    // Journal Analytics
    if (insights.journalEntriesCount > 0) {
      if (yPos > 220) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFillColor(253, 244, 255);
      pdf.setDrawColor(147, 51, 234);
      pdf.roundedRect(15, yPos - 5, 180, 12, 3, 3, 'FD');
      
      pdf.setFillColor(147, 51, 234);
      pdf.rect(15, yPos - 5, 180, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journal Writing Analysis', 25, yPos + 2);
      
      yPos += 20;
      
      const journalStats = [
        { label: 'Journal Entries', value: insights.journalEntriesCount.toString() },
        { label: 'Total Words', value: insights.totalWords.toLocaleString() },
        { label: 'Avg Words/Entry', value: insights.avgWordsPerEntry.toString() },
        { label: 'Completion Rate', value: `${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%` }
      ];
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(20, yPos - 5, 170, 45, 3, 3, 'FD');
      
      journalStats.forEach((stat, index) => {
        const x = 30 + (index % 2) * 75;
        const y = yPos + 8 + Math.floor(index / 2) * 18;
        
        pdf.setTextColor(88, 28, 135);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(stat.label, x, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(stat.value, x, y + 6);
      });
      
      yPos += 55;
    }
    
    // Insights Section
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(239, 68, 68);
    pdf.roundedRect(15, yPos - 5, 180, 12, 3, 3, 'FD');
    
    pdf.setFillColor(239, 68, 68);
    pdf.rect(15, yPos - 5, 180, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personalized Insights', 25, yPos + 2);
    
    yPos += 20;
    
    const personalizedInsights = [
      {
        title: 'Consistency Achievement',
        content: `You have maintained a ${insights.currentStreak}-day tracking streak, showing excellent commitment to self-awareness.`
      },
      {
        title: 'Dominant Mood Pattern',
        content: `Your most frequent mood is "${insights.mostCommonMood[0]}", appearing in ${((insights.mostCommonMood[1] / insights.totalEntries) * 100).toFixed(1)}% of entries.`
      },
      {
        title: 'Journal Engagement',
        content: insights.avgWordsPerEntry > 50 ? 
          'Your detailed journal entries demonstrate strong self-reflection habits.' :
          'Consider writing longer journal entries to deepen your self-understanding.'
      }
    ];
    
    personalizedInsights.forEach((insight) => {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(20, yPos - 5, 170, 25, 3, 3, 'FD');
      
      pdf.setTextColor(153, 27, 27);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, 25, yPos + 3);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      
      const contentLines = pdf.splitTextToSize(insight.content, 160);
      let lineY = yPos + 10;
      contentLines.forEach((line: string) => {
        pdf.text(line, 25, lineY);
        lineY += 4;
      });
      
      yPos += 30;
    });
    
    // Footer
    const footerY = pageHeight - 20;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, footerY, pageWidth, 20, 'F');
    
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(15, footerY + 3, pageWidth - 15, footerY + 3);
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by Mood Journal - Your Personal Wellness Companion', 20, footerY + 8);
    
    const timestamp = new Date().toLocaleString();
    pdf.text(`Report generated: ${timestamp}`, 20, footerY + 13);
    
    // Save
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
