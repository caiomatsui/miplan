import { useEffect } from 'react';
import { useUIStore } from '../store';

export function useKeyboardShortcuts() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }

      // Ctrl+B or Cmd+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleSidebar, openCommandPalette]);
}
