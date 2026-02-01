import { useEffect, useState } from 'react';
import { useUIStore } from '../../store';
import { BoardList } from './BoardList';
import { cn } from '@/lib/utils';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Mobile overlay mode
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-14 left-0 h-[calc(100%-3.5rem)] w-[240px]',
            'bg-sidebar z-50',
            'border-r border-sidebar-border',
            'flex flex-col shadow-xl',
            'transform transition-transform duration-200 ease-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Section Header */}
          <div className="px-4 pt-4 pb-2">
            <h2 className={cn(
              'flex items-center gap-2',
              'text-[11px] font-semibold uppercase tracking-wider',
              'text-muted-foreground'
            )}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Boards
            </h2>
          </div>

          {/* Boards List */}
          <nav className="flex-1 px-2 pb-3 overflow-y-auto">
            <BoardList onBoardSelect={toggleSidebar} />
          </nav>
        </aside>
      </>
    );
  }

  // Desktop mode
  const isCollapsed = !sidebarOpen;

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-full',
        'bg-sidebar',
        'border-r border-sidebar-border',
        'flex flex-col',
        'transition-all duration-200 ease-out',
        isCollapsed ? 'w-0 overflow-hidden' : 'w-[220px]'
      )}
    >
      {/* Section Header */}
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-2">
          <h2 className={cn(
            'flex items-center gap-2',
            'text-[11px] font-semibold uppercase tracking-wider',
            'text-muted-foreground'
          )}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Boards
          </h2>
        </div>
      )}

      {/* Boards List */}
      <nav className={cn(
        'flex-1 overflow-y-auto',
        isCollapsed ? 'px-1 py-2' : 'px-2 pb-3'
      )}>
        <BoardList isCollapsed={isCollapsed} />
      </nav>
    </aside>
  );
}
