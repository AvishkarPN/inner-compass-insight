
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import VoiceRecorder from './VoiceRecorder';

interface JournalEditorProps {
  value?: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  onSave?: (text: string) => void; // Keep for backward compatibility
}

const JournalEditor: React.FC<JournalEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write about your thoughts, feelings, or experiences...",
  onSave 
}) => {
  const [internalText, setInternalText] = useState('');
  
  const currentText = value !== undefined ? value : internalText;
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (onChange) {
      onChange(newText);
    } else {
      setInternalText(newText);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Append voice transcript to existing text
    const newText = currentText + (currentText ? ' ' : '') + transcript;
    if (onChange) {
      onChange(newText);
    } else {
      setInternalText(newText);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentText);
      if (value === undefined) {
        setInternalText('');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <VoiceRecorder onTranscript={handleVoiceTranscript} />
        </div>
      </div>
      <Textarea
        value={currentText}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="min-h-[120px] resize-none"
      />
    </div>
  );
};

export default JournalEditor;
