import { useEffect, useState } from 'react';
import { useUIStore } from '../../store';
import { BoardList } from './BoardList';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

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
            className="fixed inset-0 z-40 animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
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
              <LayoutGrid className="h-3.5 w-3.5" />
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
            <LayoutGrid className="h-3.5 w-3.5" />
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
