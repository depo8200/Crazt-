import { ReactNode, useState } from 'react';
import { Bookmark, Box, FileText, Home, Layers } from 'lucide-react';
import { DemoNotification, PageRoute, QuestionPaper } from '../types/academic';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  activeRoute: PageRoute;
  globalSearch: string;
  selectedSemester: number | null;
  initials: string;
  displayName: string;
  savedCount: number;
  notifications: DemoNotification[];
  onNavigate: (route: PageRoute) => void;
  onGlobalSearchChange: (val: string) => void;
  onGlobalSearchSubmit: () => void;
  onSelectSemester: (sem: number) => void;
  onPreviewPaper: (paper: QuestionPaper) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: DemoNotification) => void;
  children: ReactNode;
}

const MOBILE_BOTTOM_TABS: { id: PageRoute; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'papers', label: 'Papers', icon: FileText },
  { id: 'vault-3d', label: '3D Vault', icon: Box },
  { id: 'semesters', label: 'Semesters', icon: Layers },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

export function DashboardLayout({
  activeRoute,
  globalSearch,
  selectedSemester,
  initials,
  displayName,
  savedCount,
  notifications,
  onNavigate,
  onGlobalSearchChange,
  onGlobalSearchSubmit,
  onSelectSemester,
  onPreviewPaper,
  onMarkAllRead,
  onNotificationClick,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#05070D] text-[#F8FAFC]">
      <Sidebar
        activeRoute={activeRoute}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        savedCount={savedCount}
        onNavigate={onNavigate}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          globalSearch={globalSearch}
          selectedSemester={selectedSemester}
          initials={initials}
          displayName={displayName}
          notifications={notifications}
          onGlobalSearchChange={onGlobalSearchChange}
          onGlobalSearchSubmit={onGlobalSearchSubmit}
          onSelectSemester={onSelectSemester}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={onNavigate}
          onPreviewPaper={onPreviewPaper}
          onMarkAllRead={onMarkAllRead}
          onNotificationClick={onNotificationClick}
        />

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Compact Mobile Bottom Quick Navigation */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-[#3B82F6]/20 bg-[#05070D]/95 px-2 backdrop-blur-md lg:hidden"
      >
        {MOBILE_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeRoute === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex min-w-[56px] flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
                active ? 'text-[#60A5FA]' : 'text-[#94A3B8]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
