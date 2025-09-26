import { createHashRouter } from 'react-router';
import Main from '@/pages/Main';

export const router = createHashRouter([
  {
    path: '/',
    Component: Main,
  },
]);
