import { createBrowserRouter } from 'react-router';
import Settings from '@/features/Main/pages/Settings';
import { CommonLayout } from '@/components/Layout';
import Home from '@/features/Main/pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: CommonLayout,
    children: [
      { path: 'home', Component: Home },
      { path: 'settings', Component: Settings },
    ],
  },
]);
