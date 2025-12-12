import type { DraggableProvided, DraggableRubric, DraggableStateSnapshot, DropResult } from '@hello-pangea/dnd';
import type { Track } from '.';
import TrackListItem from './ListItem';
import { ContainerProps, HeaderProps, SortableVirtualList } from './SortableVirtualList';
export type OnDragEnd = (result: DropResult) => void;
export type DraggableProps = { provided: DraggableProvided; snapshot: DraggableStateSnapshot };
export type SortableListChildren<T> = (item: T, index: number, draggableProps?: DraggableProps) => React.ReactNode;
export type RenderDraggableClone = (
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
  rubric: DraggableRubric,
) => React.ReactNode;
type TrackListProps = {
  data: Track[];
  isDragDisabled?: boolean;
  onDragEnd?: OnDragEnd;
  children: SortableListChildren<Track>;
};

const TrackList = ({ data, children, onDragEnd, isDragDisabled }: TrackListProps) => {
  console.log('渲染 TrackList 组件，数据量:', data.length);
  const renderClone: RenderDraggableClone = (provided, snapshot, rubric) => (
    <TrackListItem data={data[rubric.source.index]} draggableProps={{ provided, snapshot }} />
  );
  return (
    <SortableVirtualList
      data={data}
      onDragEnd={onDragEnd}
      isDragDisabled={isDragDisabled}
      getItemKey={getKey}
      // eslint-disable-next-line react/no-children-prop
      children={children}
      renderClone={renderClone}
      components={{ Container: ListContainer, Header: ListHeader }}
    />
  );
};
export default TrackList;
function getKey(item: Track) {
  return item.hash;
}
function ListContainer(props: ContainerProps) {
  return <div {...props} className="flex flex-col gap-1 px-3 shrink-0 w-full divide-y divide-default/30" />;
}

function ListHeader(props: HeaderProps) {
  return <div {...props} className="h-[calc(theme(spacing.10)+theme(spacing.16)+theme(spacing.4))]" />;
}
