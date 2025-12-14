import { RouterProvider } from 'react-router';
import { ToastProvider } from '@heroui/react';
import { router } from './router';
import './App.css';
import { HeroUIProvider } from '@heroui/react';

function App() {
  return (
    <>
      <HeroUIProvider className="h-full">
        <RouterProvider router={router}></RouterProvider>
        <ToastProvider
          toastOffset={40}
          placement="top-center"
          toastProps={{ radius: 'sm', classNames: { description: 'whitespace-pre-wrap not-empty:pt-1' } }}
        />
      </HeroUIProvider>
    </>
  );
}

export default App;
