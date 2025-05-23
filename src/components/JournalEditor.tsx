
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface JournalEditorProps {
  onSave: (text: string) => void;
  initialText?: string;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ onSave, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Set up speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setText((prevText) => {
          // Only append new text
          if (!prevText.includes(transcript)) {
            return prevText + ' ' + transcript;
          }
          return prevText;
        });
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
        toast({
          title: 'Voice recording error',
          description: 'There was a problem with the microphone. Please try again.',
          variant: 'destructive'
        });
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [toast]);

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: 'Voice recording not supported',
        description: 'Your browser does not support voice recording.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      toast({
        title: 'Voice recording stopped',
        description: 'Your journal entry has been updated.',
      });
    } else {
      recognition.start();
      setIsRecording(true);
      toast({
        title: 'Voice recording started',
        description: 'Speak clearly to add text to your journal.',
      });
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      setText('');
      
      // Stop recording if active
      if (isRecording && recognition) {
        recognition.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Journal Entry</h3>
        <Button 
          variant={isRecording ? "destructive" : "secondary"} 
          size="sm" 
          onClick={toggleRecording}
          className="flex items-center gap-1"
        >
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          {isRecording ? 'Stop Recording' : 'Voice-to-Text'}
        </Button>
      </div>
      
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write about your feelings or what's on your mind today..."
        className="min-h-[120px] transition-all"
        style={{
          boxShadow: isRecording ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
          borderColor: isRecording ? 'rgba(220, 38, 38, 0.5)' : undefined,
        }}
      />
      
      {isRecording && (
        <div className="text-sm flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Recording... speak clearly
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!text.trim()}>
          Save Entry
        </Button>
      </div>
    </div>
  );
};

export default JournalEditor;
