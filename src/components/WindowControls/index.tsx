import { Button, Tooltip } from '@heroui/react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { CopyIcon, MinusIcon, PinIcon, SquareIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WindowControls = () => {
  const currentWindow = getCurrentWindow();
  const { t } = useTranslation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOnTop, setIsOnTop] = useState(false);
  // 初始化时获取置顶和最大化状态，并监听窗口事件
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    (async () => {
      setIsOnTop(await currentWindow.isAlwaysOnTop());
      setIsMaximized(await currentWindow.isMaximized());

      unlisten = await currentWindow.onResized(async () => {
        const maximized = await currentWindow.isMaximized();
        setIsMaximized(maximized);
        if (maximized) {
          await currentWindow.setAlwaysOnTop(false);
          setIsOnTop(false);
        }
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [currentWindow]);

  // 切换置顶
  const handleToggleAlwaysOnTop = async () => {
    if (isMaximized) return; // 最大化时不可点击
    await currentWindow.setAlwaysOnTop(!isOnTop);
    setIsOnTop(!isOnTop);
  };
  return (
    <>
      <Tooltip content={t(isOnTop ? 'ButtonTip.notAlwaysOnTop' : 'ButtonTip.alwaysOnTop')}>
        <Button
          radius="none"
          variant="light"
          className="min-w-12 text-default-500 text-lg"
          isDisabled={isMaximized}
          onPress={handleToggleAlwaysOnTop}>
          <PinIcon
            className={
              isMaximized
                ? 'text-gray-400 text-lg opacity-50'
                : isOnTop
                  ? 'text-yellow-500 text-lg'
                  : 'text-default-500 text-lg'
            }
          />
        </Button>
      </Tooltip>

      <Tooltip content={t('ButtonTip.minimize')} placement="bottom">
        <Button variant="light" radius="none" className="min-w-12" onPress={() => currentWindow.minimize()}>
          <MinusIcon className="text-lg text-default-500" />
        </Button>
      </Tooltip>

      <Tooltip content={t(isMaximized ? 'ButtonTip.minimize' : 'ButtonTip.maximize')} placement="bottom">
        <Button
          radius="none"
          variant="light"
          className="min-w-12 text-default-500 text-lg"
          onPress={() => {
            currentWindow.toggleMaximize();
            setIsMaximized(!isMaximized);
          }}>
          {isMaximized ? (
            <CopyIcon className=" text-lg text-default-500 scale-x-[-1]" />
          ) : (
            <SquareIcon className="text-lg text-default-500" />
          )}
        </Button>
      </Tooltip>

      <Tooltip content={t('ButtonTip.close')} placement="bottom">
        <Button
          isIconOnly
          color="danger"
          variant="light"
          radius="none"
          className="min-w-12"
          onPress={() => currentWindow.close()}>
          <XIcon className="text-lg text-default-500" />
        </Button>
      </Tooltip>
    </>
  );
};
export default WindowControls;
