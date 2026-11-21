import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { AVAILABLE_SEMESTERS } from '../data/demoPapers';
import { resourceService } from '../services/resourceService';
import {
  DemoNotification,
  PageRoute,
  QuestionPaper,
} from '../types/academic';

interface NavbarProps {
  globalSearch: string;
  selectedSemester: number | null;
  initials: string;
  displayName: string;
  notifications: DemoNotification[];
  onGlobalSearchChange: (value: string) => void;
  onGlobalSearchSubmit: () => void;
  onSelectSemester: (sem: number) => void;
  onOpenMobileMenu: () => void;
  onNavigate: (route: PageRoute) => void;
  onPreviewPaper: (paper: QuestionPaper) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: DemoNotification) => void;
}

export function Navbar({
  globalSearch,
  selectedSemester,
  initials,
  displayName,
  notifications,
  onGlobalSearchChange,
  onGlobalSearchSubmit,
  onSelectSemester,
  onOpenMobileMenu,
  onNavigate,
  onPreviewPaper,
  onMarkAllRead,
  onNotificationClick,
}: NavbarProps) {
  const [semMenuOpen, setSemMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const semRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (semRef.current && !semRef.current.contains(e.target as Node)) {
        setSemMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const quickMatches =
    globalSearch.trim().length >= 2
      ? resourceService
          .queryPapers({
            search: globalSearch,
            branchId: 'all',
            semester: 'all',
            year: 'all',
            session: 'all',
            examType: 'all',
            subjectName: 'all',
            sortBy: 'newest',
          })
          .slice(0, 5)
      : [];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#3B82F6]/16 bg-[#05070D]/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Drawer Trigger + Global Search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3B82F6]/20 bg-[#090F1C] text-[#CBD5E1] transition-colors hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div ref={searchRef} className="relative w-full max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchFocused(false);
              onGlobalSearchSubmit();
            }}
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="search"
              value={globalSearch}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder="Search subjects, codes (CS301, AI604)..."
              aria-label="Global question paper search"
              className="w-full rounded-xl border border-[#3B82F6]/20 bg-[#090F1C] py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none"
            />
          </form>

          {searchFocused && quickMatches.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-[#3B82F6]/28 bg-[#0D1525] shadow-2xl">
              <div className="border-b border-[#3B82F6]/14 px-3.5 py-2 text-[11px] font-mono text-[#94A3B8]">
                Quick Sample Matches
              </div>
              <ul>
                {quickMatches.map((paper) => (
                  <li key={paper.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        onPreviewPaper(paper);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[#13213D]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                          {paper.subjectName}
                        </p>
                        <p className="truncate font-mono text-[11px] text-[#94A3B8]">
                          {paper.subjectCode} · {paper.branchName} · Sem {paper.semester}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-[#60A5FA]">
                        {paper.session} {paper.year}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setSearchFocused(false);
                  onGlobalSearchSubmit();
                }}
                className="w-full border-t border-[#3B82F6]/14 bg-[#090F1C] px-3.5 py-2 text-center text-xs font-semibold text-[#60A5FA] hover:bg-[#101C33]"
              >
                View all results in Library
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Subtle Demo Label + Semester Switcher + Notifications + Abstract Avatar */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden font-mono text-[11px] text-[#64748B] xl:inline whitespace-nowrap">
          Demo Data
        </span>

        {/* Selected Semester Indicator & Switcher */}
        <div ref={semRef} className="relative">
          <button
            type="button"
            onClick={() => setSemMenuOpen((prev) => !prev)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#3B82F6]/25 bg-[#090F1C] px-3 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#3B82F6]/60 whitespace-nowrap"
          >
            <span className="font-mono text-[#60A5FA]">
              {selectedSemester ? `Sem ${selectedSemester}` : 'Select Sem'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" />
          </button>

          {semMenuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-[#3B82F6]/28 bg-[#0D1525] p-1.5 shadow-2xl">
              <p className="px-2.5 py-1.5 text-[11px] font-medium text-[#94A3B8]">
                Active Semester
              </p>
              <div className="grid grid-cols-2 gap-1">
                {AVAILABLE_SEMESTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onSelectSemester(s);
                      setSemMenuOpen(false);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                      selectedSemester === s
                        ? 'bg-[#2563EB] font-semibold text-white'
                        : 'text-[#CBD5E1] hover:bg-white/5'
                    }`}
                  >
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3B82F6]/20 bg-[#090F1C] text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/55 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#2563EB] px-1 font-mono text-[10px] font-bold tabular-nums text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[90vw] rounded-2xl border border-[#3B82F6]/28 bg-[#0D1525] p-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#3B82F6]/14 pb-2.5">
                <span className="font-display text-xs font-bold text-[#F8FAFC]">
                  Updates
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[11px] font-medium text-[#60A5FA] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-1.5">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onNotificationClick(notif);
                    }}
                    className={`w-full rounded-xl p-2.5 text-left transition-colors hover:bg-[#13213D] ${
                      notif.read ? 'opacity-70' : 'bg-[#090F1C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#F8FAFC]">
                        {notif.title}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-[#64748B]">
                        {notif.timeAgo}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[#94A3B8]">
                      {notif.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Abstract Gradient User Initials Avatar (No human photo) */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          title={`${displayName} — Account & Preferences`}
          aria-label="Open profile settings"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#60A5FA]/35 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F172A] font-display text-xs font-bold tracking-wider text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
