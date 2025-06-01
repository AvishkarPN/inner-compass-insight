
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
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
    // Check if speech recognition is supported with more comprehensive detection
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use more comprehensive speech recognition detection
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }
      
      const recognition = new SpeechRecognition();
      
      // Enhanced configuration for better cross-platform support
      recognition.continuous = false; // Changed to false for better reliability
      recognition.interimResults = false; // Changed to false for simpler handling
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Add timeout handling for better reliability
      let timeoutId: NodeJS.Timeout;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        
        // Set a shorter timeout for better UX
        timeoutId = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 10000); // Reduced to 10 seconds
      };
      
      recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            onTranscript(transcript);
            toast({
              title: 'Voice Captured',
              description: 'Your voice has been converted to text successfully.'
            });
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        clearTimeout(timeoutId);
        
        let errorMessage = 'Voice recognition failed. Please try typing instead.';
        
        // Provide more specific error messages
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Voice recognition requires an internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice recognition service not available. Please try again later.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone and try again.';
            break;
          case 'aborted':
            // Don't show error for user-initiated stops
            return;
        }
        
        toast({
          title: 'Voice Recognition Error',
          description: errorMessage,
          variant: 'destructive'
        });
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        clearTimeout(timeoutId);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
      toast({
        title: 'Listening...',
        description: 'Speak now. Recording will stop automatically when you finish speaking.'
      });
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
      
      let errorMessage = 'Please allow microphone access to use voice-to-text.';
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          errorMessage = 'Voice recognition is not supported in this browser. Try using Chrome, Safari, or Edge.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        }
      }
      
      toast({
        title: 'Microphone Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    
    toast({
      title: 'Recording Stopped',
      description: 'Voice recording has been stopped.'
    });
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
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
          <Square className="h-4 w-4" />
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
