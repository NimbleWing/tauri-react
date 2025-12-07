import { memo } from 'react';
import { Album } from '.';
import { Card, CardFooter } from '@heroui/react';
import { Disc3Icon } from 'lucide-react';
import { TrackCover } from '../Tracks';

type AlbumListItemProps = {
  data: Album[];
  columns: number;
  isSelected: boolean[];
  onOpen: (data: Album) => void;
};

export const AlbumListItem = memo(
  ({ data, onOpen, columns }: AlbumListItemProps) => {
    return (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {data.map(item => {
          return (
            <Card
              key={item.name}
              radius="none"
              shadow="none"
              isFooterBlurred
              className="aspect-square bg-transparent group isolate">
              <TrackCover
                className="size-full rounded-none"
                url={item.cover}
                placeholder={Disc3Icon}
                onClick={() => onOpen(item)}
              />

              <CardFooter
                className="absolute bg-background/60 bottom-0 z-10 py-2 px-3
                max-h-10 group-hover:max-h-full transition-[max-height]">
                <div className="text-small line-clamp-1 group-hover:line-clamp-none">{item.name}</div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  },
  (prev, next) =>
    prev.onOpen === next.onOpen &&
    prev.columns === next.columns &&
    prev.data.length === next.data.length &&
    prev.isSelected?.length === next.isSelected?.length &&
    !!prev.data.every((it, i) => it === next.data[i]) &&
    !!prev.isSelected?.every((it, i) => it === next.isSelected?.[i]),
);
AlbumListItem.displayName = 'AlbumListItem';
