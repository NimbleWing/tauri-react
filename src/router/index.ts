import { createBrowserRouter } from 'react-router';
import Main from '@/features/Main';
import Settings from '@/features/Main/pages/Settings';
import { CommonLayout } from '@/components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Settings,
    children: [{ path: 'settings', Component: Settings }],
  },
  {
    path: '/settings',
    Component: Settings,
  },
]);
