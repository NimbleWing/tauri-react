import NavLink from '@/components/NavLink';
import WindowControls from '@/components/WindowControls';
import { Button, cn } from '@heroui/react';
import { LayoutGridIcon, SettingsIcon, Skull } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

const Main = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname !== '/';
  return (
    <>
      <div
        data-tauri-drag-region
        className={cn(
          'flex items-center pointer-events-auto fixed inset-x-0 top-0 z-100 bg-default-50/25 backdrop-blur-lg backdrop-saturate-125',
        )}>
        <Button as={Link} to="/" radius="none" className="text-lg px-7" variant={isHome ? 'flat' : 'light'}>
          <Skull className="text-lg text-secondary-600" /> {t('Main.title')}
        </Button>
        <span className="ml-auto" />
        <WindowControls />
      </div>
      <div className="flex h-full">
        <div className="flex flex-col gap-2 p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))] h-full w-44">
          <NavLink url="/" title={t('Main.sidebarNav.app')} icon={LayoutGridIcon} />
          <NavLink url="/settings" title={t('Main.sidebarNav.settings')} icon={SettingsIcon} className="mt-auto" />
        </div>
      </div>
    </>
  );
};

export default Main;
