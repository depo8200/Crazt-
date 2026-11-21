import { useState } from 'react';
import { Check, Copy, ExternalLink, Share2, X } from 'lucide-react';
import { QuestionPaper } from '../../types/academic';

interface ShareModalProps {
  paper: QuestionPaper | null;
  onClose: () => void;
  onNotify: (message: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function ShareModal({ paper, onClose, onNotify }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const shareText = `Check out this sample question paper on CRAZY!: ${paper.subjectName} (${paper.subjectCode}) — ${paper.session} ${paper.year}, Semester ${paper.semester} (${paper.branchName})`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${paper.demoUrl}`
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paper.demoUrl);
      setCopied(true);
      onNotify('Demo paper link copied to clipboard.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('Could not access clipboard. Select and copy the URL manually.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CRAZY! — ${paper.subjectName}`,
          text: shareText,
          url: paper.demoUrl,
        });
        onNotify('Shared via native share sheet.', 'success');
      } catch {
        // User dismissed share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#3B82F6]/30 bg-[#0D1525] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-[#60A5FA]">
              {paper.subjectCode} · Prototype Share Link
            </p>
            <h3
              id="share-modal-title"
              className="mt-1 font-display text-lg font-bold text-[#F8FAFC]"
            >
              Share {paper.subjectName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
          {paper.branchName} · Semester {paper.semester} · {paper.session} {paper.year}
        </p>

        {/* Stable Demo URL preview */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#3B82F6]/20 bg-[#05070D] p-2">
          <input
            type="text"
            readOnly
            value={paper.demoUrl}
            aria-label="Stable demo paper link"
            className="min-w-0 flex-1 bg-transparent px-2 font-mono text-xs text-[#CBD5E1] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] whitespace-nowrap"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3B82F6]/25 bg-[#090F1C] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#3B82F6]/60 hover:bg-[#13213D] whitespace-nowrap"
          >
            <Share2 className="h-4 w-4 text-[#60A5FA]" />
            {typeof navigator !== 'undefined' && 'share' in navigator
              ? 'Native Share'
              : 'Copy Share Link'}
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onNotify('Opened WhatsApp share link.', 'info')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4" />
            Share on WhatsApp
          </a>
        </div>

        <p className="mt-4 text-[11px] text-[#64748B]">
          Prototype note: Uses stable demo URLs until backend document hosting is connected.
        </p>
      </div>
    </div>
  );
}
