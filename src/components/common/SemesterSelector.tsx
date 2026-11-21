import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { AVAILABLE_SEMESTERS } from '../../data/demoPapers';
import { resourceService } from '../../services/resourceService';

interface SemesterSelectorProps {
  selectedSemester: number | null;
  onSelect: (semester: number) => void;
  reducedMotion?: boolean;
  showCounts?: boolean;
  overWebGL?: boolean;
}

export function SemesterSelector({
  selectedSemester,
  onSelect,
  reducedMotion = false,
  showCounts = false,
  overWebGL = false,
}: SemesterSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {AVAILABLE_SEMESTERS.map((sem, index) => {
        const isSelected = selectedSemester === sem;
        const count = showCounts ? resourceService.getPaperCountBySemester(sem) : null;

        return (
          <motion.button
            key={sem}
            type="button"
            initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.32,
              delay: reducedMotion ? 0 : index * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onSelect(sem)}
            className={`group relative flex min-h-[84px] flex-col items-start justify-between rounded-2xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] ${
              overWebGL ? 'webgl-hud-surface' : 'bg-[#0D1525] border'
            } ${
              isSelected
                ? 'border-[#3B82F6] bg-[#13213D] electric-ring'
                : 'border-[#3B82F6]/20 hover:border-[#60A5FA]/70 hover:bg-[#101C33]'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-mono text-xs tabular-nums text-[#60A5FA]">
                0{sem}
              </span>
              {isSelected && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </div>

            <div className="mt-2">
              <div className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
                Semester {sem}
              </div>
              {count !== null && (
                <div className="mt-0.5 font-mono text-xs tabular-nums text-[#94A3B8]">
                  {count} sample papers
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
