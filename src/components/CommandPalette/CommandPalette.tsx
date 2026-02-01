import { useMemo, useCallback, useEffect, useState } from 'react';
import { Command, CommandItem } from '../ui/Command';
import { useUIStore } from '../../store';
import { useBoards } from '../../hooks/useBoard';
import { useTasks } from '../../hooks/useTasks';
import { useTheme } from '../ThemeProvider';
import { Columns3, ClipboardCheck, Zap, Trash2, Sun, Moon, Menu } from 'lucide-react';

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
            icon = <Columns3 className="w-4 h-4" />;
            onSelect = () => handleNavigateToBoard(recent.id.replace('board-', ''));
            break;
          case 'task':
            icon = <ClipboardCheck className="w-4 h-4" />;
            onSelect = () => handleSelectTask(recent.id.replace('task-', ''));
            break;
          default:
            icon = <Zap className="w-4 h-4" />;
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
        icon: <Trash2 className="w-4 h-4" />,
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
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
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
      icon: <Menu className="w-4 h-4" />,
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
        icon: <Columns3 className="w-4 h-4" />,
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
        icon: <ClipboardCheck className="w-4 h-4" />,
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
