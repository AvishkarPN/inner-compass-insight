
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, Clock } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { useNavigate } from 'react-router-dom';

const DailyReminderNotification: React.FC = () => {
  const { moodEntries } = useMood();
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkForReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Show reminder between 8 PM and 11:30 PM
      if (currentHour >= 20 && currentHour < 23.5) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEntries = moodEntries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });

        // Only show reminder if no entries today and reminder hasn't been dismissed
        const reminderDismissed = localStorage.getItem(`reminder-dismissed-${today.toDateString()}`);
        
        if (todayEntries.length === 0 && !reminderDismissed) {
          setShowReminder(true);
        }
      } else {
        setShowReminder(false);
      }
    };

    checkForReminder();
    
    // Check every 5 minutes
    const interval = setInterval(checkForReminder, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [moodEntries]);

  const handleDismiss = () => {
    const today = new Date();
    localStorage.setItem(`reminder-dismissed-${today.toDateString()}`, 'true');
    setShowReminder(false);
  };

  const handleAddEntry = () => {
    navigate('/');
    setShowReminder(false);
  };

  if (!showReminder) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <Card className="border-2 border-yellow-200 bg-yellow-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-full">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-yellow-800 text-sm mb-1">
                  Daily Mood Check-in
                </h3>
                <p className="text-yellow-700 text-xs mb-3">
                  You haven't logged your mood today. Take a moment to reflect on your day.
                </p>
                <div className="flex items-center gap-1 text-yellow-600 text-xs mb-3">
                  <Clock className="h-3 w-3" />
                  <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddEntry}
                    size="sm" 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-8"
                  >
                    Add Entry
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="outline" 
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 text-xs h-8"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReminderNotification;
