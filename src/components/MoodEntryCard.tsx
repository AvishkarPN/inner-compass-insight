
import React, { useState } from 'react';
import { MoodEntry, MoodType } from '@/types/mood';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useMood } from '@/contexts/MoodContext';
import { MOOD_COLORS, MOOD_LABELS, MOOD_EMOJIS } from '@/constants/moodColors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import VoiceRecorder from './VoiceRecorder';

interface MoodEntryCardProps {
  entry: MoodEntry;
  highlight?: string;
  /** If true, the delete button is shown on the card footer (dashboard view).
   *  If false (default), delete is only accessible inside the detail sheet. */
  showDeleteOnCard?: boolean;
}

// B1 + A3: MoodEntryCard now:
//   - Highlights search text (#34 fix: proper ReactNode return, not cast)
//   - Clicking the card body opens a detail sheet with full text
//   - Edit mode lets user change mood and text, saved via updateMoodEntry
//   - Delete triggers an AlertDialog for confirmation (#3, #42)

const MoodEntryCard: React.FC<MoodEntryCardProps> = ({
  entry,
  highlight,
  showDeleteOnCard = false,
}) => {
  const { deleteMoodEntry, updateMoodEntry } = useMood();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMood, setEditMood] = useState<MoodType>(entry.mood);
  const [editText, setEditText] = useState(entry.journalText);

  const moodColor = MOOD_COLORS[entry.mood] ?? '#94a3b8';

  // #34 fix: return ReactNode directly, no `as unknown as string` cast
  const highlightText = (text: string): React.ReactNode => {
    const q = (highlight || '').trim().toLowerCase();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const handleConfirmDelete = () => {
    deleteMoodEntry(entry.id);
    setDeleteDialogOpen(false);
    setSheetOpen(false);
    // A11: set session flag so notification doesn't re-fire this session
    sessionStorage.setItem('notificationDismissed', 'true');
  };

  const handleSaveEdit = () => {
    updateMoodEntry(entry.id, { mood: editMood, journalText: editText });
    setIsEditing(false);
    setSheetOpen(false);
  };

  const handleCancelEdit = () => {
    setEditMood(entry.mood);
    setEditText(entry.journalText);
    setIsEditing(false);
  };

  const MOOD_ORDER: MoodType[] = ['angry', 'energetic', 'happy', 'sad', 'calm', 'anxious'];

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────── */}
      <Card
        className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={() => setSheetOpen(true)}
        tabIndex={0}
        role="button"
        aria-label={`${MOOD_LABELS[entry.mood]} entry — click to view details`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSheetOpen(true); }}
      >
        {/* Colour accent bar at top */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: moodColor }} />

        <CardContent className="pt-5 pb-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColor }} />
              <span aria-hidden="true">{MOOD_EMOJIS[entry.mood]}</span>
              <h3 className="font-medium capitalize">{MOOD_LABELS[entry.mood]}</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
            </span>
          </div>

          {/* Truncated preview */}
          <div className="text-sm mt-2 text-muted-foreground line-clamp-3">
            {entry.journalText
              ? highlightText(entry.journalText)
              : <em>No journal entry</em>}
          </div>
        </CardContent>

        <CardFooter className="pt-0 justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(entry.timestamp).toLocaleString()}
          </span>
          {showDeleteOnCard && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete ${MOOD_LABELS[entry.mood]} entry`}
              onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
              className="text-xs h-7 px-2 text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* ── Detail / Edit Sheet ─────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => {
        if (!open) { setIsEditing(false); setEditMood(entry.mood); setEditText(entry.journalText); }
        setSheetOpen(open);
      }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {isEditing ? 'Edit Entry' : 'Entry Details'}
            </SheetTitle>
          </SheetHeader>

          {isEditing ? (
            <div className="space-y-4">
              {/* Mood picker */}
              <div>
                <p className="text-sm font-medium mb-2">Mood</p>
                <div className="grid grid-cols-3 gap-2">
                  {MOOD_ORDER.map(mood => (
                    <button
                      key={mood}
                      aria-label={MOOD_LABELS[mood]}
                      aria-pressed={editMood === mood}
                      onClick={() => setEditMood(mood)}
                      className="rounded-lg p-2 flex flex-col items-center gap-1 text-xs font-semibold text-white transition-all"
                      style={{
                        backgroundColor: MOOD_COLORS[mood],
                        outline: editMood === mood ? '2px solid #1e3a8a' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      <span aria-hidden="true">{MOOD_EMOJIS[mood]}</span>
                      {MOOD_LABELS[mood]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal text */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Journal Entry</p>
                  <VoiceRecorder onTranscript={(text) => setEditText(prev => prev + (prev ? ' ' : '') + text)} />
                </div>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={8}
                  className="resize-none"
                  placeholder="Write about your day..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: `${moodColor}20` }}>
                <span className="text-3xl">{MOOD_EMOJIS[entry.mood]}</span>
                <div>
                  <p className="font-semibold text-lg">{MOOD_LABELS[entry.mood]}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] p-3 rounded-lg bg-muted/30">
                {entry.journalText || <em className="text-muted-foreground">No journal entry written.</em>}
              </div>
            </div>
          )}

          <SheetFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancelEdit} variant="outline" className="w-full sm:w-auto">Cancel</Button>
                <Button onClick={handleSaveEdit} className="w-full sm:w-auto">Save Changes</Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  aria-label="Delete this entry"
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Edit
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog (A3 / #3, #42) ──────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your <strong>{MOOD_LABELS[entry.mood]}</strong> entry
              from <strong>{new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MoodEntryCard;
