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
  
  // Enhanced PDF export with modern design and proper character encoding
  const handleExportInsights = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set proper font encoding to avoid symbol issues
    pdf.setFont('helvetica', 'normal');
    
    const pageWidth = 210;
    const pageHeight = 297;
    let yPos = 25;
    
    // Modern header with gradient effect
    pdf.setFillColor(67, 56, 202); // Primary purple
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Add subtle pattern/texture effect
    pdf.setFillColor(99, 102, 241); // Lighter purple
    pdf.rect(0, 45, pageWidth, 15, 'F');
    
    // Title section
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', 20, 25);
    
    // Subtitle with proper date formatting
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${reportDate}`, 20, 38);
    
    // Clean tagline
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your Personal Wellness Journey', 20, 50);
    
    yPos = 80;
    
    if (!insights) {
      // No data available section
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(1);
      pdf.roundedRect(15, yPos - 10, 180, 50, 8, 8, 'FD');
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('No Data Available', 25, yPos + 5);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Start tracking your moods to unlock personalized insights', 25, yPos + 20);
      pdf.text('and discover patterns in your emotional wellness journey.', 25, yPos + 30);
      
      pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Overview Statistics Card
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.roundedRect(15, yPos - 10, 180, 80, 8, 8, 'FD');
    
    // Card header
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Statistics', 25, yPos);
    
    // Statistics grid with proper spacing
    const stats = [
      { label: 'Total Entries', value: insights.totalEntries.toString(), icon: '●' },
      { label: 'Current Streak', value: `${insights.currentStreak} days`, icon: '●' },
      { label: 'Days Tracked', value: insights.uniqueDays.toString(), icon: '●' },
      { label: 'Journal Rate', value: `${Math.round((insights.journalEntriesCount / insights.totalEntries) * 100)}%`, icon: '●' }
    ];
    
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(10);
    
    stats.forEach((stat, index) => {
      const x = 25 + (index % 2) * 90;
      const y = yPos + 15 + Math.floor(index / 2) * 25;
      
      // Clean bullet point
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('•', x, y);
      
      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(stat.label, x + 5, y);
      
      // Value
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(67, 56, 202);
      pdf.text(stat.value, x + 5, y + 8);
      pdf.setTextColor(30, 64, 175);
    });
    
    // Most common mood highlight
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Most Common Mood:', 25, yPos + 65);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(67, 56, 202);
    pdf.text(insights.mostCommonMood[0].charAt(0).toUpperCase() + insights.mostCommonMood[0].slice(1), 85, yPos + 65);
    
    yPos += 100;
    
    // Mood Distribution Section
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(2);
    pdf.roundedRect(15, yPos - 10, 180, 20, 6, 6, 'FD');
    
    pdf.setFillColor(34, 197, 94);
    pdf.rect(15, yPos - 10, 180, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Distribution Analysis', 25, yPos - 2);
    
    yPos += 25;
    
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
      
      // Mood entry card
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPos - 5, 170, 18, 4, 4, 'FD');
      
      // Mood circle indicator
      const color = moodColors[mood] || [107, 114, 128];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.circle(30, yPos + 4, 4, 'F');
      
      // Mood information
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mood.charAt(0).toUpperCase() + mood.slice(1), 40, yPos + 2);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`${count} entries (${percentage}%)`, 40, yPos + 10);
      
      // Progress bar
      const barWidth = Math.max((count / insights.totalEntries) * 60, 3);
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(120, yPos + 2, 60, 8, 2, 2, 'F');
      
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(120, yPos + 2, barWidth, 8, 2, 2, 'F');
      
      yPos += 22;
    });
    
    yPos += 15;
    
    // Weekly Pattern Analysis
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(254, 249, 195);
    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(2);
    pdf.roundedRect(15, yPos - 10, 180, 20, 6, 6, 'FD');
    
    pdf.setFillColor(251, 191, 36);
    pdf.rect(15, yPos - 10, 180, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Mood Pattern', 25, yPos - 2);
    
    yPos += 25;
    
    // Weekly data in a clean table format
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(1);
    pdf.roundedRect(20, yPos - 10, 170, (weeklyData.length * 12) + 25, 6, 6, 'FD');
    
    // Table header
    pdf.setFillColor(71, 85, 105);
    pdf.rect(25, yPos - 5, 160, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day', 35, yPos + 4);
    pdf.text('Mood Status', 80, yPos + 4);
    pdf.text('Entries', 150, yPos + 4);
    
    yPos += 20;
    
    weeklyData.forEach((day, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(25, yPos - 3, 160, 12, 'F');
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(day.day, 35, yPos + 3);
      
      const moodText = day.mood ? 
        `${day.mood.charAt(0).toUpperCase() + day.mood.slice(1)}` : 
        'No entry';
      
      pdf.setFont('helvetica', day.mood ? 'bold' : 'italic');
      pdf.setTextColor(day.mood ? 31 : 156, day.mood ? 41 : 163, day.mood ? 55 : 175);
      pdf.text(moodText, 80, yPos + 3);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(day.mood ? '1' : '0', 150, yPos + 3);
      
      yPos += 12;
    });
    
    yPos += 20;
    
    // Journal Analytics (if applicable)
    if (insights.journalEntriesCount > 0) {
      if (yPos > 220) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFillColor(253, 244, 255);
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(2);
      pdf.roundedRect(15, yPos - 10, 180, 20, 6, 6, 'FD');
      
      pdf.setFillColor(147, 51, 234);
      pdf.rect(15, yPos - 10, 180, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journal Writing Analysis', 25, yPos - 2);
      
      yPos += 25;
      
      const journalStats = [
        { label: 'Journal Entries', value: insights.journalEntriesCount.toString() },
        { label: 'Total Words', value: insights.totalWords.toLocaleString() },
        { label: 'Avg Words/Entry', value: insights.avgWordsPerEntry.toString() },
        { label: 'Completion Rate', value: `${((insights.journalEntriesCount / insights.totalEntries) * 100).toFixed(1)}%` }
      ];
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(1);
      pdf.roundedRect(20, yPos - 10, 170, 55, 6, 6, 'FD');
      
      journalStats.forEach((stat, index) => {
        const x = 30 + (index % 2) * 80;
        const y = yPos + 5 + Math.floor(index / 2) * 25;
        
        pdf.setTextColor(88, 28, 135);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(stat.label, x, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(147, 51, 234);
        pdf.text(stat.value, x, y + 8);
      });
      
      yPos += 70;
    }
    
    // Personalized Insights Section
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(2);
    pdf.roundedRect(15, yPos - 10, 180, 20, 6, 6, 'FD');
    
    pdf.setFillColor(239, 68, 68);
    pdf.rect(15, yPos - 10, 180, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personalized Insights', 25, yPos - 2);
    
    yPos += 25;
    
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
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(1);
      pdf.roundedRect(20, yPos - 5, 170, 30, 6, 6, 'FD');
      
      // Insight number indicator
      pdf.setFillColor(239, 68, 68);
      pdf.circle(30, yPos + 5, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text((index + 1).toString(), 27, yPos + 8);
      
      pdf.setTextColor(153, 27, 27);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, 45, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      
      const contentLines = pdf.splitTextToSize(insight.content, 140);
      let lineY = yPos + 15;
      contentLines.forEach((line: string) => {
        pdf.text(line, 45, lineY);
        lineY += 5;
      });
      
      yPos += 35;
    });
    
    // Professional footer
    const footerY = pageHeight - 25;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, footerY, pageWidth, 25, 'F');
    
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.line(15, footerY + 5, pageWidth - 15, footerY + 5);
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by Mood Journal - Your Personal Wellness Companion', 20, footerY + 12);
    
    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Report generated: ${timestamp}`, 20, footerY + 18);
    
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
