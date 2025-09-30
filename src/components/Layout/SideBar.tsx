import { Button, ScrollShadow } from '@heroui/react';
import { HomeIcon, IdCardIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useMediaQuery } from 'usehooks-ts';
import NavLink from '@/components/NavLink';
import { useBaseStore } from '@/store';
export const SideBar = () => {
  const isPc = useMediaQuery('(min-width: 768px)');
  // @ts-expect-error
  const sideBarWidth = useBaseStore(state => state.sideBarWidth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isHovering, setIsHovering] = useState(false);
  const routerInfo = {
    pathname: location.pathname,
    searchParams,
  };
  useEffect(() => {
    console.log(isPc);
    if (!isPc) {
      console.log('isPc', isPc);
    }
  }, [isPc]);
  return (
    <div
      style={{ width: isPc ? `${sideBarWidth}px` : '100%' }}
      className="flex h-full flex-1 flex-col p-4 relative bg-background group/sidebar"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      <div className="flex items-center justify-center">
        <div className="flex w-full items-center ">
          {isPc ? (
            <Button
              isIconOnly
              variant="light"
              className={`opacity-0 group-hover/sidebar:opacity-100 ml-auto opacity-100 translate-x-0}`}>
              <IdCardIcon />
            </Button>
          ) : (
            <Button isIconOnly variant="light" className="ml-auto">
              <IdCardIcon />
            </Button>
          )}
        </div>
      </div>
      <ScrollShadow className="-mr-[16px] mt-[-5px] h-full max-h-full pr-6 hide-scrollbar">
        <div className={`flex flex-col gap-1 mt-4 font-semibold }`}>
          <NavLink url="/" title="Home" icon={HomeIcon} />
          <NavLink url="/settings" title="App" icon={HomeIcon} />
        </div>
      </ScrollShadow>
      <div className="halation absolute inset-0 h-[250px] w-[250px] overflow-hidden blur-3xl z-[0] pointer-events-none">
        <div className="w-full h-[100%] bg-[#ffc65c] opacity-20" style={{ clipPath: 'circle(35% at 50% 50%)' }}></div>
      </div>
    </div>
  );
};
