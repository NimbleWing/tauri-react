import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import useMusicPlayerStore from '../../store/musicPlayerStore';
import { useTrackSelection } from '../../hooks/useTrackSelection';
import { Button, Code, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import { useEffect, useState } from 'react';
import { getPlaylistTracks, removePlaylist, removePlaylistTracks, renamePlaylist, reOrderPlaylistTracks } from '.';
import { useDebounceValue } from 'usehooks-ts';
import { createSearchIndex } from '../Albums';
import { Track } from '../Tracks';
import { DropResult } from '@hello-pangea/dnd';
import { reOrder } from '@/utils';
import SelectAllControls from '../Tracks/SelectAllControls';
import { CheckIcon, ListVideoIcon, MoveLeftIcon, PlayIcon, SquarePenIcon, Trash2Icon, TrashIcon } from 'lucide-react';
import SearchBar from '../Tracks/SearchBar';
import TrackList from '../Tracks/List';
import TrackListItem from '../Tracks/ListItem';
import PlaylistEditorModal from './PlaylistEditorModal';
import { type EditorType } from '.';
const searchIndex = createSearchIndex();

export const Playlist = () => {
  const params = useParams<{ name: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const player = useMusicPlayerStore();
  const selection = useTrackSelection();
  const editorModal = useDisclosure();
  const removeSelectedTracksModal = useDisclosure();
  const [editorType, setEditorType] = useState<EditorType | null>(null);

  const queryPlaylistTracks = useQuery({
    queryKey: ['playlist-tracks', params.name],
    queryFn: async () => await getPlaylistTracks(params.name!),
    enabled: !!params.name,
  });

  const map = new Map(queryPlaylistTracks.data?.map(t => [t.hash, t]) ?? []);
  const [filtered, setFiltered] = useState(queryPlaylistTracks.data ?? []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounceValue(searchQuery, 500);

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) return setFiltered(queryPlaylistTracks.data ?? []);

    const data = searchIndex
      .search(debouncedSearchQuery)
      .map(it => map.get(it.id))
      .filter(Boolean) as Track[];

    setFiltered(data);
  }, [queryPlaylistTracks.data, debouncedSearchQuery]);

  useEffect(() => {
    searchIndex.removeAll();
    searchIndex.addAll(queryPlaylistTracks.data ?? []);
  }, [queryPlaylistTracks.data]);

  const onDragEnd = async (result: DropResult) => {
    if (!params.name || !result.destination) return;

    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    setFiltered(state => reOrder(state, src, dst));

    await reOrderPlaylistTracks(params.name, filtered[src], src, dst);
  };

  const onPlay = async (data: Track | Track[]) => {
    await player.playTracks(data);
  };

  const onRemoveTracks = async () => {
    if (!params.name || !selection.values.length) return;

    await removePlaylistTracks(params.name, selection.values);
    await queryPlaylistTracks.refetch();

    selection.clear();
  };
  return (
    <div className="flex flex-col size-full relative">
      <div
        className="px-6 h-16 flex items-center gap-3 rounded-small absolute top-[calc(theme(spacing.10)+theme(spacing.2))] left-0 right-3
        bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
        {selection.values.length > 0 ? (
          <>
            <SelectAllControls data={filtered} selection={selection} />
            <div className="h-5 border-r border-default/30" />

            <Button
              radius="sm"
              variant="flat"
              color="danger"
              className="!text-foreground"
              onPress={removeSelectedTracksModal.onOpen}>
              <Trash2Icon className="text-lg" /> Remove Selected
            </Button>

            <Button
              radius="sm"
              variant="flat"
              onPress={async () => {
                await player.appendToQueue(selection.values);
                selection.clear();
              }}>
              <ListVideoIcon className="text-lg" /> Add to Queue
            </Button>
          </>
        ) : (
          <>
            <Button as={Link} to="/music/playlists" isIconOnly radius="sm" variant="flat">
              <MoveLeftIcon className="text-lg" />
            </Button>

            <Button
              radius="sm"
              variant="flat"
              color="secondary"
              isDisabled={!filtered.length}
              onPress={() => {
                if (filtered.length > 0) onPlay(filtered);
              }}>
              <PlayIcon className="text-lg" /> Play All
            </Button>

            <div className="text-large px-6 border-x border-default/30 min-w-40">{params.name}</div>

            <Button
              radius="sm"
              variant="flat"
              size="sm"
              onPress={() => {
                setEditorType('update');
                editorModal.onOpen();
              }}>
              <SquarePenIcon className="text-medium text-default-500" /> Edit
            </Button>

            <Button
              radius="sm"
              variant="flat"
              color="danger"
              size="sm"
              className="!text-foreground"
              onPress={() => {
                setEditorType('remove');
                editorModal.onOpen();
              }}>
              <TrashIcon className="text-medium" /> Remove
            </Button>

            <SearchBar value={searchQuery} onChange={setSearchQuery} className="w-120 ml-auto" />
          </>
        )}
      </div>
      <TrackList
        data={filtered}
        onDragEnd={onDragEnd}
        isDragDisabled={filtered.length !== queryPlaylistTracks.data?.length}>
        {(item, index, draggableProps) => (
          <TrackListItem
            key={item.hash}
            index={index}
            data={item}
            onPlay={onPlay}
            isSelected={selection.isSelected(item)}
            isPlaying={player.currentTrack()?.hash === item.hash}
            onToggleSelect={selection.toggle}
            draggableProps={draggableProps}
          />
        )}
      </TrackList>

      <Modal
        radius="sm"
        backdrop="blur"
        placement="bottom-center"
        isOpen={removeSelectedTracksModal.isOpen}
        onOpenChange={removeSelectedTracksModal.onOpenChange}>
        <ModalContent>
          <ModalHeader>Remove Selected Tracks</ModalHeader>

          <ModalBody>
            <div className="text-default-500">
              Are you sure you want to remove
              <Code radius="sm" className="mx-1.5">
                {selection.values.length}
              </Code>
              track{selection.values.length > 1 && 's'} from this playlist?
            </div>
          </ModalBody>

          <ModalFooter>
            <Button radius="sm" variant="flat" onPress={onRemoveTracks} color="danger">
              <CheckIcon className="text-lg" /> Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {params.name && (
        <>
          <PlaylistEditorModal
            type="remove"
            isOpen={editorModal.isOpen && editorType === 'remove'}
            onOpenChange={editorModal.onOpenChange}
            existing={params.name}
            onAction={async name => {
              await removePlaylist(name);
              await queryClient.invalidateQueries({ queryKey: ['playlists'] });

              navigate('/music/playlists');
            }}
          />

          <PlaylistEditorModal
            type="update"
            isOpen={editorModal.isOpen && editorType === 'update'}
            onOpenChange={editorModal.onOpenChange}
            onAction={async newName => {
              if (!params.name) return;
              await renamePlaylist(params.name, newName);

              editorModal.onClose();
              navigate(`/music/playlists/${newName}`);
            }}
          />
        </>
      )}
    </div>
  );
};
