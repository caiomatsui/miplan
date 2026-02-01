import { useState } from 'react';
import { useUIStore } from '../../store';
import { useTheme } from '../ThemeProvider';
import { LabelManager } from '../Board/LabelManager';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sun, Moon, Monitor, Menu, Tag, Upload, ClipboardList } from 'lucide-react';

export function Header() {
  const { toggleSidebar, toggleImportModal, importModalOpen, activeBoardId } = useUIStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  const toggleLabelManager = () => setIsLabelManagerOpen(prev => !prev);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
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
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleSidebar}
            className={cn(
              'p-2.5 rounded-lg',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent',
              'transition-all duration-150',
              'active:scale-95'
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle sidebar <kbd className="kbd">Ctrl+B</kbd></p>
        </TooltipContent>
      </Tooltip>

      {/* App Title with Logo */}
      <div className="ml-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <ClipboardList className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-base font-semibold text-foreground tracking-tight">Miplan</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons group */}
      <div className="flex items-center gap-1">
        {/* Labels Button */}
        {activeBoardId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleLabelManager}
                aria-expanded={isLabelManagerOpen}
                className={cn(
                  'px-3 py-2 rounded-lg',
                  'text-sm font-medium',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-accent',
                  'transition-all duration-150',
                  'flex items-center gap-1.5',
                  'active:scale-95',
                  isLabelManagerOpen && 'bg-accent text-foreground'
                )}
                aria-label="Manage labels"
              >
                <Tag className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Labels</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage labels</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Import Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleImportModal}
              aria-expanded={importModalOpen}
              className={cn(
                'px-3 py-2 rounded-lg',
                'text-sm font-medium',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent',
                'transition-all duration-150',
                'flex items-center gap-1.5',
                'active:scale-95',
                importModalOpen && 'bg-accent text-foreground'
              )}
              aria-label="Import tasks"
            >
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Import</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import tasks <kbd className="kbd">I</kbd></p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={cycleTheme}
              className={cn(
                'p-2.5 rounded-lg',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent',
                'transition-all duration-150',
                'active:scale-95'
              )}
              aria-label={getThemeLabel()}
            >
              {getThemeIcon()}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme <kbd className="kbd">T</kbd></p>
          </TooltipContent>
        </Tooltip>
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
