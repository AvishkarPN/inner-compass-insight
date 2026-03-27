
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Share2, Copy, Download, Twitter, Facebook, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SocialShareProps {
  /** Title shown in share dialogs */
  title?: string;
  /** Summary text to share */
  text?: string;
  /** URL to share (defaults to current page) */
  url?: string;
  /** Optional canvas ref to grab a screenshot from */
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  /** Trigger button label */
  label?: string;
  /** Trigger button variant */
  variant?: 'default' | 'outline' | 'ghost';
}

// Feature 12: Reusable social sharing component
const SocialShare: React.FC<SocialShareProps> = ({
  title = 'My Mind Garden',
  text = 'Check out my mood tracking journey on Mind Garden!',
  url,
  canvasRef,
  label = 'Share',
  variant = 'outline',
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  // Web Share API (mobile native share sheet)
  const handleNativeShare = async () => {
    const shareData: ShareData = { title, text, url: shareUrl };

    // Optionally attach canvas image
    if (canvasRef?.current && navigator.canShare) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'mood-canvas.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ title, text, files: [file] });
              return;
            }
          }
          await navigator.share(shareData);
        }, 'image/png');
        return;
      } catch (_) {
        // Fall through to regular share
      }
    }

    try {
      await navigator.share(shareData);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setOpen(true); // Fall back to dialog
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: '🔗 Link copied!', description: 'Paste it anywhere to share.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Select and copy the URL manually.', variant: 'destructive' });
    }
  };

  const handleDownloadCanvas = () => {
    if (!canvasRef?.current) return;
    const link = document.createElement('a');
    link.download = 'mood-canvas.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast({ title: '💾 Image downloaded!', description: 'mood-canvas.png saved to your device.' });
  };

  const shareLinks: { label: string; icon: React.ReactNode; href: string; color: string }[] = [
    {
      label: 'Twitter / X',
      icon: <Twitter size={16} aria-hidden="true" />,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-black hover:bg-gray-800 text-white',
    },
    {
      label: 'Facebook',
      icon: <Facebook size={16} aria-hidden="true" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      label: 'WhatsApp',
      icon: <span className="text-sm" aria-hidden="true">💬</span>,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-green-500 hover:bg-green-600 text-white',
    },
  ];

  // Use native share on supported browsers; dialog fallback otherwise
  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        className="flex items-center gap-2"
        onClick={supportsNativeShare ? handleNativeShare : () => setOpen(true)}
        aria-label="Share this page"
      >
        <Share2 size={15} aria-hidden="true" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 size={18} aria-hidden="true" />
              Share
            </DialogTitle>
            <DialogDescription>Choose how you'd like to share your mind garden</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {/* Social links */}
            <div className="grid gap-2">
              {shareLinks.map(({ label: lbl, icon, href, color }) => (
                <a
                  key={lbl}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${color}`}
                  onClick={() => setOpen(false)}
                >
                  {icon}
                  {lbl}
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 border-t" />
              or
              <div className="flex-1 border-t" />
            </div>

            {/* Copy link */}
            <Button variant="outline" className="w-full gap-2" onClick={handleCopyLink}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {copied ? 'Copied!' : 'Copy link'}
            </Button>

            {/* Download canvas if available */}
            {canvasRef && (
              <Button variant="secondary" className="w-full gap-2" onClick={handleDownloadCanvas}>
                <Download size={15} aria-hidden="true" />
                Download as image
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialShare;
