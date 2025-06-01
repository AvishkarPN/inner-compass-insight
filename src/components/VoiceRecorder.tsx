
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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Add timeout handling for better reliability
      let timeoutId: NodeJS.Timeout;
      
      let finalTranscript = '';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        
        // Set a timeout to automatically stop after 30 seconds
        timeoutId = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 30000);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Send the current transcript (final + interim) to parent
        const fullTranscript = finalTranscript + interimTranscript;
        if (fullTranscript.trim()) {
          onTranscript(fullTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        clearTimeout(timeoutId);
        
        let errorMessage = 'There was an issue with voice recognition. Please try again.';
        
        // Provide more specific error messages
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available. Please try again later.';
            break;
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
        title: 'Recording Started',
        description: 'Speak into your microphone. Recording will stop automatically after 30 seconds.'
      });
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
      
      let errorMessage = 'Please allow microphone access to use voice-to-text.';
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          errorMessage = 'Voice recognition is not supported in this browser. Try using Chrome or Safari.';
        }
      }
      
      toast({
        title: 'Permission Denied',
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
