import { useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Board } from './components/Board/Board';
import { ImportModal } from './components/Import/ImportModal';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { Toast } from './components/ui/Toast';
import { useBoards, useBoardActions } from './hooks/useBoard';
import { useColumnActions } from './hooks/useColumns';
import { useUIStore } from './store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { BOARD_TEMPLATES } from './constants/boardTemplates';

function App() {
  const boards = useBoards();
  const { createBoard } = useBoardActions();
  const { createColumn } = useColumnActions();
  const { setActiveBoard, importModalOpen, closeImportModal, toast, showToast, hideToast } = useUIStore();
  const initializingRef = useRef(false);

  const handleImportSuccess = useCallback((count: number) => {
    showToast(`${count} task${count !== 1 ? 's' : ''} imported`);
  }, [showToast]);

  // Enable keyboard shortcuts (Ctrl+B for sidebar toggle)
  useKeyboardShortcuts();

  // Auto-create default board on first visit
  useEffect(() => {
    const initializeDefaultBoard = async () => {
      // Prevent multiple initializations
      if (initializingRef.current) return;

      // Wait for boards to be loaded (undefined = loading, [] = loaded empty)
      if (boards === undefined) return;

      // If boards exist, select the first one if none is active
      if (boards.length > 0) {
        const activeBoardId = useUIStore.getState().activeBoardId;
        if (!activeBoardId || !boards.find(b => b.id === activeBoardId)) {
          setActiveBoard(boards[0].id);
        }
        return;
      }

      // No boards exist, create the default one
      initializingRef.current = true;

      try {
        const template = BOARD_TEMPLATES.kanban;
        const boardId = await createBoard('My Board', 'kanban');

        // Create columns from template
        for (const columnTitle of template.columns) {
          await createColumn(boardId, columnTitle);
        }

        // Set as active board
        setActiveBoard(boardId);
      } catch (error) {
        console.error('Failed to create default board:', error);
        initializingRef.current = false;
      }
    };

    initializeDefaultBoard();
  }, [boards, createBoard, createColumn, setActiveBoard]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Fixed Header at top */}
      <Header />

      {/* Main content area with Sidebar and Board */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Board />
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={closeImportModal}
        onSuccess={handleImportSuccess}
      />

      {/* Command Palette */}
      <CommandPalette />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default App;
