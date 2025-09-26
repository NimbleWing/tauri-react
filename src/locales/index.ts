import { LANGUAGES } from '@/constants';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh-CN.json';
import enUS from './en-US.json';

i18n.use(initReactI18next).init({
  resources: {
    [LANGUAGES.ZH_CN]: {
      translation: zhCN,
    },
    [LANGUAGES.EN_US]: {
      translation: enUS,
    },
  },
  lng: LANGUAGES.EN_US,
  debug: true,
});

export default i18n;
