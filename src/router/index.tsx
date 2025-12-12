import { createBrowserRouter, Navigate } from 'react-router';
import Settings from '@/features/Main/pages/Settings';
import { CommonLayout } from '@/components/Layout';
import Home from '@/features/Main/pages/Home';
import Music from '@/features/MusicPlayer';
import { MusicTrack } from '@/features/MusicPlayer/pages/Tracks';
import { MusicSettings } from '@/features/MusicPlayer/pages/Settings';
import { Albums } from '@/features/MusicPlayer/pages/Albums';
import { Artists } from '@/features/MusicPlayer/pages/Artists';
import { Queue } from '@/features/MusicPlayer/pages/Queue';
import { Playlists, Playlist } from '@/features/MusicPlayer/pages/Playlists';
import { HYP } from '@/features/HYP';
import { Tags, Performers, Studios, HYPSettings } from '@/features/HYP';
import { ToolBox } from '@/features/ToolBox/ToolBox';
import { VideoTool } from '@/features/ToolBox/pages/Video';
import { ScanVideo } from '@/features/ToolBox/pages/ScanVideo';
import { ProbeVideoInfo } from '@/features/ToolBox/pages/ProbeVideoInfo/ProbeVideoInfo';
import { ProbeVideoListInfo } from '@/features/ToolBox/pages/ProbeVideoListInfo/ProbeVideoListInfo';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: CommonLayout,
    children: [
      { path: '/home', Component: Home },
      {
        path: '/music',
        Component: Music,

        children: [
          {
            index: true, // Matches the exact parent path ("/")
            Component: () => <Navigate to="/music/tracks" replace />, // Immediately redirects to "/home"
          },
          { path: 'tracks', Component: MusicTrack },
          { path: 'tracks/:hash', Component: MusicTrack },
          { path: 'albums', Component: Albums },
          { path: 'artists', Component: Artists },
          { path: 'queue', Component: Queue },
          { path: 'playlists', Component: Playlists },
          { path: 'playlists/:name', Component: Playlist },
          { path: 'settings', Component: MusicSettings },
        ],
      },
      {
        path: '/hyp',
        Component: HYP,
        children: [
          { path: 'settings', Component: HYPSettings },
          { path: 'tags', Component: Tags },
          { path: 'performers', Component: Performers },
          { path: 'studios', Component: Studios },
        ],
      },
      {
        path: '/toolbox',
        Component: ToolBox,
        children: [
          { path: 'videoTool', Component: VideoTool },
          { path: 'videoScan', Component: ScanVideo },
          { path: 'videoProbe', Component: ProbeVideoInfo },
          { path: 'videoListProbe', Component: ProbeVideoListInfo },
        ],
      },
      { path: '/settings', Component: Settings },
    ],
  },
]);
