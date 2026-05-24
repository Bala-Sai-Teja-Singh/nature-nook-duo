import { create } from 'zustand';

interface UiState {
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  adminSidebarOpen: false,
  setAdminSidebarOpen: (open) => set({ adminSidebarOpen: open }),
}));
