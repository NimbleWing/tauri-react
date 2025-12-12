import { Link, useNavigate } from 'react-router';
import useMusicPlayerStore from '../../store/musicPlayerStore';
import { addToast, Button, useDisclosure } from '@heroui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addPlaylist, addPlaylistTracks, getPlaylists, getPlaylistTracks } from '.';
import { CopyIcon, PlayIcon, PlusIcon } from 'lucide-react';
import PlaylistEditorModal from './PlaylistEditorModal';

export const Playlists = () => {
  const navigate = useNavigate();
  const player = useMusicPlayerStore();
  const editorModal = useDisclosure();

  const query = useQuery({ queryKey: ['playlists'], queryFn: getPlaylists });

  const mutationCopy = useMutation({
    mutationFn: async (src: string) => {
      const name = generateCopyName(src, query.data);
      await addPlaylist(name);

      const tracks = await getPlaylistTracks(src);
      await addPlaylistTracks(name, tracks);

      return name;
    },
    onSuccess: name => {
      query.refetch();
      navigate(`/music/playlists/${name}`);
    },
  });

  const onPlay = async (name: string) => {
    const tracks = await getPlaylistTracks(name);
    if (!tracks.length) return addToast({ title: 'Empty Playlist' });

    await player.playTracks(tracks);
    // player.setTemplate(null);

    // setPlayerMaximized(true);
    // setMiniPlayerVisibility(true);
  };

  return (
    <>
      <div className="pt-[calc(theme(spacing.10)+theme(spacing.2))] overflow-auto w-full flex flex-col h-full gap-2">
        <div
          className="px-6 py-3 flex items-center gap-3 rounded-small
          sticky top-0 inset-x-0 bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
          <Button radius="sm" variant="flat" onPress={editorModal.onOpen}>
            <PlusIcon className="text-lg" /> Create New
          </Button>
        </div>

        <div className="flex flex-col px-3 shrink-0 w-full relative divide-y divide-default/30">
          {query.isSuccess &&
            query.data.map(name => (
              <div key={name} className="flex items-center p-3 gap-3">
                <Button isIconOnly radius="full" variant="flat" color="secondary" onPress={() => onPlay(name)}>
                  <PlayIcon className="text-lg" />
                </Button>

                <Button
                  isIconOnly
                  radius="sm"
                  variant="light"
                  onPress={() => mutationCopy.mutate(name)}
                  isDisabled={mutationCopy.isPending && mutationCopy.variables === name}>
                  <CopyIcon className="text-medium text-default-500" />
                </Button>

                <Button
                  as={Link}
                  size="lg"
                  radius="sm"
                  variant="light"
                  to={`/music/playlists/${name}`}
                  className="min-w-60 justify-start">
                  {name}
                </Button>
              </div>
            ))}
        </div>
      </div>

      <PlaylistEditorModal
        type="new"
        isOpen={editorModal.isOpen}
        onOpenChange={editorModal.onOpenChange}
        onAction={async name => {
          await addPlaylist(name);
          await query.refetch();
          editorModal.onClose();
        }}
      />
    </>
  );
};
function generateCopyName(src: string, existing?: string[] | null) {
  let name = src + ' (Copy)';
  if (!existing?.includes(name)) return name;

  let i = 0;
  while (existing?.includes(name)) name = `${src} (Copy ${(i += 1)})`;

  return name;
}
