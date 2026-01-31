import { useMemo, useCallback, useEffect, useState } from 'react';
import { Command, CommandItem } from '../ui/Command';
import { useUIStore } from '../../store';
import { useBoards } from '../../hooks/useBoard';
import { useTasks } from '../../hooks/useTasks';
import { useTheme } from '../ThemeProvider';

const RECENT_ITEMS_KEY = 'miplan-command-recent';
const MAX_RECENT_ITEMS = 5;
const MAX_TASKS_SHOWN = 10;
const MAX_BOARDS_SHOWN = 5;

interface RecentItem {
  id: string;
  type: 'action' | 'board' | 'task';
  label: string;
}

function getRecentItems(): RecentItem[] {
  try {
    const stored = localStorage.getItem(RECENT_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentItem(item: RecentItem): void {
  const recent = getRecentItems();
  // Remove if already exists
  const filtered = recent.filter((r) => r.id !== item.id);
  // Add to front
  filtered.unshift(item);
  // Keep only max items
  const trimmed = filtered.slice(0, MAX_RECENT_ITEMS);
  localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(trimmed));
}

function clearRecentItems(): void {
  localStorage.removeItem(RECENT_ITEMS_KEY);
}

export function CommandPalette() {
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);
  const setActiveBoard = useUIStore((state) => state.setActiveBoard);
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);
  const activeBoardId = useUIStore((state) => state.activeBoardId);

  const { resolvedTheme, setTheme } = useTheme();
  const boards = useBoards();
  const tasks = useTasks(activeBoardId);

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load recent items when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setRecentItems(getRecentItems());
    }
  }, [commandPaletteOpen]);

  const handleSelectItem = useCallback(
    (item: RecentItem, onSelect: () => void) => {
      addRecentItem(item);
      onSelect();
    },
    []
  );

  const handleToggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  const handleNavigateToBoard = useCallback(
    (boardId: string) => {
      setActiveBoard(boardId);
    },
    [setActiveBoard]
  );

  const handleSelectTask = useCallback(
    (taskId: string) => {
      setSelectedTask(taskId);
    },
    [setSelectedTask]
  );

  const handleClearRecent = useCallback(() => {
    clearRecentItems();
    setRecentItems([]);
  }, []);

  const items: CommandItem[] = useMemo(() => {
    const result: CommandItem[] = [];

    // Recent items (shown when there are recents)
    if (recentItems.length > 0) {
      recentItems.forEach((recent) => {
        let onSelect: () => void;
        let icon: React.ReactNode;

        switch (recent.type) {
          case 'board':
            icon = (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            );
            onSelect = () => handleNavigateToBoard(recent.id.replace('board-', ''));
            break;
          case 'task':
            icon = (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            );
            onSelect = () => handleSelectTask(recent.id.replace('task-', ''));
            break;
          default:
            icon = (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            );
            onSelect = () => {
              if (recent.id === 'toggle-theme') handleToggleTheme();
            };
        }

        result.push({
          id: `recent-${recent.id}`,
          label: recent.label,
          icon,
          group: 'Recent',
          onSelect: () => handleSelectItem(recent, onSelect),
        });
      });

      // Add clear recent option
      result.push({
        id: 'clear-recent',
        label: 'Clear Recent Items',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        group: 'Recent',
        onSelect: handleClearRecent,
      });
    }

    // Actions
    result.push({
      id: 'toggle-theme',
      label: resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark theme',
      icon: resolvedTheme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      group: 'Actions',
      shortcut: navigator.platform.includes('Mac') ? '⌘T' : 'Ctrl+T',
      onSelect: () =>
        handleSelectItem(
          { id: 'toggle-theme', type: 'action', label: resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' },
          handleToggleTheme
        ),
    });

    result.push({
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      group: 'Actions',
      shortcut: navigator.platform.includes('Mac') ? '⌘B' : 'Ctrl+B',
      onSelect: () => {
        useUIStore.getState().toggleSidebar();
      },
    });

    // Boards
    const boardsToShow = boards?.slice(0, MAX_BOARDS_SHOWN) || [];
    boardsToShow.forEach((board) => {
      const isCurrent = board.id === activeBoardId;
      result.push({
        id: `board-${board.id}`,
        label: board.name,
        description: isCurrent ? 'Current board' : `${board.type} board`,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        ),
        group: 'Boards',
        onSelect: () =>
          handleSelectItem(
            { id: `board-${board.id}`, type: 'board', label: board.name },
            () => handleNavigateToBoard(board.id)
          ),
      });
    });

    // Tasks (from current board)
    const tasksToShow = tasks?.slice(0, MAX_TASKS_SHOWN) || [];
    tasksToShow.forEach((task) => {
      result.push({
        id: `task-${task.id}`,
        label: task.title,
        description: task.description?.slice(0, 50) || undefined,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
        group: 'Tasks',
        onSelect: () =>
          handleSelectItem(
            { id: `task-${task.id}`, type: 'task', label: task.title },
            () => handleSelectTask(task.id)
          ),
      });
    });

    return result;
  }, [
    recentItems,
    boards,
    tasks,
    activeBoardId,
    resolvedTheme,
    handleSelectItem,
    handleToggleTheme,
    handleNavigateToBoard,
    handleSelectTask,
    handleClearRecent,
  ]);

  return (
    <Command
      open={commandPaletteOpen}
      onClose={closeCommandPalette}
      items={items}
      placeholder="Search tasks, boards, or actions..."
      emptyMessage="No results found. Try a different search."
    />
  );
}
