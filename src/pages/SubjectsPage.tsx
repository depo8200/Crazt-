import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar';
import { DEMO_BRANCHES, DEMO_SUBJECTS } from '../data/demoPapers';
import { resourceService } from '../services/resourceService';
import { BranchId } from '../types/academic';

interface SubjectsPageProps {
  onSelectSubject: (subjectName: string) => void;
}

export function SubjectsPage({ onSelectSubject }: SubjectsPageProps) {
  const [query, setQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<BranchId | 'all'>('all');

  const filteredSubjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_SUBJECTS.filter((s) => {
      if (branchFilter !== 'all' && !s.branchIds.includes(branchFilter)) {
        return false;
      }
      if (q) {
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, branchFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs text-[#60A5FA]">
            Subject Directory · Demo Catalog
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
            Find Your Subject
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Explore demo subject codes and open all matching question papers with one click.
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search subject name or code..."
          className="w-full sm:w-80"
        />
      </div>

      {/* Interactive Branch Filter Segmented Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#3B82F6]/16 bg-[#090F1C] p-1.5">
        <button
          type="button"
          onClick={() => setBranchFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            branchFilter === 'all'
              ? 'bg-[#2563EB] text-white'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          All Branches
        </button>
        {DEMO_BRANCHES.map((branch) => (
          <button
            key={branch.id}
            type="button"
            onClick={() => setBranchFilter(branch.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              branchFilter === branch.id
                ? 'bg-[#2563EB] text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {branch.shortCode}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSubjects.map((subject) => {
          const paperCount = resourceService.getPaperCountBySubject(subject.name);
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSelectSubject(subject.name)}
              className="group flex flex-col justify-between rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#3B82F6]/55 hover:bg-[#101C33]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#60A5FA]">
                    {subject.code} · {subject.credits} Credits
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#64748B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#60A5FA]" />
                </div>

                <h2 className="mt-2.5 font-display text-lg font-bold text-[#F8FAFC]">
                  {subject.name}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">
                  {subject.summary}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#3B82F6]/12 pt-3 font-mono text-xs tabular-nums text-[#CBD5E1]">
                <span>Sem {subject.typicalSemesters.join(', ')}</span>
                <span className="text-[#60A5FA]">{paperCount} sample papers</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
