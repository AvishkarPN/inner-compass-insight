
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      // Enhanced configuration for better cross-device compatibility
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            if (transcript.trim()) {
              onTranscript(transcript);
            }
          }
        }
      };
      
      recognition.onerror = (event) => {
        // Only show error for critical issues, ignore common non-critical errors
        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access to use voice-to-text.',
            variant: 'destructive'
          });
        }
        // Silently handle other errors like 'no-speech', 'network', etc.
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      setIsRecording(false);
      // Only show critical errors
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: 'Microphone Access Required',
          description: 'Please allow microphone access to use voice-to-text.',
          variant: 'destructive'
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="sm"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      {isRecording ? (
        <>
          <Square className="h-4 w-4 fill-current" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Voice
        </>
      )}
    </Button>
  );
};

export default VoiceRecorder;
