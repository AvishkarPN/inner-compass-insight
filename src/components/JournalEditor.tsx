
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import VoiceRecorder from './VoiceRecorder';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getDailyPrompt, JOURNAL_PROMPTS } from '@/utils/journalPrompts';

interface JournalEditorProps {
  value?: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  onSave?: (text: string) => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write about your thoughts, feelings, or experiences...',
  onSave
}) => {
  const [internalText, setInternalText] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % JOURNAL_PROMPTS.length;
  });

  const currentText = value !== undefined ? value : internalText;
  const dailyPrompt = JOURNAL_PROMPTS[currentPromptIndex];

  const updateText = (newText: string) => {
    if (onChange) onChange(newText);
    else setInternalText(newText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateText(e.target.value);
  };

  const handleVoiceTranscript = (transcript: string) => {
    const newText = currentText + (currentText ? ' ' : '') + transcript;
    updateText(newText);
  };

  const handleUsePrompt = () => {
    const prefix = dailyPrompt + '\n\n';
    if (!currentText.startsWith(dailyPrompt)) {
      updateText(prefix + currentText);
    }
    setShowPrompts(false);
  };

  const handleShufflePrompt = () => {
    setCurrentPromptIndex(prev => (prev + 1) % JOURNAL_PROMPTS.length);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentText);
      if (value === undefined) setInternalText('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Feature 2: Guided prompts */}
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPrompts(!showPrompts)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-expanded={showPrompts}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} aria-hidden="true" />
            Today's prompt
          </span>
          {showPrompts ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
        </button>

        {showPrompts && (
          <div className="px-3 pb-3 space-y-2">
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              "{dailyPrompt}"
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                className="text-xs h-7"
                onClick={handleUsePrompt}
              >
                Use this prompt
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs h-7 gap-1"
                onClick={handleShufflePrompt}
                aria-label="Next prompt"
              >
                <RefreshCw size={11} aria-hidden="true" />
                Another
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor row */}
      <div className="flex justify-between items-center">
        <VoiceRecorder onTranscript={handleVoiceTranscript} />
        <span className="text-xs text-muted-foreground">{currentText.length > 0 ? `${currentText.split(/\s+/).filter(Boolean).length} words` : ''}</span>
      </div>

      <Textarea
        value={currentText}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="min-h-[120px] resize-none"
        aria-label="Journal entry text"
      />
    </div>
  );
};

export default JournalEditor;
