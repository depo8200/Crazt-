import { Bookmark, Download, Eye, FileText, Share2 } from 'lucide-react';
import { QuestionPaper } from '../../types/academic';

interface PaperCardProps {
  paper: QuestionPaper;
  isBookmarked: boolean;
  compact?: boolean;
  onPreview: (paper: QuestionPaper) => void;
  onDownload: (paper: QuestionPaper) => void;
  onShare: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
}

export function PaperCard({
  paper,
  isBookmarked,
  compact = false,
  onPreview,
  onDownload,
  onShare,
  onToggleBookmark,
}: PaperCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/50 hover:bg-[#101B30]">
      <div>
        {/* Clean unboxed top metadata line (no pill sandwiches) */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <div className="flex min-w-0 items-center gap-1.5 truncate font-mono tabular-nums">
            <span className="font-semibold text-[#60A5FA]">{paper.subjectCode}</span>
            <span aria-hidden="true">·</span>
            <span>Sem {paper.semester}</span>
            <span aria-hidden="true">·</span>
            <span>
              {paper.session} {paper.year}
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#94A3B8]">
            <FileText className="h-3.5 w-3.5 text-[#3B82F6]" />
            {paper.format}
          </span>
        </div>

        {/* Primary Subject Title */}
        <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-[#F8FAFC] transition-colors group-hover:text-white">
          <button
            type="button"
            onClick={() => onPreview(paper)}
            className="text-left focus-visible:outline-none focus-visible:underline"
          >
            {paper.subjectName}
          </button>
        </h3>

        {/* Branch & Exam Type inline metadata */}
        <p className="mt-1.5 text-xs text-[#94A3B8]">
          <span>{paper.branchName}</span>
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          <span>{paper.examType}</span>
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          <span className="font-mono tabular-nums">{paper.pages}p</span>
        </p>

        {!compact && paper.topics.length > 0 && (
          <p className="mt-3 line-clamp-1 text-xs text-[#64748B]">
            Topics: {paper.topics.join(' · ')}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#3B82F6]/12 pt-3.5">
        <button
          type="button"
          onClick={() => onPreview(paper)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDownload(paper)}
            title="Download demo sample sheet"
            aria-label={`Download sample sheet for ${paper.subjectName}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-white/5 hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onShare(paper)}
            title="Share paper"
            aria-label={`Share ${paper.subjectName}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-white/5 hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(paper)}
            title={isBookmarked ? 'Remove bookmark' : 'Save paper'}
            aria-label={isBookmarked ? `Remove ${paper.subjectName} from saved` : `Save ${paper.subjectName}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] ${
              isBookmarked
                ? 'bg-[#2563EB]/20 text-[#60A5FA]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
