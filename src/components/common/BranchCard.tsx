import { ArrowUpRight } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { BranchInfo } from '../../types/academic';

interface BranchCardProps {
  branch: BranchInfo;
  onSelect: (branch: BranchInfo) => void;
}

export function BranchCard({ branch, onSelect }: BranchCardProps) {
  const paperCount = resourceService.getPaperCountByBranch(branch.id);
  const subjectCount = resourceService.getSubjectCountByBranch(branch.id);

  return (
    <button
      type="button"
      onClick={() => onSelect(branch)}
      className="group flex flex-col justify-between rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/55 hover:bg-[#101C33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-[#60A5FA]">
            {branch.shortCode}
          </span>
          <ArrowUpRight className="h-4 w-4 text-[#64748B] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#60A5FA]" />
        </div>

        <h3 className="mt-3 font-display text-lg font-bold text-[#F8FAFC]">
          {branch.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
          {branch.description}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-[#3B82F6]/12 pt-3 font-mono text-xs tabular-nums text-[#CBD5E1]">
        <span>{paperCount} Papers</span>
        <span className="text-[#475569]" aria-hidden="true">
          ·
        </span>
        <span>{subjectCount} Subjects</span>
        <span className="text-[#475569]" aria-hidden="true">
          ·
        </span>
        <span className="text-[#64748B]">Demo</span>
      </div>
    </button>
  );
}
