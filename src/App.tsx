import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShareModal } from './components/common/ShareModal';
import { ToastContainer } from './components/common/ToastContainer';
import { IntroAnimation } from './components/intro/IntroAnimation';
import { PDFViewer } from './components/viewer/PDFViewer';
import { INITIAL_DEMO_NOTIFICATIONS } from './data/demoPapers';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useToast } from './hooks/useToast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { BranchesPage } from './pages/BranchesPage';
import { ContributePage } from './pages/ContributePage';
import { HomePage } from './pages/HomePage';
import { QuestionPapersPage } from './pages/QuestionPapersPage';
import { RecentlyAddedPage } from './pages/RecentlyAddedPage';
import { SavedPapersPage } from './pages/SavedPapersPage';
import { SemestersPage } from './pages/SemestersPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { Vault3DPage } from './pages/Vault3DPage';
import { DEFAULT_FILTERS, resourceService } from './services/resourceService';
import {
  DemoNotification,
  PageRoute,
  PaperFilterState,
  QuestionPaper,
  UserPreferences,
} from './types/academic';

const DEFAULT_PREFS: UserPreferences = {
  displayName: 'Dude',
  initials: 'CZ',
  selectedSemester: null,
  hasCompletedIntro: false,
  reducedMotionOverride: false,
  compactCards: false,
};

export default function App() {
  const [prefs, setPrefs] = useLocalStorage<UserPreferences>(
    'crazy_user_prefs_v1',
    DEFAULT_PREFS
  );
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage<string[]>(
    'crazy_saved_papers_v1',
    []
  );
  const [showIntro, setShowIntro] = useState(true);
  const [activeRoute, setActiveRoute] = useState<PageRoute>('home');
  const [filters, setFilters] = useState<PaperFilterState>(DEFAULT_FILTERS);
  const [globalSearch, setGlobalSearch] = useState('');
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [sharePaper, setSharePaper] = useState<QuestionPaper | null>(null);
  const [notifications, setNotifications] = useState<DemoNotification[]>(
    INITIAL_DEMO_NOTIFICATIONS
  );

  const reducedMotion = useReducedMotion(prefs.reducedMotionOverride);
  const { toasts, pushToast, dismissToast } = useToast();

  const updatePrefs = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPrefs((prev) => ({ ...prev, ...patch }));
    },
    [setPrefs]
  );

  const handleNavigate = useCallback(
    (route: PageRoute, filterPreset?: Partial<PaperFilterState>) => {
      if (filterPreset) {
        setFilters({ ...DEFAULT_FILTERS, ...filterPreset });
        if (typeof filterPreset.search === 'string') {
          setGlobalSearch(filterPreset.search);
        }
      }
      setActiveRoute(route);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion]
  );

  const handleToggleBookmark = useCallback(
    (paper: QuestionPaper) => {
      setBookmarkedIds((prev) => {
        const exists = prev.includes(paper.id);
        if (exists) {
          pushToast(`Removed "${paper.subjectName}" from Saved Papers.`, 'info');
          return prev.filter((id) => id !== paper.id);
        }
        pushToast(`Saved "${paper.subjectName}" (${paper.year}) for revision.`, 'success');
        return [paper.id, ...prev];
      });
    },
    [setBookmarkedIds, pushToast]
  );

  const handleDownloadPaper = useCallback(
    (paper: QuestionPaper) => {
      resourceService.downloadDemoSampleSheet(paper);
      pushToast(
        `Downloaded prototype sample sheet for ${paper.subjectCode} (Demo Data).`,
        'success'
      );
    },
    [pushToast]
  );

  const handleSelectSemester = useCallback(
    (sem: number) => {
      updatePrefs({ selectedSemester: sem });
      pushToast(`Active semester set to Semester ${sem}.`, 'success');
    },
    [updatePrefs, pushToast]
  );

  const handleFinishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleNotificationClick = useCallback(
    (notif: DemoNotification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      handleNavigate(notif.targetRoute, notif.filterPreset);
    },
    [handleNavigate]
  );

  return (
    <>
      {showIntro && (
        <IntroAnimation
          initialSemester={prefs.selectedSemester}
          reducedMotion={reducedMotion}
          onSelectSemester={(sem) => updatePrefs({ selectedSemester: sem })}
          onFinishIntro={handleFinishIntro}
        />
      )}

      {!showIntro && (
        <DashboardLayout
          activeRoute={activeRoute}
          globalSearch={globalSearch}
          selectedSemester={prefs.selectedSemester}
          initials={prefs.initials}
          displayName={prefs.displayName || 'Dude'}
          savedCount={bookmarkedIds.length}
          notifications={notifications}
          onNavigate={(route) => handleNavigate(route)}
          onGlobalSearchChange={(val) => {
            setGlobalSearch(val);
            if (activeRoute === 'papers') {
              setFilters((prev) => ({ ...prev, search: val }));
            }
          }}
          onGlobalSearchSubmit={() => {
            handleNavigate('papers', { search: globalSearch });
          }}
          onSelectSemester={handleSelectSemester}
          onPreviewPaper={setPreviewPaper}
          onMarkAllRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            pushToast('All notifications marked as read.', 'info');
          }}
          onNotificationClick={handleNotificationClick}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoute}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeRoute === 'home' && (
                <HomePage
                  selectedSemester={prefs.selectedSemester}
                  displayName={prefs.displayName || 'Dude'}
                  bookmarkedIds={bookmarkedIds}
                  reducedMotion={reducedMotion}
                  onNavigate={handleNavigate}
                  onPreviewPaper={setPreviewPaper}
                  onDownloadPaper={handleDownloadPaper}
                  onSharePaper={setSharePaper}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeRoute === 'papers' && (
                <QuestionPapersPage
                  filters={filters}
                  bookmarkedIds={bookmarkedIds}
                  compactCards={prefs.compactCards}
                  onChangeFilters={(patch) => {
                    setFilters((prev) => ({ ...prev, ...patch }));
                    if (typeof patch.search === 'string') {
                      setGlobalSearch(patch.search);
                    }
                  }}
                  onResetFilters={() => {
                    setFilters(DEFAULT_FILTERS);
                    setGlobalSearch('');
                  }}
                  onPreviewPaper={setPreviewPaper}
                  onDownloadPaper={handleDownloadPaper}
                  onSharePaper={setSharePaper}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeRoute === 'vault-3d' && (
                <Vault3DPage
                  reducedMotion={reducedMotion}
                  onSelectBranchPapers={(branchId) =>
                    handleNavigate('papers', { branchId })
                  }
                />
              )}

              {activeRoute === 'branches' && (
                <BranchesPage
                  onSelectBranch={(branchId) =>
                    handleNavigate('papers', { branchId })
                  }
                  onOpen3DVault={() => handleNavigate('vault-3d')}
                />
              )}

              {activeRoute === 'semesters' && (
                <SemestersPage
                  selectedSemester={prefs.selectedSemester}
                  onSetActiveSemester={handleSelectSemester}
                  onBrowseSemester={(semester) =>
                    handleNavigate('papers', { semester })
                  }
                />
              )}

              {activeRoute === 'subjects' && (
                <SubjectsPage
                  onSelectSubject={(subjectName) =>
                    handleNavigate('papers', { subjectName })
                  }
                />
              )}

              {activeRoute === 'saved' && (
                <SavedPapersPage
                  bookmarkedIds={bookmarkedIds}
                  onPreviewPaper={setPreviewPaper}
                  onDownloadPaper={handleDownloadPaper}
                  onSharePaper={setSharePaper}
                  onToggleBookmark={handleToggleBookmark}
                  onClearAllBookmarks={() => {
                    setBookmarkedIds([]);
                    pushToast('Cleared all saved papers.', 'info');
                  }}
                  onExplorePapers={() => handleNavigate('papers')}
                />
              )}

              {activeRoute === 'recent' && (
                <RecentlyAddedPage
                  bookmarkedIds={bookmarkedIds}
                  onPreviewPaper={setPreviewPaper}
                  onDownloadPaper={handleDownloadPaper}
                  onSharePaper={setSharePaper}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeRoute === 'contribute' && (
                <ContributePage onNotify={pushToast} />
              )}

              {activeRoute === 'settings' && (
                <SettingsPage
                  prefs={prefs}
                  savedCount={bookmarkedIds.length}
                  onUpdatePrefs={(patch) => {
                    updatePrefs(patch);
                    if (patch.selectedSemester) {
                      pushToast(
                        `Active semester updated to Semester ${patch.selectedSemester}.`,
                        'success'
                      );
                    }
                  }}
                  onReplayIntro={() => setShowIntro(true)}
                  onClearBookmarks={() => {
                    setBookmarkedIds([]);
                    pushToast('Cleared all saved bookmarks.', 'info');
                  }}
                  onResetAll={() => {
                    setPrefs(DEFAULT_PREFS);
                    setBookmarkedIds([]);
                    setFilters(DEFAULT_FILTERS);
                    setGlobalSearch('');
                    pushToast('Local demo preferences reset.', 'info');
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </DashboardLayout>
      )}

      {/* Document Prototype Preview Modal */}
      <PDFViewer
        paper={previewPaper}
        isBookmarked={previewPaper ? bookmarkedIds.includes(previewPaper.id) : false}
        onClose={() => setPreviewPaper(null)}
        onSelectPaper={setPreviewPaper}
        onDownload={handleDownloadPaper}
        onShare={setSharePaper}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Paper Share Modal */}
      <ShareModal
        paper={sharePaper}
        onClose={() => setSharePaper(null)}
        onNotify={pushToast}
      />

      {/* Toast Feedback Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
