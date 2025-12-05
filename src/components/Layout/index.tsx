import WindowControls from '../WindowControls';
import { SideBar } from './SideBar';
import { ScrollArea } from '../ScrollArea';
import { Outlet } from 'react-router';
export const getFixedHeaderBackground = () => {
  if (document?.documentElement?.classList?.contains('dark')) {
    return '#00000080';
  }
  return '#ffffff80';
};
export const CommonLayout = () => {
  const showBars = true;
  return (
    <>
      <div
        data-tauri-drag-region
        className="flex items-center pointer-events-auto fixed inset-x-0 top-0 z-100 bg-default-50/25 backdrop-blur-lg backdrop-saturate-125">
        <div className="ml-auto"></div>
        <WindowControls />
      </div>
      <div className="flex h-full">
        {showBars && <SideBar />}
        <main
          style={{ width: `calc(100% - 50px)` }}
          className="pt-[calc(theme(spacing.10))] overflow-auto w-full flex flex-col h-full gap-2">
          <ScrollArea className="h-[calc(100%_-_70px)] !overflow-y-auto overflow-x-hidden mt-[-4px]">
            <div className="relative flex h-full w-full flex-col rounded-medium layout-container">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </>
  );
};
