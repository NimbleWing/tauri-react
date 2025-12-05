import { normalizeMeta } from '@/utils/music';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { cn, Checkbox, Button } from '@heroui/react';
import { ClockIcon, PlayIcon, GripVerticalIcon } from 'lucide-react';
import { memo } from 'react';
import { type Track, TrackCover } from '.';
import TrackPropertyText from './PropertyText';
import { AlbumLink } from '../Albums';
import { ArtistLink } from '../Artists';
export type DraggableProps = { provided: DraggableProvided; snapshot: DraggableStateSnapshot };
type TrackListItemProps = {
  data: Track;
  isPlaying?: boolean;
  isSelected?: boolean;
  index?: number;
  draggableProps?: DraggableProps;
  onPlay?: (data: Track) => void;
  onShowDetails?: (data: Track) => void;
  onToggleSelect?: (data: Track, previouslySelected?: boolean) => void;
};
const TrackListItem = memo(
  ({ data, isPlaying, isSelected, onPlay, onToggleSelect, draggableProps, onShowDetails }: TrackListItemProps) => {
    const meta = normalizeMeta(data);
    return (
      <div
        // TODO: a separate drag handle ?
        ref={draggableProps?.provided.innerRef}
        {...draggableProps?.provided.draggableProps}
        {...draggableProps?.provided.dragHandleProps}
        style={draggableProps?.provided.draggableProps.style}
        className={cn(
          'flex items-center gap-3 p-3 !cursor-default',
          draggableProps?.snapshot.isDragging &&
            'bg-secondary-50/25 border-secondary/10 border saturate-125 backdrop-blur-lg rounded-small cursor-grabbing',
        )}>
        {onToggleSelect && (
          <Checkbox
            color="success"
            radius="full"
            isSelected={isSelected}
            isDisabled={draggableProps?.snapshot.isDragging}
            onValueChange={() => onToggleSelect(data, isSelected)}
          />
        )}

        <Button
          isIconOnly
          radius="full"
          variant="flat"
          isDisabled={!onPlay}
          onPress={() => onPlay?.(data)}
          color={isPlaying ? 'success' : 'default'}>
          <PlayIcon className="text-lg" />
        </Button>

        <TrackCover
          url={data.cover}
          onClick={() => onShowDetails?.(data)}
          className={cn('size-16 mx-3', onShowDetails && 'cursor-pointer')}
        />

        <div className="flex flex-col gap-2 mr-auto">
          <div className="flex items-center gap-2">{meta.title}</div>

          <div className="flex items-center gap-2">
            <TrackPropertyText>
              <ClockIcon /> {meta.duration}
            </TrackPropertyText>

            {meta.album && meta.artist && (
              <>
                <AlbumLink className="pl-2 border-l border-default/30">{meta.album}</AlbumLink>
                <ArtistLink>{meta.artist}</ArtistLink>
              </>
            )}
          </div>
        </div>

        {draggableProps && <GripVerticalIcon className="text-lg text-default-300" />}
      </div>
    );
  },
  (prev, next) =>
    prev.data.hash === next.data.hash &&
    prev.isSelected === next.isSelected &&
    prev.isPlaying === next.isPlaying &&
    prev.index === next.index &&
    prev.draggableProps === next.draggableProps,
);
TrackListItem.displayName = 'TrackListItem';
export default TrackListItem;
