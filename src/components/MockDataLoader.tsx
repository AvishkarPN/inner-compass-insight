
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMood } from '@/contexts/MoodContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateMockMoodEntries } from '@/utils/mockDataGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database, Download, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

const MockDataLoader = () => {
  const { moodEntries } = useMood();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [previewData, setPreviewData] = useState<ReturnType<typeof generateMockMoodEntries> | null>(null);

  const generatePreview = () => {
    const mockEntries = generateMockMoodEntries();
    setPreviewData(mockEntries);
  };

  const loadMockData = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to load mock data.',
        variant: 'destructive'
      });
      return;
    }

    if (!previewData) {
      toast({
        title: 'No Data Generated',
        description: 'Please generate preview data first.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const entriesToInsert = previewData.map(entry => ({
        id: entry.id,
        user_id: user.id,
        mood: entry.mood,
        notes: entry.journalText,
        timestamp: entry.timestamp.toISOString(),
        created_at: entry.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('mood_entries')
        .insert(entriesToInsert);

      if (error) {
        throw error;
      }

      toast({
        title: 'Mock Data Loaded',
        description: `Successfully imported ${previewData.length} mood entries spanning 3 months.`,
      });

      setPreviewData(null);

    } catch (error) {
      console.error('Error loading mock data:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import mock data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const eraseAllData = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to erase data.',
        variant: 'destructive'
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${moodEntries.length} mood entries? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsErasing(true);

    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Data Erased',
        description: 'All mood entries have been successfully deleted.',
      });

    } catch (error) {
      console.error('Error erasing data:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete mood entries. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsErasing(false);
    }
  };

  const getMoodStats = () => {
    if (!previewData) return null;

    const moodCounts = previewData.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return moodCounts;
  };

  const moodStats = getMoodStats();

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            Mock Data Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-3 sm:px-6">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                This will generate realistic mood entries for the past 3 months (1-3 entries per day with varying emotions).
                {moodEntries.length > 0 && (
                  <span className="block mt-2 font-medium">
                    Note: You already have {moodEntries.length} existing entries.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={generatePreview}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                Generate Preview
              </Button>
              
              {previewData && (
                <Button 
                  onClick={loadMockData}
                  disabled={isLoading || !user}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      Import Data ({previewData.length} entries)
                    </>
                  )}
                </Button>
              )}

              {moodEntries.length > 0 && (
                <Button 
                  onClick={eraseAllData}
                  disabled={isErasing || !user}
                  variant="destructive"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  {isErasing ? (
                    <>Erasing...</>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      Erase All Data ({moodEntries.length} entries)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {previewData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Preview Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium">Total Entries:</span> {previewData.length}
                  </div>
                  <div>
                    <span className="font-medium">Date Range:</span> {' '}
                    <span className="break-all">
                      {new Date(Math.min(...previewData.map(e => e.timestamp.getTime()))).toLocaleDateString()} - {' '}
                      {new Date(Math.max(...previewData.map(e => e.timestamp.getTime()))).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Avg per day:</span> {' '}
                    {(previewData.length / 90).toFixed(1)}
                  </div>
                </div>
              </div>

              {moodStats && (
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Mood Distribution</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodStats).map(([mood, count]) => (
                      <Badge key={mood} variant="outline" className="text-xs">
                        {mood}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Sample Entries</h4>
                <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto border rounded p-3">
                  {previewData.slice(0, 5).map((entry, index) => (
                    <div key={index} className="text-xs sm:text-sm border-b pb-2 last:border-b-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs w-fit">
                          {entry.mood}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {entry.journalText}
                      </p>
                    </div>
                  ))}
                  {previewData.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ...and {previewData.length - 5} more entries
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataLoader;
