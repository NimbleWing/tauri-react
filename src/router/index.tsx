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
      { path: '/settings', Component: Settings },
    ],
  },
]);
