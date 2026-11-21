import { ChangeEvent, FormEvent, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import { AVAILABLE_SEMESTERS, DEMO_BRANCHES } from '../data/demoPapers';
import {
  BranchId,
  ContributionDraft,
  ExamSession,
  ExamType,
} from '../types/academic';

interface ContributePageProps {
  onNotify: (message: string, tone?: 'info' | 'success' | 'warning') => void;
}

const INITIAL_DRAFT: ContributionDraft = {
  title: '',
  branchId: '',
  semester: '',
  subjectName: '',
  subjectCode: '',
  year: 2025,
  session: '',
  examType: 'End Semester',
  fileName: '',
  fileSizeKb: 0,
};

export function ContributePage({ onNotify }: ContributePageProps) {
  const [draft, setDraft] = useState<ContributionDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof ContributionDraft, string>>>({});
  const [submittedPreview, setSubmittedPreview] = useState<ContributionDraft | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrors((prev) => ({
        ...prev,
        fileName: 'Please select a valid PDF file (.pdf).',
      }));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        fileName: 'File exceeds the 15 MB prototype validation limit.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, fileName: undefined }));
    setDraft((prev) => ({
      ...prev,
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ContributionDraft, string>> = {};
    if (draft.title.trim().length < 4) {
      nextErrors.title = 'Enter a descriptive resource title (at least 4 characters).';
    }
    if (!draft.branchId) {
      nextErrors.branchId = 'Select an engineering branch.';
    }
    if (!draft.semester) {
      nextErrors.semester = 'Select a semester (1–8).';
    }
    if (draft.subjectName.trim().length < 2) {
      nextErrors.subjectName = 'Enter the subject name.';
    }
    if (!draft.year || draft.year < 2015 || draft.year > 2026) {
      nextErrors.year = 'Enter a valid exam year between 2015 and 2026.';
    }
    if (!draft.session) {
      nextErrors.session = 'Select Summer or Winter session.';
    }
    if (!draft.fileName) {
      nextErrors.fileName = 'Attach a PDF file to preview your upload.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onNotify('Please fix the highlighted form fields before previewing.', 'warning');
      return;
    }

    setSubmittedPreview(draft);
    onNotify(
      'Validated locally in prototype preview mode (not uploaded to a server).',
      'success'
    );
  };

  const branchLabel =
    DEMO_BRANCHES.find((b) => b.id === (submittedPreview?.branchId || draft.branchId))
      ?.name ?? 'Branch not selected';

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-[#60A5FA]">
          Community Archive · Frontend Validation Prototype
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
          Contribute Materials
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
          Help the next batch survive finals. Validate your question paper metadata and inspect the live card preview below.
        </p>
      </div>

      {/* Honest Prototype Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-xs text-amber-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="leading-relaxed">
          <strong>Prototype Notice:</strong> Backend storage (Supabase &amp; Google Drive) is not connected yet. Submitting this form runs full client-side validation and generates a local upload preview without storing your PDF on a remote server.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Contribution Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-[#3B82F6]/18 bg-[#0D1525] p-6 lg:col-span-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1] sm:col-span-2">
              <span>Resource Title *</span>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Data Structures Winter 2025 End Semester Paper"
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              />
              {errors.title && (
                <span className="text-[11px] text-rose-400">{errors.title}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Branch *</span>
              <select
                value={draft.branchId}
                onChange={(e) =>
                  setDraft({ ...draft, branchId: e.target.value as BranchId | '' })
                }
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="">Select branch</option>
                {DEMO_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <span className="text-[11px] text-rose-400">{errors.branchId}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Semester *</span>
              <select
                value={draft.semester === '' ? '' : String(draft.semester)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    semester: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="">Select semester</option>
                {AVAILABLE_SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <span className="text-[11px] text-rose-400">{errors.semester}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Subject Name *</span>
              <input
                type="text"
                value={draft.subjectName}
                onChange={(e) => setDraft({ ...draft, subjectName: e.target.value })}
                placeholder="e.g. Operating Systems"
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              />
              {errors.subjectName && (
                <span className="text-[11px] text-rose-400">{errors.subjectName}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Subject Code (Optional)</span>
              <input
                type="text"
                value={draft.subjectCode}
                onChange={(e) =>
                  setDraft({ ...draft, subjectCode: e.target.value.toUpperCase() })
                }
                placeholder="e.g. CS403"
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 font-mono text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Examination Year *</span>
              <input
                type="number"
                min={2015}
                max={2026}
                value={draft.year}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    year: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
              />
              {errors.year && (
                <span className="text-[11px] text-rose-400">{errors.year}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1]">
              <span>Examination Session *</span>
              <select
                value={draft.session}
                onChange={(e) =>
                  setDraft({ ...draft, session: e.target.value as ExamSession | '' })
                }
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="">Select session</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
              {errors.session && (
                <span className="text-[11px] text-rose-400">{errors.session}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#CBD5E1] sm:col-span-2">
              <span>Examination Type</span>
              <select
                value={draft.examType}
                onChange={(e) =>
                  setDraft({ ...draft, examType: e.target.value as ExamType })
                }
                className="rounded-xl border border-[#3B82F6]/22 bg-[#090F1C] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="End Semester">End Semester</option>
                <option value="Mid Semester">Mid Semester</option>
                <option value="Supplementary">Supplementary</option>
              </select>
            </label>
          </div>

          {/* PDF File Selection */}
          <div>
            <span className="block text-xs font-medium text-[#CBD5E1]">
              PDF Upload Selection *
            </span>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#3B82F6]/35 bg-[#090F1C] p-6 text-center transition-colors hover:border-[#60A5FA]">
              <Upload className="h-6 w-6 text-[#60A5FA]" />
              <span className="mt-2 text-sm font-semibold text-[#F8FAFC]">
                {draft.fileName ? draft.fileName : 'Click to choose a PDF file'}
              </span>
              <span className="mt-1 text-xs text-[#64748B]">
                {draft.fileName
                  ? `${draft.fileSizeKb} KB · Ready for local preview`
                  : 'PDF format only, up to 15 MB (client-side preview only)'}
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {draft.fileName && (
              <button
                type="button"
                onClick={() => setDraft({ ...draft, fileName: '', fileSizeKb: 0 })}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white"
              >
                <X className="h-3.5 w-3.5" /> Remove selected file
              </button>
            )}
            {errors.fileName && (
              <p className="mt-1.5 text-[11px] text-rose-400">{errors.fileName}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B82F6]"
            >
              Validate &amp; Preview Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(INITIAL_DRAFT);
                setErrors({});
                setSubmittedPreview(null);
              }}
              className="rounded-xl border border-[#3B82F6]/20 bg-[#090F1C] px-4 py-2.5 text-sm font-medium text-[#CBD5E1] hover:text-white"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Live Upload Preview Panel */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-[#3B82F6]/18 bg-[#090F1C] p-6">
            <p className="font-mono text-xs text-[#60A5FA]">
              Live Upload Card Preview
            </p>

            <div className="mt-4 rounded-2xl border border-[#3B82F6]/22 bg-[#0D1525] p-5">
              <div className="flex items-center justify-between font-mono text-xs text-[#94A3B8]">
                <span className="text-[#60A5FA]">
                  {draft.subjectCode || 'CODE'} · Sem {draft.semester || '—'} ·{' '}
                  {draft.session || 'Session'} {draft.year || 'YYYY'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-[#3B82F6]" />
                  PDF
                </span>
              </div>

              <h3 className="mt-2.5 font-display text-lg font-bold text-[#F8FAFC]">
                {draft.subjectName || 'Your Subject Name'}
              </h3>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {branchLabel} · {draft.examType}
              </p>
              <p className="mt-3 truncate text-xs text-[#64748B]">
                {draft.title || 'Your resource title will appear here.'}
              </p>

              <div className="mt-4 border-t border-[#3B82F6]/12 pt-3 font-mono text-[11px] text-[#94A3B8]">
                {draft.fileName
                  ? `Attached: ${draft.fileName} (${draft.fileSizeKb} KB)`
                  : 'No PDF attached yet'}
              </div>
            </div>

            {submittedPreview && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Local Validation Passed (Prototype Preview)</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/80">
                  &ldquo;{submittedPreview.title}&rdquo; passed all schema checks. Once Google Drive and Supabase storage are connected in Phase 2, this action will submit directly to the moderation queue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
