import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';
import { FilterPanel } from '../components/common/FilterPanel';
import { PaperCard } from '../components/common/PaperCard';
import { SearchBar } from '../components/common/SearchBar';
import { resourceService } from '../services/resourceService';
import { PaperFilterState, QuestionPaper } from '../types/academic';

interface QuestionPapersPageProps {
  filters: PaperFilterState;
  bookmarkedIds: string[];
  compactCards: boolean;
  onChangeFilters: (patch: Partial<PaperFilterState>) => void;
  onResetFilters: () => void;
  onPreviewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  onSharePaper: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
}

const PAGE_SIZE = 9;

export function QuestionPapersPage({
  filters,
  bookmarkedIds,
  compactCards,
  onChangeFilters,
  onResetFilters,
  onPreviewPaper,
  onDownloadPaper,
  onSharePaper,
  onToggleBookmark,
}: QuestionPapersPageProps) {
  const [page, setPage] = useState(1);

  const results = useMemo(() => resourceService.queryPapers(filters), [filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const visiblePapers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs text-[#60A5FA]">
            Question Paper Library · Demo Data
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            University Question Papers
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Search by subject name or code, filter across branches and semesters, and preview sample layouts.
          </p>
        </div>

        <SearchBar
          value={filters.search}
          onChange={(val) => onChangeFilters({ search: val })}
          className="w-full sm:w-80 lg:w-96"
        />
      </div>

      {filters.subjectName !== 'all' && (
        <div className="flex items-center justify-between rounded-xl border border-[#3B82F6]/30 bg-[#13213D]/70 px-4 py-2.5 text-xs">
          <span className="text-[#CBD5E1]">
            Filtered by subject:{' '}
            <strong className="font-semibold text-[#F8FAFC]">{filters.subjectName}</strong>
          </span>
          <button
            type="button"
            onClick={() => onChangeFilters({ subjectName: 'all' })}
            className="font-semibold text-[#60A5FA] hover:underline"
          >
            Clear subject filter
          </button>
        </div>
      )}

      <FilterPanel
        filters={filters}
        onChange={onChangeFilters}
        onReset={onResetFilters}
        totalResults={results.length}
      />

      {visiblePapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#3B82F6]/18 bg-[#090F1C] px-6 py-16 text-center">
          <FileSearch className="h-10 w-10 text-[#60A5FA]" />
          <h2 className="mt-4 font-display text-lg font-bold text-[#F8FAFC]">
            No matching sample papers found
          </h2>
          <p className="mt-1 max-w-md text-sm text-[#94A3B8]">
            Try clearing one of your active filters or searching a different subject code like CS301, IT402, or AI604.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                compact={compactCards}
                isBookmarked={bookmarkedIds.includes(paper.id)}
                onPreview={onPreviewPaper}
                onDownload={onDownloadPaper}
                onShare={onSharePaper}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#3B82F6]/14 pt-5">
              <p className="font-mono text-xs tabular-nums text-[#94A3B8]">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, results.length)} of {results.length} sample papers
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg font-mono text-xs tabular-nums transition-colors ${
                      p === page
                        ? 'bg-[#2563EB] font-semibold text-white'
                        : 'border border-[#3B82F6]/15 bg-[#0D1525] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
