export type ExamSession = 'Summer' | 'Winter';

export type ExamType = 'End Semester' | 'Mid Semester' | 'Supplementary';

export type BranchId =
  | 'computer-engineering'
  | 'information-technology'
  | 'ai-ml'
  | 'mechanical-engineering'
  | 'civil-engineering'
  | 'electrical-engineering'
  | 'electronics-engineering';

export type PageRoute =
  | 'home'
  | 'papers'
  | 'vault-3d'
  | 'branches'
  | 'semesters'
  | 'subjects'
  | 'saved'
  | 'recent'
  | 'contribute'
  | 'settings';

export interface BranchInfo {
  id: BranchId;
  name: string;
  shortCode: string;
  description: string;
  accentHex: string;
  sampleTracks: string[];
}

export interface SubjectInfo {
  id: string;
  code: string;
  name: string;
  branchIds: BranchId[];
  typicalSemesters: number[];
  credits: number;
  summary: string;
}

export interface QuestionPaper {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  branchId: BranchId;
  branchName: string;
  semester: number;
  year: number;
  session: ExamSession;
  examType: ExamType;
  format: 'PDF';
  pages: number;
  fileSizeKb: number;
  uploadedAt: string; // ISO date string (demo)
  views: number;
  isDemo: true;
  demoUrl: string;
  topics: string[];
  sampleQuestions: {
    section: string;
    marks: number;
    questions: string[];
  }[];
}

export interface PaperFilterState {
  search: string;
  branchId: BranchId | 'all';
  semester: number | 'all';
  year: number | 'all';
  session: ExamSession | 'all';
  examType: ExamType | 'all';
  subjectName: string | 'all';
  sortBy: 'newest' | 'alphabetical' | 'popular';
}

export interface ContributionDraft {
  title: string;
  branchId: BranchId | '';
  semester: number | '';
  subjectName: string;
  subjectCode: string;
  year: number | '';
  session: ExamSession | '';
  examType: ExamType;
  fileName: string;
  fileSizeKb: number;
}

export interface DemoNotification {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  read: boolean;
  targetRoute: PageRoute;
  filterPreset?: Partial<PaperFilterState>;
}

export interface UserPreferences {
  displayName: string;
  initials: string;
  selectedSemester: number | null;
  hasCompletedIntro: boolean;
  reducedMotionOverride: boolean;
  compactCards: boolean;
}
