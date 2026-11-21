import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  RotateCcw,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { QuestionPaper } from '../../types/academic';

interface PDFViewerProps {
  paper: QuestionPaper | null;
  isBookmarked: boolean;
  onClose: () => void;
  onSelectPaper: (paper: QuestionPaper) => void;
  onDownload: (paper: QuestionPaper) => void;
  onShare: (paper: QuestionPaper) => void;
  onToggleBookmark: (paper: QuestionPaper) => void;
}

export function PDFViewer({
  paper,
  isBookmarked,
  onClose,
  onSelectPaper,
  onDownload,
  onShare,
  onToggleBookmark,
}: PDFViewerProps) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setPage(1);
    setZoom(100);
  }, [paper?.id]);

  useEffect(() => {
    if (!paper) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPage((p) => Math.min(p + 1, totalPages));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paper, onClose]);

  if (!paper) return null;

  const totalPages = paper.sampleQuestions.length;
  const activeSection = paper.sampleQuestions[page - 1] ?? paper.sampleQuestions[0];
  const relatedPapers = resourceService.getRelatedPapers(paper, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#3B82F6]/30 bg-[#090F1C] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Viewer Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3B82F6]/18 bg-[#0D1525] px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#60A5FA]">
              <span>{paper.subjectCode}</span>
              <span aria-hidden="true">·</span>
              <span>Semester {paper.semester}</span>
              <span aria-hidden="true">·</span>
              <span>
                {paper.session} {paper.year}
              </span>
            </div>
            <h2
              id="pdf-viewer-title"
              className="truncate font-display text-base font-bold text-[#F8FAFC] sm:text-lg"
            >
              {paper.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(paper)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isBookmarked
                  ? 'border-[#3B82F6]/60 bg-[#2563EB]/20 text-[#60A5FA]'
                  : 'border-[#3B82F6]/20 bg-[#090F1C] text-[#CBD5E1] hover:text-white'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(paper)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3B82F6]/20 bg-[#090F1C] px-3 py-2 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/50 hover:text-white whitespace-nowrap"
            >
              <Share2 className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={() => onDownload(paper)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3B82F6] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download Sample</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document preview"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewer Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3B82F6]/14 bg-[#070C17] px-4 py-2.5 sm:px-6">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs tabular-nums text-[#CBD5E1]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Prototype disclaimer notice */}
          <div className="flex items-center gap-1.5 text-xs text-amber-300/90">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Prototype Placeholder Viewer · Demo Data (No Live University PDF Linked)</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(75, z - 15))}
              aria-label="Zoom out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] text-[#CBD5E1] hover:border-[#3B82F6]/60"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center font-mono text-xs tabular-nums text-[#CBD5E1]">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(145, z + 15))}
              aria-label="Zoom in"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] text-[#CBD5E1] hover:border-[#3B82F6]/60"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              aria-label="Reset zoom"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3B82F6]/20 bg-[#0D1525] text-[#94A3B8] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content: Paper Canvas + Right Subject/Related Rail */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_300px]">
          {/* Scrollable Simulated PDF Page Area */}
          <div className="overflow-auto bg-[#05070D] p-4 sm:p-8">
            <div
              className="mx-auto origin-top rounded-xl border border-slate-700/60 bg-[#0F172A] p-6 text-[#E2E8F0] shadow-2xl transition-transform duration-150 sm:p-10"
              style={{
                maxWidth: '720px',
                transform: `scale(${zoom / 100})`,
              }}
            >
              {/* Sample Paper Sheet Header */}
              <div className="border-b border-slate-700 pb-5">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#60A5FA]">
                  <span>SAMPLE PROTOTYPE SHEET</span>
                  <span>ID: {paper.id}</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  {paper.subjectName}
                </h3>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {paper.branchName} · Semester {paper.semester} · {paper.session} {paper.year} ·{' '}
                  {paper.examType}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-slate-700/70 bg-[#090F1C] p-3 font-mono text-xs tabular-nums text-[#CBD5E1]">
                  <div>Code: {paper.subjectCode}</div>
                  <div>Max Marks: 70</div>
                  <div>Duration: 3 Hrs</div>
                </div>
              </div>

              {/* Active Page Section Content */}
              <div className="mt-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-display text-sm font-bold text-[#60A5FA] sm:text-base">
                    {activeSection.section}
                  </h4>
                  <span className="font-mono text-xs tabular-nums text-[#94A3B8]">
                    {activeSection.marks} Marks
                  </span>
                </div>

                <ol className="mt-5 space-y-4 text-sm leading-relaxed text-[#E2E8F0]">
                  {activeSection.questions.map((question, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-slate-800/80 bg-[#090F1C]/65 p-4"
                    >
                      <span className="mr-2 font-mono text-xs font-semibold text-[#60A5FA]">
                        Q{page}.{idx + 1}
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Sheet Footer */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4 font-mono text-[11px] text-[#64748B]">
                <span>CRAZY! Demo Viewer — Not an official university exam paper</span>
                <span>
                  Page {page} of {totalPages}
                </span>
              </div>
            </div>
          </div>

          {/* Right Info & Related Papers Rail */}
          <aside className="flex flex-col gap-5 overflow-y-auto border-t border-[#3B82F6]/15 bg-[#090F1C] p-5 lg:border-l lg:border-t-0">
            <div>
              <h3 className="font-display text-sm font-bold text-[#F8FAFC]">
                Document Info
              </h3>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748B]">Branch</dt>
                  <dd className="text-right text-[#E2E8F0]">{paper.branchName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748B]">Subject Code</dt>
                  <dd className="font-mono text-[#60A5FA]">{paper.subjectCode}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748B]">Semester</dt>
                  <dd className="font-mono tabular-nums text-[#E2E8F0]">
                    Semester {paper.semester}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748B]">Sample Size</dt>
                  <dd className="font-mono tabular-nums text-[#E2E8F0]">
                    {paper.fileSizeKb} KB · {paper.pages}p
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748B]">Demo Uploaded</dt>
                  <dd className="font-mono tabular-nums text-[#E2E8F0]">{paper.uploadedAt}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-[#3B82F6]/15 pt-4">
              <h3 className="font-display text-sm font-bold text-[#F8FAFC]">
                Related Demo Papers
              </h3>
              <div className="mt-3 space-y-2">
                {relatedPapers.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectPaper(rel)}
                    className="flex w-full items-start gap-2.5 rounded-xl border border-[#3B82F6]/15 bg-[#0D1525] p-3 text-left transition-colors hover:border-[#3B82F6]/50 hover:bg-[#13213D]"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#60A5FA]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                        {rel.subjectName}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#94A3B8]">
                        {rel.subjectCode} · {rel.session} {rel.year} · Sem {rel.semester}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
