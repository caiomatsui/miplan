import { useState } from 'react';
import { useUIStore } from '../../store';
import { useTheme } from '../ThemeProvider';
import { LabelManager } from '../Board/LabelManager';

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
    <header className="h-12 flex-shrink-0 border-b border-border bg-background flex items-center px-4 z-30">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle sidebar"
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
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* App Title */}
      <h1 className="ml-4 font-semibold text-foreground">Miplan</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <button
        onClick={cycleTheme}
        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors mr-2"
        aria-label={getThemeLabel()}
        title={getThemeLabel()}
      >
        {getThemeIcon()}
      </button>

      {/* Labels Button */}
      {activeBoardId && (
        <button
          onClick={() => setIsLabelManagerOpen(true)}
          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors mr-2"
          title="Manage labels"
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Labels
        </button>
      )}

      {/* Import Button */}
      <button
        onClick={openImportModal}
        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
      >
        Import
      </button>

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
