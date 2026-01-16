import { useTrackSelection } from '../../hooks/useTrackSelection';
import { Button } from '@heroui/react';
import { Trash2Icon } from 'lucide-react';
import SelectAllControls from '../Tracks/SelectAllControls';
import TrackList from '../Tracks/List';
import TrackListItem from '../Tracks/ListItem';
import { DropResult } from '@hello-pangea/dnd';
import { reOrder } from '@/utils';
import useMusicPlayerStore from '../../store/musicPlayerStore';

export const Queue = () => {
  const player = useMusicPlayerStore();
  const selection = useTrackSelection();

  const onRemove = async () => {
    if (!player.current) return;

    if (!selection.values.length) return await player.reset();

    const filtered = player.queue.filter(track => !selection.isSelected(track));

    if (!filtered.length) await player.reset();
    else {
      await player.setQueue(filtered);
      const index = filtered.findIndex(track => track === player.currentTrack());

      if (index !== -1) {
        await player.setCurrent(index);
      } else {
        await player.goto(0);
        await player.pause();
      }
    }

    selection.clear();
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    const reordered = reOrder(player.queue, src, dst);
    const index = reordered.findIndex(it => it === player.currentTrack());

    await player.setQueue(reordered);
    await player.setCurrent(index);
  };

  return (
    <div className="flex flex-col size-full relative">
      <div
        className="px-6 h-16 flex items-center gap-3 rounded-small absolute top-[calc(theme(spacing.10)+theme(spacing.2))] left-0 right-3
        bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
        {selection.values.length > 0 && (
          <>
            <SelectAllControls data={player.queue} selection={selection} />
            <div className="h-5 border-r border-default/30" />
          </>
        )}

        <Button
          radius="sm"
          variant="flat"
          color="danger"
          className="!text-foreground"
          onPress={onRemove}
          isDisabled={!player.queue.length}>
          <Trash2Icon className="text-lg" /> Remove {selection.values.length > 0 ? 'Selected' : 'All'}
        </Button>
      </div>

      <TrackList data={player.queue} onDragEnd={onDragEnd}>
        {(item, index, draggableProps) => (
          <TrackListItem
            key={item.hash}
            index={index}
            data={item}
            isSelected={selection.isSelected(item)}
            isPlaying={player.currentTrack()?.hash === item.hash}
            onToggleSelect={selection.toggle}
            draggableProps={draggableProps}
            onPlay={async () => {
              await player.goto(index);
              await player.play();
            }}
          />
        )}
      </TrackList>
    </div>
  );
};
