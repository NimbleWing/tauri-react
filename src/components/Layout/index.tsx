import { useMediaQuery } from 'usehooks-ts';
import WindowControls from '../WindowControls';
import { SideBar } from './SideBar';
import { useBaseStore } from '@/store';
import { AxeIcon } from 'lucide-react';
import { Button } from '@heroui/react';
import { ScrollArea } from '../ScrollArea';
export const getFixedHeaderBackground = () => {
  if (document?.documentElement?.classList?.contains('dark')) {
    return '#00000080';
  }
  return '#ffffff80';
};
export const CommonLayout = () => {
  const isPc = useMediaQuery('(min-width: 768px)');
  const sideBarWidth = useBaseStore(state => state.sideBarWidth);
  return (
    <div className="flex w-full overflow-x-hidden">
      <WindowControls />
      {isPc && <SideBar></SideBar>}
      <main
        style={{ width: isPc ? `calc(100% - ${sideBarWidth}px)` : '100%' }}
        className={`flex !transition-all duration-300 overflow-y-hidden w-full flex-col gap-y-1 bg-secondbackground`}>
        <header
          className="blinko-mobile-header relative flex md:h-16 md:min-h-16 h-14 min-h-14 items-center justify-between gap-2 px-2 md:px:4 pt-2 md:pb-2 overflow-hidden"
          style={
            !isPc
              ? {
                  position: 'fixed',
                  top: 0,
                  borderRadius: '0 0 12px 12px',
                  zIndex: 11,
                  width: '100%',
                  background: getFixedHeaderBackground(),
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }
              : undefined
          }>
          <div className="flex max-w-full items-center gap-2 md:p-2 w-full z-[1]">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-[4px] h-[16px] bg-primary rounded-xl hidden md:block" />

                <div className="flex flex-row items-center gap-1">
                  <div className="font-black select-none">测试</div>
                  和谐
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:gap-4 w-auto ">这里有毒</div>
            </div>
          </div>
          <div>什么鬼</div>
        </header>
        <ScrollArea></ScrollArea>
      </main>
    </div>
  );
};
