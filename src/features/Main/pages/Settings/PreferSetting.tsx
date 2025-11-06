import { CollapsibleCard } from '@/components/CollapsibleCard';
import { Item } from '@/components/Item';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PreferSetting = () => {
  const { t } = useTranslation();
  return (
    <CollapsibleCard title={t('Main.settings.preference')} icon={Settings2}>
      <Item leftContent={t('Main.preference.theme')} rightContent={<ThemeSwitcher />} />
      <Item leftContent={t('Main.preference.language')} rightContent={<LanguageSwitcher />} />
    </CollapsibleCard>
  );
};
