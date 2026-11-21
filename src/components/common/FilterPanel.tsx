import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  AVAILABLE_SEMESTERS,
  AVAILABLE_YEARS,
  DEMO_BRANCHES,
} from '../../data/demoPapers';
import {
  BranchId,
  ExamSession,
  ExamType,
  PaperFilterState,
} from '../../types/academic';

interface FilterPanelProps {
  filters: PaperFilterState;
  onChange: (patch: Partial<PaperFilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  totalResults,
}: FilterPanelProps) {
  const hasActiveFilters =
    filters.branchId !== 'all' ||
    filters.semester !== 'all' ||
    filters.year !== 'all' ||
    filters.session !== 'all' ||
    filters.examType !== 'all' ||
    filters.subjectName !== 'all' ||
    filters.search.trim().length > 0;

  return (
    <div className="rounded-2xl border border-[#3B82F6]/18 bg-[#090F1C] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
          <SlidersHorizontal className="h-4 w-4 text-[#60A5FA]" />
          <span>Filter &amp; Sort</span>
          <span className="text-xs font-normal text-[#64748B]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-xs font-normal tabular-nums text-[#94A3B8]">
            {totalResults} demo {totalResults === 1 ? 'paper' : 'papers'}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#60A5FA] transition-colors hover:bg-[#2563EB]/15 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Branch */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Branch</span>
          <select
            value={filters.branchId}
            onChange={(e) =>
              onChange({ branchId: e.target.value as BranchId | 'all' })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="all">All Branches</option>
            {DEMO_BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        {/* Semester */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Semester</span>
          <select
            value={filters.semester === 'all' ? 'all' : String(filters.semester)}
            onChange={(e) =>
              onChange({
                semester: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {AVAILABLE_SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </label>

        {/* Exam Year */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Exam Year</span>
          <select
            value={filters.year === 'all' ? 'all' : String(filters.year)}
            onChange={(e) =>
              onChange({
                year: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="all">All Years</option>
            {AVAILABLE_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </label>

        {/* Session */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Session</span>
          <select
            value={filters.session}
            onChange={(e) =>
              onChange({ session: e.target.value as ExamSession | 'all' })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="all">Summer &amp; Winter</option>
            <option value="Winter">Winter</option>
            <option value="Summer">Summer</option>
          </select>
        </label>

        {/* Exam Type */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Exam Type</span>
          <select
            value={filters.examType}
            onChange={(e) =>
              onChange({ examType: e.target.value as ExamType | 'all' })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="End Semester">End Semester</option>
            <option value="Mid Semester">Mid Semester</option>
            <option value="Supplementary">Supplementary</option>
          </select>
        </label>

        {/* Sort */}
        <label className="flex flex-col gap-1.5 text-xs text-[#94A3B8]">
          <span>Sort By</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                sortBy: e.target.value as PaperFilterState['sortBy'],
              })
            }
            className="rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
            <option value="popular">Most Popular</option>
          </select>
        </label>
      </div>
    </div>
  );
}
