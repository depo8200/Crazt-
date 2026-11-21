import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Compass, FileText } from 'lucide-react';
import { BranchCard } from '../components/common/BranchCard';
import { MotivationBanner } from '../components/common/MotivationBanner';
import { PaperCard } from '../components/common/PaperCard';
import { AVAILABLE_SEMESTERS, DEMO_BRANCHES, DEMO_SUBJECTS } from '../data/demoPapers';
import { resourceService } from '../services/resourceService';
import { SpatialVault3D } from '../three/SpatialVault3D';
import {
  BranchId,
  PageRoute,
  PaperFilterState,
  QuestionPaper,
} from '../types/academic';

interface HomePageProps {
  selectedSemester: number | null;
  displayName: string;
  bookmarkedIds: string[];
  reducedMotion: boolean;
  onNavigate: (route: PageRoute, filterPreset?: Partial<PaperFilterState>) => void;
  onPreviewPaper: (paper: QuestionPaper) => void;
  onDownloadPaper: (paper: QuestionPaper) => void;
  onSharePaper: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
}

function AnimatedStatNumber({ target, reducedMotion }: { target: number; reducedMotion: boolean }) {
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 650;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);

  return <span className="tabular-nums">{value}</span>;
}

export function HomePage({
  selectedSemester,
  displayName,
  bookmarkedIds,
  reducedMotion,
  onNavigate,
  onPreviewPaper,
  onDownloadPaper,
  onSharePaper,
  onToggleBookmark,
}: HomePageProps) {
  const stats = resourceService.getStats();
  const popularPapers = resourceService.getPopularPapers(6, selectedSemester);
  const recentPapers = resourceService.getRecentlyAddedPapers(3);

  const statItems = [
    { label: 'Total Question Papers', value: stats.totalPapers, meta: 'Sample Dataset' },
    { label: 'Available Subjects', value: stats.totalSubjects, meta: 'Sample Catalog' },
    { label: 'Available Branches', value: stats.totalBranches, meta: 'Demo Mappings' },
    { label: 'Recently Added Papers', value: stats.recentlyAddedCount, meta: 'November Demo' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Hero + Interactive 3D Knowledge Core Preview */}
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-[#3B82F6]/22 bg-[#090F1C] p-6 sm:p-8 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#60A5FA]">
              <span>
                {selectedSemester
                  ? `Active Track · Semester ${selectedSemester}`
                  : 'Active Track · All Semesters'}
              </span>
              <span className="text-[#475569]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#94A3B8]">Demo Data Prototype</span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-[42px]">
              HEY {displayName.toUpperCase()}! READY FOR YOUR COMEBACK?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
              Your academic survival starts today. Skip digging through messy folders—filter past papers by branch, semester, and subject code in seconds.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  'papers',
                  selectedSemester ? { semester: selectedSemester } : undefined
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] whitespace-nowrap"
            >
              <FileText className="h-4 w-4" />
              Explore Question Papers
            </button>

            <button
              type="button"
              onClick={() => onNavigate('subjects')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#3B82F6]/30 bg-[#0D1525] px-5 py-3 text-sm font-semibold text-[#F8FAFC] transition-colors hover:border-[#60A5FA]/60 hover:bg-[#13213D] whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4 text-[#60A5FA]" />
              Find My Subject
            </button>
          </div>
        </div>

        {/* Interactive 3D Academic Core Preview Portal */}
        <div className="lg:col-span-5">
          <SpatialVault3D
            compactPreview
            reducedMotion={reducedMotion}
            onSelectBranchPapers={(branchId: BranchId) =>
              onNavigate('papers', { branchId })
            }
            onOpenFullVault={() => onNavigate('vault-3d')}
          />
        </div>
      </section>

      {/* 4-Column Statistics Strip (Clearly marked as Sample Data) */}
      <section aria-label="Platform statistics">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statItems.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
              className="rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-5"
            >
              <p className="text-xs font-medium text-[#94A3B8]">{item.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-[#F8FAFC]">
                <AnimatedStatNumber target={item.value} reducedMotion={reducedMotion} />
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-[#64748B]">{item.meta}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rotating Motivation Banner */}
      <MotivationBanner reducedMotion={reducedMotion} />

      {/* Browse by Semester Strip */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
              Browse by Semester
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Jump directly to filtered sample question papers for any term.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('semesters')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] hover:underline whitespace-nowrap"
          >
            All Semesters <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {AVAILABLE_SEMESTERS.map((sem) => {
            const count = resourceService.getPaperCountBySemester(sem);
            const isActive = selectedSemester === sem;
            return (
              <button
                key={sem}
                type="button"
                onClick={() => onNavigate('papers', { semester: sem })}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 ${
                  isActive
                    ? 'border-[#3B82F6] bg-[#13213D]'
                    : 'border-[#3B82F6]/18 bg-[#0D1525] hover:border-[#3B82F6]/50'
                }`}
              >
                <span className="font-display text-sm font-bold text-[#F8FAFC]">
                  Sem {sem}
                </span>
                <span className="mt-1 font-mono text-[11px] tabular-nums text-[#94A3B8]">
                  {count} papers
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Question Papers */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
              Popular Question Papers
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {selectedSemester
                ? `Prioritized around Semester ${selectedSemester} · Sample catalog`
                : 'Most viewed sample papers across all engineering branches.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('papers', { sortBy: 'popular' })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] hover:underline whitespace-nowrap"
          >
            Open Full Library <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isBookmarked={bookmarkedIds.includes(paper.id)}
              onPreview={onPreviewPaper}
              onDownload={onDownloadPaper}
              onShare={onSharePaper}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>

      {/* Browse by Branch */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
              Browse by Branch
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Explore 7 demo engineering disciplines or inspect them inside the 3D Vault.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('vault-3d')}
              className="hidden items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] sm:inline-flex whitespace-nowrap"
            >
              <Compass className="h-3.5 w-3.5 text-[#60A5FA]" />
              Inspect in 3D
            </button>
            <button
              type="button"
              onClick={() => onNavigate('branches')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] hover:underline whitespace-nowrap"
            >
              All Branches <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEMO_BRANCHES.slice(0, 4).map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onSelect={(b) => onNavigate('papers', { branchId: b.id })}
            />
          ))}
        </div>
      </section>

      {/* Browse by Subject + Recently Added Split */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
              Browse by Subject
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('subjects')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] hover:underline whitespace-nowrap"
            >
              All {DEMO_SUBJECTS.length} Subjects <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEMO_SUBJECTS.slice(0, 8).map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() =>
                  onNavigate('papers', { subjectName: subject.name })
                }
                className="flex items-center justify-between gap-3 rounded-xl border border-[#3B82F6]/16 bg-[#0D1525] px-4 py-3.5 text-left transition-colors hover:border-[#3B82F6]/50 hover:bg-[#101C33]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#F8FAFC]">
                    {subject.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#94A3B8]">
                    {subject.code} · Sem {subject.typicalSemesters.join(', ')}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-[#60A5FA]">
                  {resourceService.getPaperCountBySubject(subject.name)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
              Recently Added
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('recent')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] hover:underline whitespace-nowrap"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPapers.map((paper) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => onPreviewPaper(paper)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#3B82F6]/16 bg-[#0D1525] p-4 text-left transition-colors hover:border-[#3B82F6]/50 hover:bg-[#101C33]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#F8FAFC]">
                    {paper.subjectName}
                  </p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    {paper.branchName} · Sem {paper.semester} · {paper.session}{' '}
                    {paper.year}
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] tabular-nums">
                  <div className="text-[#60A5FA]">{paper.format}</div>
                  <div className="mt-0.5 text-[#64748B]">{paper.uploadedAt}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
