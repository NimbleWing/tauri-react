import { getAssetUrl, normalizeMeta } from '@/utils/music';
import useMusicPlayerStore from '../../store/musicPlayerStore';
// import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, cn, Image } from '@heroui/react';
import { TrackCover } from '../../pages/Tracks';
import { SeekBar } from '../../SeekBar';
import { formatTime } from '@/utils';
import {
  AudioLinesIcon,
  LetterTextIcon,
  Repeat1Icon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from 'lucide-react';
import { PlayButton } from '../../PlayButton';
import { Link } from 'react-router';
import { AlbumLink } from '../../pages/Albums';
import { ArtistLink } from '../../pages/Artists';
type PlayerProps = { mini?: boolean };

export const Player = ({ mini }: PlayerProps) => {
  console.log('渲染 Player 组件');
  const player = useMusicPlayerStore();
  const meta = normalizeMeta(player.currentTrack());
  const isPlayerMaximized = player.isPlayerMaximized;

  // const queryLyrics = useQuery({
  //   queryKey: ['lyrics', player.currentTrack()?.hash],
  //   queryFn: async () => await getLyrics(player.current!),
  //   enabled: !!player.current,
  // });

  const [showLyrics, setShowLyrics] = useState(false);

  return (
    <div
      className={cn('flex flex-col items-center justify-center h-full isolate', mini && 'pb-6 pt-3')}
      onDoubleClick={() => {
        if (!mini) player.setPlayerMaximized(!isPlayerMaximized);
      }}>
      {(isPlayerMaximized || mini) && player.currentTrack()?.cover && (
        <div className="fixed -inset-10 -z-10 brightness-25 saturate-50 blur-2xl">
          <Image
            removeWrapper
            src={getAssetUrl(player.currentTrack()?.cover || '')}
            className="size-full object-cover"
          />
        </div>
      )}

      {mini ? (
        <div className="flex w-full px-8 gap-3">
          <TrackCover url={player.currentTrack()?.cover} className="size-40 shrink-0" />

          <div className="flex flex-col gap-2">
            {meta.title && <div className="text-large">{meta.title}</div>}

            {meta.album && <AlbumLink>{meta.album}</AlbumLink>}
            {meta.artist && <ArtistLink>{meta.artist}</ArtistLink>}
          </div>
        </div>
      ) : (
        <>
          {/* {!showLyrics || !queryLyrics.data ? (
            <TrackCover url={player.current?.cover} className="size-80" />
          ) : !queryLyrics.data.synced ? (
            <PlainLyricsView data={queryLyrics.data.plain} className="size-full" />
          ) : (
            <SyncedLyricsView
              data={queryLyrics.data.synced}
              elapsed={player.elapsed}
              duration={player.current?.duration}
              onSeek={player.seek}
              className="h-80"
            />
          )} */}

          <div className="flex items-center gap-2 w-4/5 p-3 mt-16">
            {meta.title && <div className="text-large mr-auto">{meta.title}</div>}

            {/* {meta.album && <AlbumLink>{meta.album}</AlbumLink>}
            {meta.artist && <ArtistLink>{meta.artist}</ArtistLink>} */}
          </div>
        </>
      )}

      <div
        className={cn('flex flex-col mx-auto gap-3', mini ? 'w-full p-8' : 'w-4/5 p-3')}
        onDoubleClick={evt => evt.stopPropagation()}>
        <SeekBar
          onSeek={player.seek}
          elapsed={player.elapsed}
          duration={player.currentTrack()?.duration}
          isDisabled={!player.current || !!player.error}
        />

        <div className="flex justify-between">
          <div className="text-small">{formatTime(player.elapsed)}</div>
          <div className="text-small text-default-500">{meta.duration}</div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-3 group" onDoubleClick={evt => evt.stopPropagation()}>
        {!mini && (
          <Button
            size="sm"
            radius="sm"
            // isDisabled={!queryLyrics.data}
            variant={showLyrics ? 'flat' : 'light'}
            onPress={() => setShowLyrics(!showLyrics)}
            className={cn(
              'w-28 mr-10 tracking-widest',
              isPlayerMaximized &&
                'opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:disabled:opacity-50',
            )}>
            <LetterTextIcon className="text-medium text-default-500 shrink-0" /> LYRICS
          </Button>
        )}

        <Button
          isIconOnly
          radius="full"
          isDisabled={!player.current}
          variant={player.repeat ? 'flat' : 'light'}
          color={player.isRepeatCurrent() ? 'warning' : 'default'}
          onPress={() => {
            if (!player.repeat) player.setRepeat('all');
            else if (player.isRepeatCurrent()) player.setRepeat(null);
            else player.setRepeat('current');
          }}>
          {player.isRepeatCurrent() ? <Repeat1Icon className="text-lg" /> : <RepeatIcon className="text-lg" />}
        </Button>

        <Button isIconOnly radius="full" variant="light" size="lg" onPress={player.prev} isDisabled={!player.hasPrev}>
          <SkipBackIcon className="text-xl" />
        </Button>

        <PlayButton
          toggle={player.togglePlay}
          current={player.currentTrack()}
          isPaused={player.isPaused}
          error={player.error}
        />

        <Button isIconOnly radius="full" variant="light" size="lg" onPress={player.next} isDisabled={!player.hasNext}>
          <SkipForwardIcon className="text-xl" />
        </Button>

        <Button
          isIconOnly
          radius="full"
          isDisabled={!player.current}
          variant={player.isShuffled ? 'flat' : 'light'}
          color={player.isShuffled ? 'warning' : 'default'}
          onPress={player.toggleShuffle}>
          <ShuffleIcon className="text-lg" />
        </Button>

        {!mini && (
          <Button
            as={Link}
            size="sm"
            radius="sm"
            variant="light"
            isDisabled={!player.current}
            className={cn(
              'w-28 ml-10 tracking-widest',
              isPlayerMaximized &&
                'opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:disabled:opacity-50',
            )}
            to={`/tracks/${player.currentTrack()?.hash}`}>
            <AudioLinesIcon className="text-medium text-default-500 shrink-0" /> MANAGE
          </Button>
        )}
      </div>
    </div>
  );
};
