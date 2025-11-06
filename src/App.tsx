import { RouterProvider } from 'react-router';
import { router } from './router';
import './App.css';
import { HeroUIProvider } from '@heroui/react';

function App() {
  return (
    <>
      <HeroUIProvider className="h-full">
        <RouterProvider router={router}></RouterProvider>
      </HeroUIProvider>
    </>
  );
}

export default App;
