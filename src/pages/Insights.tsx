import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeeklyMoodChart from '@/components/WeeklyMoodChart';
import { useMood } from '@/contexts/MoodContext';
import MoodDistributionChart from '@/components/MoodDistributionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, BookOpen, Brain, Download, Trophy, FileSpreadsheet, Sparkles } from 'lucide-react';
import JournalInsights from '@/components/JournalInsights';
import AchievementsDisplay from '@/components/AchievementsDisplay';
import { calculateStreak } from '@/utils/streakUtils';
import { exportMoodCSV } from '@/utils/csvExport';
import MoodAISummary from '@/components/MoodAISummary';
import AIPatternDetector from '@/components/AIPatternDetector';

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

    // A7: Use unified streak calculation from streakUtils
    const currentStreak = calculateStreak(moodEntries);

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
  
  // #37: Lazy-load jsPDF only on demand
  const handleExportInsights = async () => {
    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set proper font encoding
    pdf.setFont('helvetica', 'normal');
    
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 25;
    
    // Helper function to check if content fits on current page
    const checkPageSpace = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - 25) {
        pdf.addPage();
        yPos = 25;
      }
    };
    
    // Modern header with proper proportions
    pdf.setFillColor(67, 56, 202);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Title section with better spacing
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', margin, 20);
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${reportDate}`, margin, 33);
    
    // Tagline
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your Personal Wellness Journey', margin, 42);
    
    yPos = 65;
    
    if (!insights) {
      // No data section with proper sizing
      checkPageSpace(60);
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin, yPos, contentWidth, 50, 5, 5, 'FD');
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('No Data Available', margin + 10, yPos + 15);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Start tracking your moods to unlock personalized insights', margin + 10, yPos + 28);
      pdf.text('and discover patterns in your emotional wellness journey.', margin + 10, yPos + 38);
      
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Key Statistics Section with proper layout
    checkPageSpace(85);
    
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, yPos, contentWidth, 75, 6, 6, 'FD');
    
    // Section header
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Statistics', margin + 10, yPos + 15);
    
    // Statistics in a clean 2x2 grid
    const stats = [
      { label: 'Total Entries', value: insights.totalEntries.toString() },
      { label: 'Current Streak', value: `${insights.currentStreak} days` },
      { label: 'Days Tracked', value: insights.uniqueDays.toString() },
      { label: 'Journal Rate', value: `${Math.round((insights.journalEntriesCount / insights.totalEntries) * 100)}%` }
    ];
    
    const statBoxWidth = (contentWidth - 30) / 2;
    const statBoxHeight = 25;
    
    stats.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 10 + (col * (statBoxWidth + 10));
      const y = yPos + 25 + (row * (statBoxHeight + 5));
      
      // Stat box background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(219, 234, 254);
      pdf.setLineWidth(1);
      pdf.roundedRect(x, y, statBoxWidth, statBoxHeight, 3, 3, 'FD');
      
      // Stat label
      pdf.setTextColor(75, 85, 99);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(stat.label, x + 5, y + 8);
      
      // Stat value
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(67, 56, 202);
      pdf.text(stat.value, x + 5, y + 18);
    });
    
    yPos += 85;
    
    // Most common mood highlight
    checkPageSpace(20);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Most Common Mood:', margin + 10, yPos + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(67, 56, 202);
    pdf.text(insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1), margin + 60, yPos + 5);
    
    yPos += 25;
    
    // Mood Distribution Section
    checkPageSpace(30 + (Object.keys(insights.moodCounts).length * 18));
    
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, yPos, contentWidth, 18, 5, 5, 'FD');
    
    pdf.setFillColor(34, 197, 94);
    pdf.rect(margin, yPos, contentWidth, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Distribution Analysis', margin + 10, yPos + 11);
    
    yPos += 30;
    
    const sortedMoods = Object.entries(insights.moodCounts).sort((a, b) => b[1] - a[1]);
    const moodColors: Record<string, number[]> = {
      happy: [254, 202, 87],
      sad: [59, 130, 246],
      anxious: [147, 51, 234],
      calm: [16, 185, 129],
      energetic: [249, 115, 22],
      angry: [239, 68, 68],
      peaceful: [6, 182, 212]
    };
    
    sortedMoods.forEach(([mood, count], index) => {
      const percentage = ((count / insights.totalEntries) * 100).toFixed(1);
      
      // Mood entry with proper spacing
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin + 5, yPos, contentWidth - 10, 15, 3, 3, 'FD');
      
      // Mood circle indicator
      const color = moodColors[mood] || [107, 114, 128];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.circle(margin + 15, yPos + 7.5, 3, 'F');
      
      // Mood text
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mood.charAt(0).toUpperCase() + mood.slice(1), margin + 25, yPos + 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`${count} entries (${percentage}%)`, margin + 25, yPos + 12);
      
      // Progress bar with proper proportions
      const progressBarWidth = 50;
      const progressBarX = margin + contentWidth - 60;
      const barFillWidth = Math.max((count / insights.totalEntries) * progressBarWidth, 2);
      
      // Progress bar background
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(progressBarX, yPos + 5, progressBarWidth, 6, 1.5, 1.5, 'F');
      
      // Progress bar fill
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(progressBarX, yPos + 5, barFillWidth, 6, 1.5, 1.5, 'F');
      
      yPos += 18;
    });
    
    yPos += 15;
    
    // Weekly Pattern Analysis
    checkPageSpace(40 + (weeklyData.length * 10));
    
    pdf.setFillColor(254, 249, 195);
    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, yPos, contentWidth, 18, 5, 5, 'FD');
    
    pdf.setFillColor(251, 191, 36);
    pdf.rect(margin, yPos, contentWidth, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Mood Pattern', margin + 10, yPos + 11);
    
    yPos += 30;
    
    // Weekly data table with proper sizing
    const tableHeight = (weeklyData.length * 10) + 20;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin + 5, yPos, contentWidth - 10, tableHeight, 5, 5, 'FD');
    
    // Table header
    pdf.setFillColor(71, 85, 105);
    pdf.rect(margin + 5, yPos, contentWidth - 10, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day', margin + 15, yPos + 8);
    pdf.text('Mood Status', margin + 60, yPos + 8);
    pdf.text('Entries', margin + 130, yPos + 8);
    
    yPos += 15;
    
    weeklyData.forEach((day, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(margin + 5, yPos, contentWidth - 10, 10, 'F');
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(day.day, margin + 15, yPos + 6);
      
      const moodText = day.mood ? 
        `${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        'No entry';
      
      pdf.setFont('helvetica', day.mood ? 'bold' : 'italic');
      pdf.setTextColor(day.mood ? 31 : 156, day.mood ? 41 : 163, day.mood ? 55 : 175);
      pdf.text(moodText, margin + 60, yPos + 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(day.mood ? '1' : '0', margin + 130, yPos + 6);
      
      yPos += 10;
    });
    
    yPos += 20;
    
    // Journal Analytics (if applicable)
    if (insights.journalEntriesCount > 0) {
      checkPageSpace(65);
      
      pdf.setFillColor(253, 244, 255);
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(1.5);
      pdf.roundedRect(margin, yPos, contentWidth, 18, 5, 5, 'FD');
      
      pdf.setFillColor(147, 51, 234);
      pdf.rect(margin, yPos, contentWidth, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journal Writing Analysis', margin + 10, yPos + 11);
      
      yPos += 30;
      
      const journalStats = [
        { label: 'Journal Entries', value: insights.journalEntriesCount.toString() },
        { label: 'Total Words', value: insights.totalWords.toLocaleString() },
        { label: 'Avg Words/Entry', value: insights.avgWordsPerEntry.toString() },
        { label: 'Completion Rate', value: `${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%` }
      ];
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin + 5, yPos, contentWidth - 10, 45, 5, 5, 'FD');
      
      const statWidth = (contentWidth - 30) / 2;
      journalStats.forEach((stat, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = margin + 15 + (col * (statWidth + 10));
        const y = yPos + 10 + (row * 20);
        
        pdf.setTextColor(88, 28, 135);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(stat.label, x, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(147, 51, 234);
        pdf.text(stat.value, x, y + 8);
      });
      
      yPos += 55;
    }
    
    // Personalized Insights Section
    checkPageSpace(120);
    
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, yPos, contentWidth, 18, 5, 5, 'FD');
    
    pdf.setFillColor(239, 68, 68);
    pdf.rect(margin, yPos, contentWidth, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personalized Insights', margin + 10, yPos + 11);
    
    yPos += 30;
    
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
    
    personalizedInsights.forEach((insight, index) => {
      checkPageSpace(30);
      
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin + 5, yPos, contentWidth - 10, 25, 5, 5, 'FD');
      
      // Insight number indicator
      pdf.setFillColor(239, 68, 68);
      pdf.circle(margin + 18, yPos + 12, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text((index + 1).toString(), margin + 15.5, yPos + 14.5);
      
      pdf.setTextColor(153, 27, 27);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, margin + 30, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      
      const maxWidth = contentWidth - 35;
      const contentLines = pdf.splitTextToSize(insight.content, maxWidth);
      let lineY = yPos + 15;
      contentLines.forEach((line: string) => {
        pdf.text(line, margin + 30, lineY);
        lineY += 4;
      });
      
      yPos += 30;
    });
    
    // Professional footer
    const footerY = pageHeight - 20;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, footerY, pageWidth, 20, 'F');
    
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.line(margin, footerY + 3, pageWidth - margin, footerY + 3);
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by Mind Garden - Your Personal Wellness Companion', margin, footerY + 9);
    
    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Report generated: ${timestamp}`, margin, footerY + 15);
    
    // Save with clean filename
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
        <div className="flex-shrink-0 w-full sm:w-auto flex gap-2 flex-wrap">
          <Button
            onClick={() => exportMoodCSV(moodEntries)}
            variant="outline"
            className="flex items-center justify-center gap-2 flex-1 sm:flex-auto min-h-[44px] px-4 py-2"
            aria-label="Export mood entries as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">Export CSV</span>
          </Button>
          <Button
            onClick={handleExportInsights}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-auto min-h-[44px] px-4 py-2"
            aria-label="Export insights as PDF"
          >
            <Download className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">Export PDF</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-900 p-1 rounded-lg shadow-sm w-full">
          <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-4 min-w-[380px] lg:w-fit lg:grid-cols-4 gap-1">
              <TabsTrigger
                value="charts"
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <BarChart size={16} className="flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline truncate">Charts</span>
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <Brain size={16} className="flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline truncate">Analysis</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-summary"
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <Sparkles size={16} className="flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline truncate">Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex gap-1.5 items-center text-xs sm:text-sm px-2 py-2 min-h-[40px]"
              >
                <Trophy size={16} className="flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline truncate">Achievements</span>
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
        
        <TabsContent value="ai-summary" className="space-y-4 sm:space-y-6">
          <AIPatternDetector entries={moodEntries} />
          <MoodAISummary entries={moodEntries} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 space-y-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Trophy size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
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
