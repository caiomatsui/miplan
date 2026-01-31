import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  activeBoardId: string | null;
  activeTimerTaskId: string | null;
  selectedTaskId: string | null;
  sidebarOpen: boolean;
  importModalOpen: boolean;
  commandPaletteOpen: boolean;
  toast: ToastMessage | null;
}

interface UIActions {
  setActiveBoard: (id: string | null) => void;
  toggleSidebar: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setSelectedTask: (taskId: string | null) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      activeBoardId: null,
      activeTimerTaskId: null,
      selectedTaskId: null,
      sidebarOpen: true,
      importModalOpen: false,
      commandPaletteOpen: false,
      toast: null,

      // Actions
      setActiveBoard: (id) => set({ activeBoardId: id }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openImportModal: () => set({ importModalOpen: true }),
      closeImportModal: () => set({ importModalOpen: false }),
      startTimer: (taskId) => set({ activeTimerTaskId: taskId }),
      stopTimer: () => set({ activeTimerTaskId: null }),
      showToast: (message, type = 'success') => set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
      setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: 'miplan-ui-storage',
    }
  )
);
