import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';
import { ScrollArea } from '@/components/ScrollArea';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SettingItem, TabItem } from '../Main/pages/Settings';
import { Video } from 'lucide-react';
import { VideoTool } from './pages/Video';
import { ScanVideo } from './pages/ScanVideo';
import { ProbeVideoInfo } from './pages/ProbeVideoInfo/ProbeVideoInfo';
import { ProbeVideoListInfo } from './pages/ProbeVideoListInfo/ProbeVideoListInfo';
type ToolBoxNavItem = SettingItem;
export const allToolBoxNavItems: ToolBoxNavItem[] = [
  {
    key: 'videoTool',
    title: 'ToolBox.sidebarNav.video',
    icon: Video,
    component: <VideoTool />,
    requireAdmin: false,
    keywords: ['toolbox', 'video'],
  },
  {
    key: 'videoScan',
    title: 'ToolBox.sidebarNav.videoScan',
    icon: Video,
    component: <ScanVideo />,
    requireAdmin: true,
    keywords: ['toolbox', 'video', 'scan'],
  },
  {
    key: 'videoProbe',
    title: 'ToolBox.sidebarNav.videoProbe',
    icon: Video,
    component: <ProbeVideoInfo />,
    requireAdmin: true,
    keywords: ['toolbox', 'video', 'probe'],
  },
  {
    key: 'videoListProbe',
    title: 'ToolBox.sidebarNav.videoListProbe',
    icon: Video,
    component: <ProbeVideoListInfo />,
    requireAdmin: true,
    keywords: ['toolbox', 'video list', 'probe'],
  },
];
export const ToolBox = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const getVisibleSettings = () => {
    return allToolBoxNavItems;
  };
  const tabItems: TabItem[] = getVisibleSettings().map(setting => {
    return {
      key: setting.key,
      title: setting.title,
      icon: setting.icon,
    };
  });
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
                        navigate(`/toolbox/${item.key}`);
                      }}
                      variant={location.pathname.startsWith(`/toolbox/${item.key}`) ? 'flat' : 'light'}
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
