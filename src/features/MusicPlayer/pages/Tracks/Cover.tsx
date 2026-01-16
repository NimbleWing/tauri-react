import { localFileToUrl } from '@/utils/path';
import { cn, Image } from '@heroui/react';
import { LucideIcon, MusicIcon } from 'lucide-react';

type TrackCoverProps = {
  url?: string | null;
  className?: string;
  placeholder?: LucideIcon | (() => React.ReactNode);
  onClick?: () => void;
};
export const TrackCover = ({ url, className, placeholder: Placeholder = MusicIcon, onClick }: TrackCoverProps) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      {...(onClick && { type: 'button', onClick, disabled: !onClick })}
      className={cn('rounded-small overflow-hidden', onClick && 'cursor-pointer', className)}>
      {url ? (
        <Image
          isBlurred
          radius="none"
          shadow="none"
          width="100%"
          height="100%"
          loading="lazy"
          src={localFileToUrl(url)}
          classNames={{ wrapper: 'size-full', img: 'size-full object-contain' }}
        />
      ) : (
        <div className="size-full grid place-items-center bg-radial from-secondary-50/75 to-default-50/25">
          <Placeholder className="size-1/3 text-secondary-800 opacity-80" />
        </div>
      )}
    </Component>
  );
};
