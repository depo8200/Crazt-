import { Bookmark, Download, Eye, FileText, Share2 } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { QuestionPaper } from '../types/academic';

interface RecentlyAddedPageProps {
  bookmarkedIds: string[];
  onPreviewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  onSharePaper: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
}

export function RecentlyAddedPage({
  bookmarkedIds,
  onPreviewPaper,
  onDownloadPaper,
  onSharePaper,
  onToggleBookmark,
}: RecentlyAddedPageProps) {
  const recentPapers = resourceService.getRecentlyAddedPapers(18);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-[#60A5FA]">
          Fresh Uploads · Sample Records
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
          Recently Added Resources
        </h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Latest sample question papers ordered by prototype upload date. Clearly labeled as demo data until live Drive syncing is enabled.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525]">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#3B82F6]/15 bg-[#090F1C] text-xs font-semibold text-[#94A3B8]">
              <th className="px-5 py-3.5">Resource Title</th>
              <th className="px-4 py-3.5">Branch</th>
              <th className="px-4 py-3.5">Semester</th>
              <th className="px-4 py-3.5">Format</th>
              <th className="px-4 py-3.5">Demo Upload Date</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3B82F6]/10">
            {recentPapers.map((paper) => {
              const saved = bookmarkedIds.includes(paper.id);
              return (
                <tr
                  key={paper.id}
                  className="transition-colors hover:bg-[#101C33]/80"
                >
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => onPreviewPaper(paper)}
                      className="text-left font-medium text-[#F8FAFC] hover:text-[#60A5FA]"
                    >
                      {paper.title}
                    </button>
                    <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                      {paper.subjectCode} · Sample Record
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#CBD5E1]">
                    {paper.branchName}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#CBD5E1]">
                    Sem {paper.semester}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#60A5FA]">
                      <FileText className="h-3.5 w-3.5" />
                      {paper.format}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#94A3B8]">
                    {paper.uploadedAt}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onPreviewPaper(paper)}
                        title="Preview"
                        aria-label={`Preview ${paper.title}`}
                        className="rounded-lg p-2 text-[#CBD5E1] hover:bg-[#2563EB]/20 hover:text-[#60A5FA]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPaper(paper)}
                        title="Download sample"
                        aria-label={`Download ${paper.title}`}
                        className="rounded-lg p-2 text-[#94A3B8] hover:bg-white/5 hover:text-white"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSharePaper(paper)}
                        title="Share"
                        aria-label={`Share ${paper.title}`}
                        className="rounded-lg p-2 text-[#94A3B8] hover:bg-white/5 hover:text-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(paper)}
                        title={saved ? 'Remove bookmark' : 'Save'}
                        aria-label={saved ? `Unsave ${paper.title}` : `Save ${paper.title}`}
                        className={`rounded-lg p-2 ${
                          saved
                            ? 'text-[#60A5FA]'
                            : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
