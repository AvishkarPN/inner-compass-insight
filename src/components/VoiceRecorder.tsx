
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
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    // Cleanup on unmount
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission and get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }
      
      const recognition = new SpeechRecognition();
      
      // Configure for continuous listening
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      let finalTranscript = '';
      let lastSpeechTime = Date.now();
      let silenceTimer: NodeJS.Timeout;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        lastSpeechTime = Date.now();
        
        toast({
          title: 'Listening...',
          description: 'Speak continuously. Recording will stop after 3 seconds of silence.'
        });
      };
      
      recognition.onresult = (event) => {
        lastSpeechTime = Date.now();
        
        // Clear any existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Set silence timer to stop after 3 seconds of no speech
        silenceTimer = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTime;
          if (timeSinceLastSpeech >= 3000) {
            recognition.stop();
          }
        }, 3000);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't show error for user-initiated stops or no-speech
        if (event.error === 'aborted' || event.error === 'no-speech') {
          return;
        }
        
        setIsRecording(false);
        stopMediaStream();
        
        let errorMessage = 'Voice recognition failed. Please try again.';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice recognition service not available.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone.';
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
        stopMediaStream();
        
        // Process final transcript
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim());
          toast({
            title: 'Voice Captured',
            description: 'Your voice has been converted to text successfully.'
          });
        }
        
        // Clear any remaining timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
      stopMediaStream();
      
      let errorMessage = 'Please allow microphone access to use voice-to-text.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Voice recognition is not supported in this browser.';
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
    stopMediaStream();
    setIsRecording(false);
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  // Handle page unload to cleanup microphone access
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      stopRecording();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        stopRecording();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopRecording();
    };
  }, [isRecording]);

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
