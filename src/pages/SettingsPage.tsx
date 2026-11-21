import { Play, RotateCcw, Trash2 } from 'lucide-react';
import { SemesterSelector } from '../components/common/SemesterSelector';
import { resourceService } from '../services/resourceService';
import { UserPreferences } from '../types/academic';

interface SettingsPageProps {
  prefs: UserPreferences;
  savedCount: number;
  onUpdatePrefs: (patch: Partial<UserPreferences>) => void;
  onReplayIntro: () => void;
  onClearBookmarks: () => void;
  onResetAll: () => void;
}

export function SettingsPage({
  prefs,
  savedCount,
  onUpdatePrefs,
  onReplayIntro,
  onClearBookmarks,
  onResetAll,
}: SettingsPageProps) {
  const status = resourceService.getDataSourceStatus();

  const handleNameChange = (name: string) => {
    const clean = name.slice(0, 24);
    const derivedInitials =
      clean
        .trim()
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || 'ST';
    onUpdatePrefs({ displayName: clean, initials: derivedInitials });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="font-mono text-xs text-[#60A5FA]">
          Preferences &amp; Prototype Controls
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Customize your active semester, replay the 3-stage onboarding animation, or adjust accessibility settings.
        </p>
      </div>

      {/* Profile Identity (Abstract Gradient Avatar, No Photo) */}
      <section className="rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-6">
        <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
          Student Profile
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Stored locally in your browser. Used for dashboard greetings and your abstract initials badge.
        </p>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#60A5FA]/40 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F172A] font-display text-xl font-extrabold text-white">
            {prefs.initials}
          </div>

          <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
            <span>Display Name</span>
            <input
              type="text"
              value={prefs.displayName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Dude"
              className="max-w-sm rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
            />
          </label>
        </div>
      </section>

      {/* Active Semester */}
      <section className="rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-6">
        <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
          Active Semester
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Personalizes your welcome hero CTA and prioritizes popular papers for your term.
        </p>

        <div className="mt-4">
          <SemesterSelector
            selectedSemester={prefs.selectedSemester}
            onSelect={(sem) => onUpdatePrefs({ selectedSemester: sem })}
            reducedMotion={prefs.reducedMotionOverride}
          />
        </div>
      </section>

      {/* Experience & Accessibility */}
      <section className="space-y-4 rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-6">
        <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
          Experience &amp; Accessibility
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3B82F6]/12 pb-4">
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              Replay 3-Stage Intro Experience
            </p>
            <p className="text-xs text-[#94A3B8]">
              Re-watch the Brand Intro, Semester Selection, and Reality Check sequence.
            </p>
          </div>
          <button
            type="button"
            onClick={onReplayIntro}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Replay Intro
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-[#3B82F6]/12 pb-4">
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              Reduced Motion Mode
            </p>
            <p className="text-xs text-[#94A3B8]">
              Tones down kinetic transitions and slows 3D orbital motion (system setting is always respected automatically).
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.reducedMotionOverride}
            onClick={() =>
              onUpdatePrefs({ reducedMotionOverride: !prefs.reducedMotionOverride })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              prefs.reducedMotionOverride ? 'bg-[#2563EB]' : 'bg-[#1E293B]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.reducedMotionOverride ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              Compact Paper Cards
            </p>
            <p className="text-xs text-[#94A3B8]">
              Hide topic preview lines on library cards for higher vertical scanning density.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.compactCards}
            onClick={() => onUpdatePrefs({ compactCards: !prefs.compactCards })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              prefs.compactCards ? 'bg-[#2563EB]' : 'bg-[#1E293B]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.compactCards ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Data Architecture Status & Local Storage Management */}
      <section className="rounded-2xl border border-[#3B82F6]/18 bg-[#090F1C] p-6">
        <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
          Data Layer &amp; Local Storage
        </h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-xl border border-[#3B82F6]/14 bg-[#0D1525] p-3.5">
            <dt className="text-[#64748B]">Active Data Source</dt>
            <dd className="mt-1 font-mono font-semibold text-[#60A5FA]">
              {status.label} (Local Prototype)
            </dd>
          </div>
          <div className="rounded-xl border border-[#3B82F6]/14 bg-[#0D1525] p-3.5">
            <dt className="text-[#64748B]">Supabase Adapter</dt>
            <dd className="mt-1 font-mono text-[#94A3B8]">Not Connected (Ready)</dd>
          </div>
          <div className="rounded-xl border border-[#3B82F6]/14 bg-[#0D1525] p-3.5">
            <dt className="text-[#64748B]">Google Drive PDFs</dt>
            <dd className="mt-1 font-mono text-[#94A3B8]">Not Connected (Ready)</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={savedCount === 0}
            onClick={onClearBookmarks}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#3B82F6]/20 bg-[#0D1525] px-4 py-2 text-xs font-semibold text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/50 hover:text-white disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Saved Papers ({savedCount})
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Local Preferences
          </button>
        </div>
      </section>
    </div>
  );
}
