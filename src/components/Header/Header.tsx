import { useState } from 'react';
import { useUIStore } from '../../store';
import { useTheme } from '../ThemeProvider';
import { LabelManager } from '../Board/LabelManager';
import { cn } from '@/lib/utils';

export function Header() {
  const { toggleSidebar, openImportModal, activeBoardId } = useUIStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    if (resolvedTheme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System theme';
    if (theme === 'dark') return 'Dark theme';
    return 'Light theme';
  };

  return (
    <header className={cn(
      'h-14 flex-shrink-0',
      'border-b border-border/50',
      'bg-background/80 backdrop-blur-sm',
      'flex items-center px-4',
      'z-30 sticky top-0'
    )}>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'p-2.5 rounded-lg',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-accent',
          'transition-all duration-150',
          'active:scale-95',
          'tooltip-container'
        )}
        aria-label="Toggle sidebar (Ctrl+B)"
        data-tooltip="Toggle sidebar · Ctrl+B"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* App Title with Logo */}
      <div className="ml-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Miplan</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons group */}
      <div className="flex items-center gap-1">
        {/* Labels Button */}
        {activeBoardId && (
          <button
            onClick={() => setIsLabelManagerOpen(true)}
            className={cn(
              'px-3 py-2 rounded-lg',
              'text-sm font-medium',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent',
              'transition-all duration-150',
              'flex items-center gap-1.5',
              'active:scale-95',
              'tooltip-container'
            )}
            aria-label="Manage labels - organize tasks with color-coded tags"
            data-tooltip="Manage labels"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="hidden sm:inline">Labels</span>
          </button>
        )}

        {/* Import Button */}
        <button
          onClick={openImportModal}
          className={cn(
            'px-3 py-2 rounded-lg',
            'text-sm font-medium',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent',
            'transition-all duration-150',
            'flex items-center gap-1.5',
            'active:scale-95',
            'tooltip-container'
          )}
          aria-label="Import tasks from CSV or JSON files"
          data-tooltip="Import tasks"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            'p-2.5 rounded-lg',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent',
            'transition-all duration-150',
            'active:scale-95',
            'tooltip-container'
          )}
          aria-label={`${getThemeLabel()} - click to change`}
          data-tooltip={getThemeLabel()}
        >
          {getThemeIcon()}
        </button>
      </div>

      {/* Label Manager Modal */}
      {activeBoardId && (
        <LabelManager
          boardId={activeBoardId}
          isOpen={isLabelManagerOpen}
          onClose={() => setIsLabelManagerOpen(false)}
        />
      )}
    </header>
  );
}
