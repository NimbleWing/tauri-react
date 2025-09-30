import { create } from 'zustand';

export const useBaseStore = create(set => ({
  sideBarWidth: 200,
  updateSideBarWidth: (sideBarWidth: number) => set(() => ({ sideBarWidth })),
}));
