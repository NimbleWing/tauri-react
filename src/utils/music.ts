import { formatTime } from './time';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Track } from '@/features/MusicPlayer/pages/Tracks';
export const normalizeMeta = (track?: Track | null) => {
  return {
    duration: formatTime(track?.duration),
    title: track?.title ?? track?.name,
    artist: track?.artist,
    album: track?.album,
    albumArtist: track?.albumArtist,
    date: track?.date,
    genre: track?.genre,
  };
};

export const getAssetUrl = (path: string, updateTime: string) => {
  if (path.startsWith('http')) {
    return path;
  }
  return convertFileSrc(path) + `?t=${updateTime}`;
};

export function normalizeMediaError(error: MediaError | null) {
  switch (error?.code) {
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return new Error('Media source not supported or found');
    case MediaError.MEDIA_ERR_ABORTED:
      return new Error('Playback aborted');
    case MediaError.MEDIA_ERR_NETWORK:
      return new Error('Network error');
    case MediaError.MEDIA_ERR_DECODE:
      return new Error('Decoding error');
    default:
      return new Error('Unknown error');
  }
}
export type Timeout = ReturnType<typeof setInterval>;
export class Interval {
  id: Timeout | null = null;
  delay: number;
  fn: () => void;

  constructor(delay: number, fn: () => void) {
    this.delay = delay;
    this.fn = fn;
  }

  start() {
    if (this.id) clearInterval(this.id);
    this.id = setInterval(this.fn, this.delay);
  }

  stop() {
    if (this.id) clearInterval(this.id);
    this.id = null;
  }
}
