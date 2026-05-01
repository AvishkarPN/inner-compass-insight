
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
  const lastProcessedRef = useRef<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
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
      
      // Optimized settings for minimal lag
      recognition.continuous = true;
      recognition.interimResults = true; // Enable interim results for real-time feedback
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Reset the last processed text
      lastProcessedRef.current = '';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results for real-time updates
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Send final results immediately when available
        if (finalTranscript && finalTranscript !== lastProcessedRef.current) {
          lastProcessedRef.current = finalTranscript;
          onTranscript(finalTranscript);
        }
        
        // For interim results, we can optionally show them (uncomment if needed)
        // if (interimTranscript && !finalTranscript) {
        //   onTranscript(interimTranscript);
        // }
      };
      
      recognition.onerror = (event) => {
        // Only show critical errors, ignore common ones for smoother experience
        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access to use voice-to-text.',
            variant: 'destructive'
          });
        }
        // Silently handle other errors to prevent interruptions
        console.log('Speech recognition error:', event.error);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      setIsRecording(false);
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
    lastProcessedRef.current = '';
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className="flex items-center gap-2 min-h-[48px] min-w-[48px]"
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
