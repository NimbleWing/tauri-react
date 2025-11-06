import { CollapsibleCard } from '@/components/CollapsibleCard';
import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AboutSetting = () => {
  const { t } = useTranslation();
  return (
    <CollapsibleCard title={t('Main.settings.about')} icon={CircleAlert}>
      <div className="flex items-start space-x-4 mb-6">s</div>
    </CollapsibleCard>
  );
};
