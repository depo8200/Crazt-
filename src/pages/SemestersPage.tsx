import { ArrowUpRight, Check } from 'lucide-react';
import { AVAILABLE_SEMESTERS } from '../data/demoPapers';
import { resourceService } from '../services/resourceService';

interface SemestersPageProps {
  selectedSemester: number | null;
  onSetActiveSemester: (sem: number) => void;
  onBrowseSemester: (sem: number) => void;
}

const SEMESTER_NOTES: Record<number, string> = {
  1: 'Foundation math and introductory C programming (Demo).',
  2: 'Core engineering math, calculus, and procedural problem solving (Demo).',
  3: 'Data structures, thermodynamics, and branch fundamentals (Demo).',
  4: 'Operating systems, DBMS, and core structural mechanics (Demo).',
  5: 'Computer networks, software engineering, and power systems (Demo).',
  6: 'Artificial intelligence, machine learning, and DSP tracks (Demo).',
  7: 'Advanced ML, embedded systems, and domain electives (Demo).',
  8: 'Capstone systems, MLOps, and final-term engineering (Demo).',
};

export function SemestersPage({
  selectedSemester,
  onSetActiveSemester,
  onBrowseSemester,
}: SemestersPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-[#60A5FA]">
          Academic Timeline · Demo Mappings
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
          Semesters 1 to 8
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
          Jump straight into any semester&apos;s sample question paper set, or update your active semester to personalize the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AVAILABLE_SEMESTERS.map((sem) => {
          const isCurrent = selectedSemester === sem;
          const paperCount = resourceService.getPaperCountBySemester(sem);

          return (
            <div
              key={sem}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-colors ${
                isCurrent
                  ? 'border-[#3B82F6] bg-[#13213D]/70 electric-ring'
                  : 'border-[#3B82F6]/18 bg-[#0D1525]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#60A5FA]">
                    TERM 0{sem}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#60A5FA]">
                      <Check className="h-3.5 w-3.5" /> Active
                    </span>
                  )}
                </div>

                <h2 className="mt-2 font-display text-xl font-bold text-[#F8FAFC]">
                  Semester {sem}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">
                  {SEMESTER_NOTES[sem]}
                </p>
              </div>

              <div className="mt-5 space-y-2.5 border-t border-[#3B82F6]/12 pt-4">
                <p className="font-mono text-xs tabular-nums text-[#CBD5E1]">
                  {paperCount} sample papers indexed
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onBrowseSemester(sem)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] whitespace-nowrap"
                  >
                    Browse Papers
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => onSetActiveSemester(sem)}
                      className="rounded-xl border border-[#3B82F6]/25 bg-[#090F1C] px-3 py-2 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 hover:text-white whitespace-nowrap"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
