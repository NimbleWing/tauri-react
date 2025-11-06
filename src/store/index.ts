import { create } from 'zustand';
import i18n from '@/locales';
interface BaseState {
  sideBarWidth: number;
  updateSideBarWidth: (sideBarWidth: number) => void;
  locales: Array<{
    value: string;
    label: string;
  }>;
  locale: string;
  updateLocale: (locale: string) => void;
}
export const useBaseStore = create<BaseState>(set => ({
  sideBarWidth: 220,
  updateSideBarWidth: (sideBarWidth: number) => set(() => ({ sideBarWidth })),
  locales: [
    {
      value: 'en-US',
      label: 'English',
    },
    {
      value: 'zh-CN',
      label: '中文',
    },
  ],
  locale: 'en-US',
  updateLocale: (locale: string) => {
    i18n.changeLanguage(locale);
    set(() => ({ locale }));
  },
}));
