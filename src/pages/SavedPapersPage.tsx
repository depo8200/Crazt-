import { Bookmark, Trash2 } from 'lucide-react';
import { PaperCard } from '../components/common/PaperCard';
import { resourceService } from '../services/resourceService';
import { QuestionPaper } from '../types/academic';

interface SavedPapersPageProps {
  bookmarkedIds: string[];
  onPreviewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  onSharePaper: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
  onClearAllBookmarks: () => void;
  onExplorePapers: () => void;
}

export function SavedPapersPage({
  bookmarkedIds,
  onPreviewPaper,
  onDownloadPaper,
  onSharePaper,
  onToggleBookmark,
  onClearAllBookmarks,
  onExplorePapers,
}: SavedPapersPageProps) {
  const savedPapers = bookmarkedIds
    .map((id) => resourceService.getPaperById(id))
    .filter((p): p is QuestionPaper => Boolean(p));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-[#60A5FA]">
            Local Bookmarks · Stored in Browser
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            Saved Papers
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Quick access to the sample question papers you bookmarked for revision.
          </p>
        </div>

        {savedPapers.length > 0 && (
          <button
            type="button"
            onClick={onClearAllBookmarks}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 whitespace-nowrap"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All Saved
          </button>
        )}
      </div>

      {savedPapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#3B82F6]/18 bg-[#090F1C] px-6 py-16 text-center">
          <Bookmark className="h-10 w-10 text-[#60A5FA]" />
          <h2 className="mt-4 font-display text-lg font-bold text-[#F8FAFC]">
            No saved papers yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-[#94A3B8]">
            Hit the bookmark icon on any question paper card or inside the document viewer to build your personal revision queue.
          </p>
          <button
            type="button"
            onClick={onExplorePapers}
            className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6]"
          >
            Explore Question Papers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isBookmarked
              onPreview={onPreviewPaper}
              onDownload={onDownloadPaper}
              onShare={onSharePaper}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
