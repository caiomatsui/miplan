import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  activeBoardId: string | null;
  activeTimerTaskId: string | null;
  sidebarOpen: boolean;
  importModalOpen: boolean;
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
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      activeBoardId: null,
      activeTimerTaskId: null,
      sidebarOpen: true,
      importModalOpen: false,
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
    }),
    {
      name: 'miplan-ui-storage',
    }
  )
);
