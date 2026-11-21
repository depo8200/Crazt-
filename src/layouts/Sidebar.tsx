import {
  Bookmark,
  BookOpen,
  Box,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GitBranch,
  Home,
  Layers,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import { PageRoute } from '../types/academic';

interface SidebarProps {
  activeRoute: PageRoute;
  collapsed: boolean;
  mobileOpen: boolean;
  savedCount: number;
  onNavigate: (route: PageRoute) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const NAV_ITEMS: {
  id: PageRoute;
  label: string;
  icon: typeof Home;
}[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'papers', label: 'Question Papers', icon: FileText },
  { id: 'vault-3d', label: '3D Vault', icon: Box },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'semesters', label: 'Semesters', icon: Layers },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'saved', label: 'Saved Papers', icon: Bookmark },
  { id: 'recent', label: 'Recently Added', icon: Clock },
  { id: 'contribute', label: 'Contribute Materials', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeRoute,
  collapsed,
  mobileOpen,
  savedCount,
  onNavigate,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const renderNavList = (isCollapsed: boolean) => (
    <nav aria-label="Primary navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeRoute === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onNavigate(item.id);
              onCloseMobile();
            }}
            title={isCollapsed ? item.label : undefined}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] ${
              isActive
                ? 'bg-[#2563EB]/18 text-[#F8FAFC] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.45),0_0_24px_-8px_rgba(37,99,235,0.65)]'
                : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                isActive ? 'text-[#60A5FA]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
              }`}
            />
            {!isCollapsed && (
              <span className="min-w-0 flex-1 truncate text-left whitespace-nowrap">
                {item.label}
              </span>
            )}
            {!isCollapsed && item.id === 'saved' && savedCount > 0 && (
              <span className="font-mono text-xs tabular-nums text-[#60A5FA]">
                {savedCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[#3B82F6]/16 bg-[#090F1C] transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[76px]' : 'w-[256px]'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-[#3B82F6]/14 px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-xl font-extrabold tracking-tight text-[#F8FAFC] whitespace-nowrap focus-visible:outline-none"
          >
            {collapsed ? (
              <span>
                C<span className="text-[#3B82F6]">!</span>
              </span>
            ) : (
              <span>
                CRAZY<span className="text-[#3B82F6]">!</span>
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-white/5 hover:text-[#F8FAFC]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {renderNavList(collapsed)}

        <div className="border-t border-[#3B82F6]/14 p-3">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="flex w-full items-center justify-center rounded-xl py-2 text-[#94A3B8] transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="rounded-xl border border-[#3B82F6]/15 bg-[#05070D]/70 px-3 py-2.5">
              <p className="font-mono text-[11px] font-medium text-[#60A5FA]">
                DEMO DATA MODE
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                Prototype UI ready for future Drive &amp; Supabase sync.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="fixed inset-0 bg-black/75"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-[#3B82F6]/20 bg-[#090F1C]">
            <div className="flex h-16 items-center justify-between border-b border-[#3B82F6]/16 px-5">
              <span className="font-display text-xl font-extrabold tracking-tight text-[#F8FAFC]">
                CRAZY<span className="text-[#3B82F6]">!</span>
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavList(false)}
          </div>
        </div>
      )}
    </>
  );
}
