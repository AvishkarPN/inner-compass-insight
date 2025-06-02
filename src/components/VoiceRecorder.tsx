
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
      // Request microphone permission
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
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      let finalTranscript = '';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        
        toast({
          title: 'Recording Started',
          description: 'Speak now. Click Stop when finished.'
        });
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
        
        console.log('Interim:', interimTranscript);
        console.log('Final so far:', finalTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't show error for user-initiated stops
        if (event.error === 'aborted') {
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
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking louder.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice recognition service not available.';
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
            title: 'Recording Complete',
            description: 'Your speech has been converted to text.'
          });
        } else {
          toast({
            title: 'No Speech Detected',
            description: 'Please try again and speak clearly.',
            variant: 'destructive'
          });
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
