import { Track } from '@/store/musicStore';

export type Player = {
  goto(index: number): Promise<void>;
  seek(elapsed: number): Promise<void>;
  pause(): Promise<void>;
  play(): Promise<void>;
  stop(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setQueue(queue: Track[]): Promise<void>;
  setCurrent(current: number): Promise<void>;
};

export * from './BackendPlayer';
export * from './WebPlayer';
