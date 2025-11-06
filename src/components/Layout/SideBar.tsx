import { ScrollShadow } from '@heroui/react';
import { HomeIcon, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import NavLink from '@/components/NavLink';
import { useBaseStore } from '@/store';
import { useTranslation } from 'react-i18next';
export const SideBar = () => {
  const isPc = useMediaQuery('(min-width: 768px)');
  const sideBarWidth = useBaseStore(state => state.sideBarWidth);
  const { t } = useTranslation();
  useEffect(() => {
    console.log(isPc);
    if (!isPc) {
      console.log('isPc', isPc);
    }
  }, [isPc]);
  return (
    <div
      style={{ width: isPc ? `${sideBarWidth}px` : '100%' }}
      className="flex flex-col gap-2 p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))] h-full w-44">
      <ScrollShadow className="-mr-[16px] mt-[-5px] h-full max-h-full pr-6 hide-scrollbar">
        <div className={`flex flex-col gap-1 mt-4 font-semibold }`}>
          <NavLink url="/home" title={t('Main.sidebarNav.home')} icon={HomeIcon} />
          <NavLink url="/settings" title={t('Main.sidebarNav.settings')} icon={Settings} />
        </div>
      </ScrollShadow>
      {/* ***** background *****  */}
      <div className="halation absolute inset-0 h-[250px] w-[250px] overflow-hidden blur-3xl z-[0] pointer-events-none">
        <div className="w-full h-[100%] bg-[#ffc65c] opacity-20" style={{ clipPath: 'circle(35% at 50% 50%)' }}></div>
      </div>
    </div>
  );
};
