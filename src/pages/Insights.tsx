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
  
  // Handle export insights as PDF
  const handleExportInsights = () => {
    const pdf = new jsPDF();
    
    // Set up colors and styling
    const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
    const secondaryColor: [number, number, number] = [156, 163, 175]; // Gray
    const accentColor: [number, number, number] = [34, 197, 94]; // Green
    
    // Add decorative header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Add title with white text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mood Insights Report', 20, 25);
    
    // Add subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Reset text color to black
    pdf.setTextColor(0, 0, 0);
    
    // Add summary section with background
    let yPos = 60;
    pdf.setFillColor(249, 250, 251); // Light gray background
    pdf.rect(15, yPos - 10, 180, 30, 'F');
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📊 Summary', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Mood Entries: ${moodEntries.length}`, 25, yPos);
    
    // Calculate streak
    const calculateStreak = () => {
      if (!moodEntries.length) return 0;
      
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
      
      return currentStreak;
    };
    
    yPos += 10;
    pdf.text(`Current Streak: ${calculateStreak()} days`, 25, yPos);
    
    // Add mood distribution section
    yPos += 25;
    pdf.setFillColor(...accentColor);
    pdf.rect(15, yPos - 5, 180, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('💭 Mood Distribution', 20, yPos);
    
    pdf.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Sort moods by frequency
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => (b[1] || 0) - (a[1] || 0));
    
    sortedMoods.forEach(([mood, count]) => {
      const percentage = ((count / moodEntries.length) * 100).toFixed(1);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${mood.charAt(0).toUpperCase() + mood.slice(1)}: ${count} entries (${percentage}%)`, 25, yPos);
      
      // Add a small colored circle for each mood
      const moodColors: Record<string, [number, number, number]> = {
        angry: [255, 107, 107],
        energetic: [255, 165, 2],
        happy: [254, 202, 87],
        peaceful: [46, 204, 113],
        calm: [52, 152, 219],
        anxious: [155, 89, 182],
        sad: [116, 185, 255]
      };
      
      if (moodColors[mood]) {
        pdf.setFillColor(...moodColors[mood]);
        pdf.circle(22, yPos - 2, 1.5, 'F');
      }
      
      yPos += 8;
    });
    
    // Add weekly trends section
    yPos += 15;
    pdf.setFillColor(...primaryColor);
    pdf.rect(15, yPos - 5, 180, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📈 Weekly Trends', 20, yPos);
    
    pdf.setTextColor(0, 0, 0);
    yPos += 15;
    
    weeklyData.forEach(day => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${day.day}: ${day.mood ? day.mood.charAt(0).toUpperCase() + day.mood.slice(1) : 'No entry'}`, 25, yPos);
      yPos += 8;
    });
    
    // Add journal insights if available
    const journalEntries = moodEntries.filter(entry => entry.journalText.trim().length > 0);
    
    if (journalEntries.length > 0) {
      yPos += 15;
      pdf.setFillColor(249, 115, 22); // Orange
      pdf.rect(15, yPos - 5, 180, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📝 Journal Insights', 20, yPos);
      
      pdf.setTextColor(0, 0, 0);
      yPos += 15;
      
      const totalWords = journalEntries.reduce((total, entry) => {
        return total + entry.journalText.split(/\s+/).filter(Boolean).length;
      }, 0);
      
      const avgLength = Math.round(totalWords / journalEntries.length);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Journal Entries: ${journalEntries.length}`, 25, yPos);
      yPos += 8;
      pdf.text(`Average Entry Length: ${avgLength} words`, 25, yPos);
      yPos += 8;
      pdf.text(`Total Words Written: ${totalWords}`, 25, yPos);
    }
    
    // Add footer
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, 270, 210, 27, 'F');
    
    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Your Mood Tracker - Keep tracking for better insights!', 20, 285);
    
    // Save the PDF
    pdf.save(`mood-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Your Mood Insights</h1>
          <p className="text-muted-foreground text-sm md:text-base">Analyze your mood patterns and journal entries</p>
        </div>
        <Button onClick={handleExportInsights} className="flex items-center gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export as PDF
        </Button>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-6">
        <div className="bg-white dark:bg-gray-900 p-1 rounded-lg shadow-sm w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="charts" className="flex gap-1.5 items-center text-xs sm:text-sm">
              <BarChart size={16} />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex gap-1.5 items-center text-xs sm:text-sm">
              <Brain size={16} />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex gap-1.5 items-center text-xs sm:text-sm">
              <Trophy size={16} />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <BarChart size={18} className="text-primary" />
                  Weekly Mood Overview
                </CardTitle>
                <CardDescription className="text-sm">Your mood trends over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyMoodChart data={weeklyData} />
              </CardContent>
            </Card>
            
            <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <PieChart size={18} className="text-primary" />
                  Mood Distribution
                </CardTitle>
                <CardDescription className="text-sm">Breakdown of your recorded moods</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodDistributionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <BookOpen size={18} className="text-primary" />
                Journal Analysis
              </CardTitle>
              <CardDescription className="text-sm">Insights derived from your journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <JournalInsights />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          <Card className="shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Trophy size={18} className="text-primary" />
                Your Achievements
              </CardTitle>
              <CardDescription className="text-sm">Track your progress and unlock new milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementsDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
