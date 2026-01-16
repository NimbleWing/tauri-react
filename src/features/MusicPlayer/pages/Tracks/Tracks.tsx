import type { Track } from './index.ts';
import useMusicPlayerStore from '../../store/musicPlayerStore.ts';
import {
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  useDisclosure,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ListMusicIcon, ListVideoIcon, MoveLeftIcon, PlayIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import TrackList from './List.tsx';
import TrackListItem from './ListItem.tsx';
import { useTrackSelection } from '../../hooks/useTrackSelection.ts';
import { addPlaylist, addPlaylistTracks, getPlaylists } from '../Playlists/index.ts';
import PlaylistEditorModal from '../Playlists/PlaylistEditorModal.tsx';
import { getTracks, parseFilters } from './index.ts';

export const MusicTrack = () => {
  console.log('渲染 MusicTrack 组件');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { album, artist } = parseFilters(searchParams);
  const query = useQuery<Track[]>({
    queryKey: ['tracks', album, artist],
    queryFn: async () => await getTracks({ album, artist }),
  });
  const sort = (tracks: Track[] = []) => {
    if (!album) return tracks;
    return [...tracks].sort((a, b) => {
      const aNum = a.number ?? undefined;
      const bNum = b.number ?? undefined;

      // 两者都无效，保持原序
      if (aNum === undefined && bNum === undefined) return 0;
      // a 无效，排后面
      if (aNum === undefined) return 1;
      // b 无效，排后面
      if (bNum === undefined) return -1;

      // 两者都有效，正常排序
      return aNum - bNum;
    });
  };
  const [filtered, setFiltered] = useState(() => sort(query.data));
  useEffect(() => {
    setFiltered(sort(query.data));
  }, [query.data]);

  const playTracks = useMusicPlayerStore(s => s.playTracks);
  const setPlayerMaximized = useMusicPlayerStore(s => s.setPlayerMaximized);
  const setMiniPlayerVisibility = useMusicPlayerStore(s => s.setMiniPlayerVisibility);
  const appendToQueue = useMusicPlayerStore(s => s.appendToQueue);
  // const trackDetails = useTrackDetails();
  const onPlay = async (data: Track | Track[]) => {
    await playTracks(data);
    // player.setTemplate(null);
    setPlayerMaximized(true);
    setMiniPlayerVisibility(true);
  };
  const selection = useTrackSelection();
  const playlistEditorModal = useDisclosure();
  const queryPlaylists = useQuery({ queryKey: ['playlists'], queryFn: getPlaylists });
  const playlists = queryPlaylists.data ?? [];
  return (
    <div className="flex flex-col size-full  h-full relative">
      <div
        className="px-6 h-16 flex items-center gap-3 rounded-small absolute top-[calc(theme(spacing.10)+theme(spacing.2))] left-0 right-3
        bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
        {selection.values.length > 0 ? (
          <>
            <Button radius="sm" variant="flat" color="secondary" onPress={() => onPlay(selection.values)}>
              <PlayIcon className="text-lg" /> Play
            </Button>
            <Button
              radius="sm"
              variant="flat"
              onPress={async () => {
                await appendToQueue(selection.values);
                selection.clear();
              }}>
              <ListVideoIcon className="text-lg" /> Add to Queue
            </Button>
            <Dropdown radius="sm" backdrop="opaque">
              <DropdownTrigger>
                <Button radius="sm" variant="flat">
                  <PlusIcon className="text-lg" /> Add to Playlist
                </Button>
              </DropdownTrigger>

              <DropdownMenu variant="flat">
                <DropdownSection showDivider={playlists.length > 0} className={cn(!playlists.length && 'mb-0')}>
                  <DropdownItem
                    key="new"
                    startContent={<ListMusicIcon className="text-lg" />}
                    onPress={playlistEditorModal.onOpen}>
                    New Playlist
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection className="mb-0">
                  {playlists.map(name => (
                    <DropdownItem
                      key={name}
                      onPress={async () => {
                        await addPlaylistTracks(name, selection.values);
                        selection.clear();
                        navigate(`/music/playlists/${name}`);
                      }}>
                      {name}
                    </DropdownItem>
                  ))}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <>
            {(album || artist) && (
              <Button as={Link} isIconOnly radius="sm" variant="flat" to={album ? '/music/albums' : '/music/artists'}>
                <MoveLeftIcon className="text-lg" />
              </Button>
            )}
            <Button
              radius="sm"
              variant="flat"
              color="secondary"
              className="mr-auto"
              isDisabled={!filtered.length}
              onPress={() => {
                if (filtered.length > 0) onPlay(filtered);
              }}>
              <PlayIcon className="text-lg" /> Play All
            </Button>
          </>
        )}
      </div>

      <TrackList data={filtered}>
        {(item, index, draggableProps) => (
          <TrackListItem
            key={item.hash}
            index={index}
            data={item}
            onPlay={onPlay}
            isSelected={selection.isSelected(item)}
            onToggleSelect={selection.toggle}
            draggableProps={draggableProps}
          />
        )}
      </TrackList>
      <PlaylistEditorModal
        type="new"
        isOpen={playlistEditorModal.isOpen}
        onOpenChange={playlistEditorModal.onOpenChange}
        onAction={async name => {
          await addPlaylist(name);
          await addPlaylistTracks(name, selection.values);
          playlistEditorModal.onClose();
          selection.clear();
          navigate(`/music/playlists/${name}`);
        }}
      />
    </div>
  );
};
