import { ScrollArea } from '@/components/ScrollArea';
import { CircleAlert, LucideIcon, Settings2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AboutSetting } from './AboutSetting';
import { Link } from 'react-router';
import { Button } from '@heroui/react';
import { PreferSetting } from './PreferSetting';
export type SettingItem = {
  key: string;
  title: string;
  icon: LucideIcon;
  component: JSX.Element;
  requireAdmin: boolean;
  keywords?: string[];
};
export type TabItem = {
  key: string;
  title: string | React.ReactNode;
  icon: LucideIcon;
  avatar?: string;
};
export const allSettings: SettingItem[] = [
  {
    key: 'prefer',
    title: 'Main.settings.preference',
    icon: Settings2,
    component: <PreferSetting />,
    requireAdmin: false,
    keywords: ['preference', 'theme', 'language', '偏好设置', '主题', '语言'],
  },
  {
    key: 'about',
    title: 'Main.settings.about',
    icon: CircleAlert,
    component: <AboutSetting />,
    requireAdmin: false,
    keywords: ['about', 'information', '关于', '信息'],
  },
];
const Settings = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>('about');
  const getVisibleSettings = () => {
    return allSettings;
  };
  const getCurrentComponent = () => {
    const setting = allSettings.find(s => s.key === selected);
    return setting ? <div key={setting.key}>{setting.component}</div> : null;
  };
  const tabItems: TabItem[] = getVisibleSettings().map(setting => ({
    key: setting.key,
    title: setting.title,
    icon: setting.icon,
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-4 flex flex-row h-full">
        <div className="w-56 mr-6">
          <div className="rounded-xl bg-background p-1 mb-4">
            <ScrollArea className="h-auto max-h-[calc(100vh-140px)]">
              <div className="p-1 flex flex-col flex-nowrap gap-1">
                {tabItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.key}
                      as={Link}
                      className="justify-start"
                      onPress={() => setSelected(item.key)}
                      variant={selected === item.key ? 'flat' : 'light'}
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
          <ScrollArea className="h-full">
            <div className="max-w-[900px] mx-auto flex flex-col gap-6">{getCurrentComponent()}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
export default Settings;
