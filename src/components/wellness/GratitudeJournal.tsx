
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Save, Sparkles } from 'lucide-react';

interface GratitudeJournalProps {
  onClose: () => void;
}

const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ onClose }) => {
  const [gratitudeEntry, setGratitudeEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const prompts = [
    "What made you smile today?",
    "Who are you thankful for and why?",
    "What small moment brought you joy?",
    "What challenge helped you grow?",
    "What in nature are you grateful for?",
    "What skill or ability are you thankful to have?",
    "What memory makes you feel warm inside?",
    "What opportunity are you grateful for?"
  ];

  const handleSave = () => {
    if (gratitudeEntry.trim()) {
      setSavedEntries([...savedEntries, gratitudeEntry.trim()]);
      setGratitudeEntry('');
      
      // Save to localStorage for persistence
      const existingEntries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
      const newEntry = {
        text: gratitudeEntry.trim(),
        date: new Date().toISOString()
      };
      localStorage.setItem('gratitudeEntries', JSON.stringify([...existingEntries, newEntry]));
    }
  };

  const handleNewPrompt = () => {
    setCurrentPrompt((prev) => (prev + 1) % prompts.length);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Gratitude Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600 mt-1" />
            <div>
              <p className="text-yellow-800 font-medium mb-2">Today's Prompt:</p>
              <p className="text-yellow-700">{prompts[currentPrompt]}</p>
            </div>
          </div>
          <Button 
            onClick={handleNewPrompt} 
            variant="outline" 
            size="sm" 
            className="mt-3 text-yellow-700 border-yellow-300"
          >
            New Prompt
          </Button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">
            What are you grateful for?
          </label>
          <Textarea
            value={gratitudeEntry}
            onChange={(e) => setGratitudeEntry(e.target.value)}
            placeholder="Take a moment to reflect on something positive in your life..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Research shows that gratitude practice can improve mental well-being and happiness.
          </p>
        </div>

        {savedEntries.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Today's Gratitude ({savedEntries.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedEntries.map((entry, index) => (
                <div key={index} className="bg-green-50 p-2 rounded text-sm text-green-800">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={handleSave} disabled={!gratitudeEntry.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Tip: Try to write at least 3 things you're grateful for each day. 
            Even small moments count!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GratitudeJournal;
