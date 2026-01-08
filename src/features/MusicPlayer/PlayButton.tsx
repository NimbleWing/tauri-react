import { type Track } from './pages/Tracks';
import { Button, Tooltip } from '@heroui/react';
import { PauseIcon, PlayIcon } from 'lucide-react';

type PlayButtonProps = {
  isPaused: boolean;
  error?: Error | null;
  current?: Track | null;
  toggle: () => void;
};
export const PlayButton = ({ current, error, isPaused, toggle }: PlayButtonProps) => {
  return (
    <div className="relative">
      {error && (
        <Tooltip size="sm" radius="sm" className="bg-danger-100" content={error.message}>
          <div className="absolute inset-0 rounded-full" />
        </Tooltip>
      )}
      <Button
        isIconOnly
        radius="full"
        variant="flat"
        className="size-20"
        color={error ? 'danger' : 'secondary'}
        isDisabled={!current || !!error}
        onPress={toggle}>
        {isPaused ? <PlayIcon className="text-2xl" /> : <PauseIcon className="text-2xl" />}
      </Button>
    </div>
  );
};
