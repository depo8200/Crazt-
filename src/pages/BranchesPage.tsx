import { Box } from 'lucide-react';
import { BranchCard } from '../components/common/BranchCard';
import { DEMO_BRANCHES } from '../data/demoPapers';
import { BranchId } from '../types/academic';

interface BranchesPageProps {
  onSelectBranch: (branchId: BranchId) => void;
  onOpen3DVault: () => void;
}

export function BranchesPage({
  onSelectBranch,
  onOpen3DVault,
}: BranchesPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-[#60A5FA]">
            Engineering Disciplines · Demo Content
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            Browse by Branch
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
            Select any engineering branch below to view filtered sample question papers. All branch-to-subject mappings are prototype demo content.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen3DVault}
          className="inline-flex items-center gap-2 rounded-xl border border-[#3B82F6]/30 bg-[#0D1525] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#60A5FA]/60 hover:bg-[#13213D] whitespace-nowrap"
        >
          <Box className="h-4 w-4 text-[#60A5FA]" />
          Explore Branches in 3D
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_BRANCHES.map((branch) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            onSelect={(b) => onSelectBranch(b.id)}
          />
        ))}
      </div>
    </div>
  );
}
