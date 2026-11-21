import {
  AVAILABLE_SEMESTERS,
  AVAILABLE_YEARS,
  DEMO_BRANCHES,
  DEMO_PAPERS,
  DEMO_SUBJECTS,
} from '../data/demoPapers';
import {
  BranchId,
  BranchInfo,
  PaperFilterState,
  QuestionPaper,
  SubjectInfo,
} from '../types/academic';

/**
 * RESOURCE SERVICE ABSTRACTION LAYER
 * ----------------------------------
 * Clean boundary between UI components and data storage.
 * Currently backed by centralized prototype demo data in `src/data/demoPapers.ts`.
 * Future Supabase (metadata/search) and Google Drive (PDF stream) adapters can
 * implement this exact interface without modifying UI screens.
 */

export interface ResourceRepositoryStats {
  totalPapers: number;
  totalSubjects: number;
  totalBranches: number;
  recentlyAddedCount: number;
  isDemo: boolean;
}

export const DEFAULT_FILTERS: PaperFilterState = {
  search: '',
  branchId: 'all',
  semester: 'all',
  year: 'all',
  session: 'all',
  examType: 'all',
  subjectName: 'all',
  sortBy: 'newest',
};

export const resourceService = {
  getDataSourceStatus() {
    return {
      mode: 'DEMO_PROTOTYPE' as const,
      label: 'Demo Data',
      supabaseConnected: false,
      googleDriveConnected: false,
    };
  },

  getBranches(): BranchInfo[] {
    return DEMO_BRANCHES;
  },

  getSubjects(): SubjectInfo[] {
    return DEMO_SUBJECTS;
  },

  getAvailableYears(): number[] {
    return AVAILABLE_YEARS;
  },

  getAvailableSemesters(): number[] {
    return AVAILABLE_SEMESTERS;
  },

  getAllPapers(): QuestionPaper[] {
    return DEMO_PAPERS;
  },

  getPaperById(id: string): QuestionPaper | undefined {
    return DEMO_PAPERS.find((paper) => paper.id === id);
  },

  getStats(): ResourceRepositoryStats {
    const recentCutoff = new Date('2026-11-01').getTime();
    const recentlyAddedCount = DEMO_PAPERS.filter(
      (p) => new Date(p.uploadedAt).getTime() >= recentCutoff
    ).length;

    return {
      totalPapers: DEMO_PAPERS.length,
      totalSubjects: DEMO_SUBJECTS.length,
      totalBranches: DEMO_BRANCHES.length,
      recentlyAddedCount,
      isDemo: true,
    };
  },

  getPaperCountByBranch(branchId: BranchId): number {
    return DEMO_PAPERS.filter((p) => p.branchId === branchId).length;
  },

  getSubjectCountByBranch(branchId: BranchId): number {
    return DEMO_SUBJECTS.filter((s) => s.branchIds.includes(branchId)).length;
  },

  getPaperCountBySemester(semester: number): number {
    return DEMO_PAPERS.filter((p) => p.semester === semester).length;
  },

  getPaperCountBySubject(subjectName: string): number {
    return DEMO_PAPERS.filter(
      (p) => p.subjectName.toLowerCase() === subjectName.toLowerCase()
    ).length;
  },

  queryPapers(filters: PaperFilterState): QuestionPaper[] {
    const q = filters.search.trim().toLowerCase();

    const filtered = DEMO_PAPERS.filter((paper) => {
      if (q) {
        const haystack = [
          paper.subjectName,
          paper.subjectCode,
          paper.branchName,
          paper.title,
          `semester ${paper.semester}`,
          `sem ${paper.semester}`,
          String(paper.year),
          paper.session,
          ...paper.topics,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (filters.branchId !== 'all' && paper.branchId !== filters.branchId) {
        return false;
      }
      if (filters.semester !== 'all' && paper.semester !== filters.semester) {
        return false;
      }
      if (filters.year !== 'all' && paper.year !== filters.year) {
        return false;
      }
      if (filters.session !== 'all' && paper.session !== filters.session) {
        return false;
      }
      if (filters.examType !== 'all' && paper.examType !== filters.examType) {
        return false;
      }
      if (
        filters.subjectName !== 'all' &&
        paper.subjectName.toLowerCase() !== filters.subjectName.toLowerCase()
      ) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
    } else if (filters.sortBy === 'alphabetical') {
      sorted.sort((a, b) => {
        const cmp = a.subjectName.localeCompare(b.subjectName);
        return cmp !== 0 ? cmp : b.year - a.year;
      });
    } else if (filters.sortBy === 'popular') {
      sorted.sort((a, b) => b.views - a.views);
    }

    return sorted;
  },

  getPopularPapers(limit = 6, preferredSemester?: number | null): QuestionPaper[] {
    const sorted = [...DEMO_PAPERS].sort((a, b) => {
      const aBoost = preferredSemester && a.semester === preferredSemester ? 600 : 0;
      const bBoost = preferredSemester && b.semester === preferredSemester ? 600 : 0;
      return b.views + bBoost - (a.views + aBoost);
    });
    return sorted.slice(0, limit);
  },

  getRecentlyAddedPapers(limit?: number): QuestionPaper[] {
    const sorted = [...DEMO_PAPERS].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  },

  getRelatedPapers(paper: QuestionPaper, limit = 4): QuestionPaper[] {
    return DEMO_PAPERS.filter((p) => p.id !== paper.id)
      .map((candidate) => {
        let score = 0;
        if (candidate.subjectName === paper.subjectName) score += 5;
        if (candidate.branchId === paper.branchId) score += 3;
        if (candidate.semester === paper.semester) score += 2;
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.candidate);
  },

  /**
   * Generates a clearly labeled prototype practice sheet text download
   * so the Download action is genuinely functional without pretending to
   * serve an official university PDF from Google Drive.
   */
  downloadDemoSampleSheet(paper: QuestionPaper): void {
    const lines = [
      '==================================================================',
      'CRAZY! — PROTOTYPE SAMPLE QUESTION PAPER SHEET (DEMO DATA ONLY)',
      '==================================================================',
      'NOTE: Real university PDF files & Google Drive are NOT connected yet.',
      'This file is an auto-generated prototype sample for UI verification.',
      '',
      `Title       : ${paper.title}`,
      `Subject     : ${paper.subjectName} (${paper.subjectCode})`,
      `Branch      : ${paper.branchName}`,
      `Semester    : Semester ${paper.semester}`,
      `Exam        : ${paper.session} ${paper.year} · ${paper.examType}`,
      `Demo ID     : ${paper.id}`,
      `Topics      : ${paper.topics.join(', ')}`,
      '',
      ...paper.sampleQuestions.flatMap((sec) => [
        `--- ${sec.section} (${sec.marks} Marks) ---`,
        ...sec.questions.map((q, idx) => `  Q${idx + 1}. ${q}`),
        '',
      ]),
      '==================================================================',
      'CRAZY! — Your academic comeback starts here.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.subjectCode}_${paper.session}_${paper.year}_DEMO_SAMPLE.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
