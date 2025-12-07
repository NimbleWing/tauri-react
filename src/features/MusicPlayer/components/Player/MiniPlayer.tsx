import { Button } from '@heroui/react';
import { PictureInPicture2Icon, SquareArrowOutUpLeftIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router';
import useMusicPlayerStore from '../../store/musicPlayerStore';
import { Player } from './Player';

export const MiniPlayer = () => {
  const player = useMusicPlayerStore();
  return (
    <div
      className="fixed w-160 flex flex-col bottom-6 right-6 border border-default/30
      bg-background/25 backdrop-blur-lg z-50 rounded-small shadow-small overflow-hidden">
      <div className="flex items-center p-2 z-10 gap-1">
        <PictureInPicture2Icon className="text-lg text-default-300 mx-2" />
        <Button
          as={Link}
          to="/"
          isIconOnly
          size="sm"
          radius="sm"
          variant="light"
          className="ml-auto"
          onPress={() => player.setPlayerMaximized(true)}>
          <SquareArrowOutUpLeftIcon className="text-lg text-default-500" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="light"
          onPress={() => player.setMiniPlayerVisibility(false)}>
          <XIcon className="text-lg text-default-500" />
        </Button>
      </div>
      <Player mini />
    </div>
  );
};
