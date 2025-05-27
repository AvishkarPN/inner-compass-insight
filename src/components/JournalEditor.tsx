
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

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
