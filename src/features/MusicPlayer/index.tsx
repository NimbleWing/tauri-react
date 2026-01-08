import { ScrollArea } from '@/components/ScrollArea';
import { SettingItem, TabItem } from '../Main/pages/Settings';
import { Settings2, Music as MusicIcon, Disc3Icon, UsersRoundIcon, ListVideoIcon, ListMusicIcon } from 'lucide-react';
import { MusicSettings } from './pages/Settings';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router';
import { MusicTrack } from './pages/Tracks';
import { Albums } from './pages/Albums';
import { Artists } from './pages/Artists';
import { Queue } from './pages/Queue';
import { Playlists } from './pages/Playlists';
import { MiniPlayer } from './components/Player/MiniPlayer';
import useMusicPlayerStore, { musicPlayerStore } from './store/musicPlayerStore';
import { useEffect } from 'react';
type MusicNavItem = SettingItem;
export const allMusicNavItems: MusicNavItem[] = [
  {
    key: 'tracks',
    title: 'MusicPlayer.sidebarNav.tracks',
    icon: MusicIcon,
    component: <MusicTrack />,
    requireAdmin: false,
    keywords: ['music', 'tracks'],
  },
  {
    key: 'albums',
    title: 'MusicPlayer.sidebarNav.albums',
    icon: Disc3Icon,
    component: <Albums />,
    requireAdmin: false,
    keywords: ['music', 'albums'],
  },
  {
    key: 'artists',
    title: 'MusicPlayer.sidebarNav.artists',
    icon: UsersRoundIcon,
    component: <Artists />,
    requireAdmin: false,
    keywords: ['music', 'artists'],
  },
  {
    key: 'queue',
    title: 'MusicPlayer.sidebarNav.queue',
    icon: ListVideoIcon,
    component: <Queue />,
    requireAdmin: false,
    keywords: ['music', 'queue'],
  },
  {
    key: 'playlists',
    title: 'MusicPlayer.sidebarNav.playlists',
    icon: ListMusicIcon,
    component: <Playlists />,
    requireAdmin: false,
    keywords: ['music', 'playlists'],
  },
  {
    key: 'settings',
    title: 'MusicPlayer.sidebarNav.settings',
    icon: Settings2,
    component: <MusicSettings />,
    requireAdmin: false,
    keywords: ['music'],
  },
];
const Music = () => {
  console.log('渲染 Music 组件');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMiniPlayerVisible = useMusicPlayerStore(s => s.isMiniPlayerVisible);
  useEffect(() => {
    const { volume } = musicPlayerStore.getState();
    console.log('恢复音量');
    musicPlayerStore.getState().setVolume(volume).catch(console.error);
  }, []);
  const getVisibleSettings = () => {
    return allMusicNavItems;
  };

  const tabItems: TabItem[] = getVisibleSettings().map(setting => ({
    key: setting.key,
    title: setting.title,
    icon: setting.icon,
  }));
  const isHome = location.pathname === '/';
  const canShowMiniPlayer = !isHome && !matchPath('/music/tracks/:hash', location.pathname);
  const showMiniPlayer = canShowMiniPlayer && isMiniPlayerVisible;

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
                        console.log(`/music/${item.key}`);
                        navigate(`/music/${item.key}`);
                      }}
                      variant={location.pathname.startsWith(`/music/${item.key}`) ? 'flat' : 'light'}
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
            <div className="mx-auto flex flex-col gap-6 h-full">
              <Outlet />
            </div>
          </ScrollArea>
          {showMiniPlayer && <MiniPlayer />}
        </div>
      </div>
    </div>
  );
};
export default Music;
