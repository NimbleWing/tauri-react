import { ScrollArea } from '@/components/ScrollArea';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SettingItem, TabItem } from '../Main/pages/Settings';
import { Settings2, TagIcon, User, Video } from 'lucide-react';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Performers } from './pages/Performers';
import { Studios } from './pages/Studios';
import { Tags } from './pages/Tags';
import { HYPSettings } from './pages/Settings';

type HYPNavItem = SettingItem;
export const allHYPNavItems: HYPNavItem[] = [
  {
    key: 'performers',
    title: 'HYP.sidebarNav.performers',
    icon: User,
    component: <Performers />,
    requireAdmin: false,
    keywords: ['hyp', 'performers'],
  },
  {
    key: 'studios',
    title: 'HYP.sidebarNav.studios',
    icon: Video,
    component: <Studios />,
    requireAdmin: false,
    keywords: ['hyp', 'studios'],
  },
  {
    key: 'tags',
    title: 'HYP.sidebarNav.tags',
    icon: TagIcon,
    component: <Tags />,
    requireAdmin: false,
    keywords: ['hyp', 'tags'],
  },
  {
    key: 'settings',
    title: 'HYP.sidebarNav.settings',
    icon: Settings2,
    component: <HYPSettings />,
    requireAdmin: false,
    keywords: ['hyp', 'settings'],
  },
];
export const HYP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const getVisibleSettings = () => {
    return allHYPNavItems;
  };
  const tabItems: TabItem[] = getVisibleSettings().map(setting => ({
    key: setting.key,
    title: setting.title,
    icon: setting.icon,
  }));
  return (
    <div className="h-full flex flex-col">
      <div className="w-full mx-auto px-4 py-4 flex flex-row h-full">
        <div className="w-56 mr-6">
          <div className="rounded-xl bg-background p-1 mb-4">
            <ScrollArea className="h-auto max-h-[calc(100vh-140px)]">
              <div className="p-1 flex flex-col flex-nowrap gap-1">
                {tabItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.key}
                      className="justify-start"
                      onPress={() => {
                        navigate(`/hyp/${item.key}`);
                      }}
                      variant={location.pathname.startsWith(`/hyp/${item.key}`) ? 'flat' : 'light'}
                      fullWidth
                      radius="sm">
                      <Icon className="mr-2 text-lg" />
                      <span className="font-bold">{typeof item.title === 'string' ? t(item.title) : item.title}</span>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full !overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex flex-col gap-6 h-full">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
