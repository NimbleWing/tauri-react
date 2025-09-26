import { createHashRouter } from 'react-router';
import Main from '@/features/Main';

export const router = createHashRouter([
  {
    path: '/',
    Component: Main,
  },
]);
