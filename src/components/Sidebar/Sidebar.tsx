import { useEffect, useState } from 'react';
import { useUIStore } from '../../store';
import { BoardList } from './BoardList';

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
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-12 left-0 h-[calc(100%-3rem)] w-[180px] bg-sidebar z-50 border-r border-border flex flex-col
            transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Boards List */}
          <div className="flex-1 p-2 overflow-y-auto">
            <h2 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Boards
            </h2>
            <nav className="mt-2">
              <BoardList onBoardSelect={toggleSidebar} />
            </nav>
          </div>
        </aside>
      </>
    );
  }

  // Desktop mode - collapsed/expanded
  const isCollapsed = !sidebarOpen;

  return (
    <aside
      className={`
        flex-shrink-0 bg-sidebar border-r border-border flex flex-col h-full
        transition-all duration-200
        ${isCollapsed ? 'w-12' : 'w-[180px]'}
      `}
    >
      {/* Boards List */}
      <div className="flex-1 p-2 overflow-y-auto">
        {!isCollapsed && (
          <h2 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Boards
          </h2>
        )}
        <nav className={isCollapsed ? '' : 'mt-2'}>
          <BoardList isCollapsed={isCollapsed} />
        </nav>
      </div>
    </aside>
  );
}
