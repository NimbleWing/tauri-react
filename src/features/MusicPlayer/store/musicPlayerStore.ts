import { BackendPlayer, WebPlayer } from '../components/Player';
import type { Track } from '../pages/Tracks';
import type { Player } from '../components/Player';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Interval } from '@/utils/music';
import { addToast } from '@heroui/react';
export type Repeat = 'current' | 'all';
export type Template = 'emotions' | 'arbitrary';
type MusicPlayerStore = {
  queue: Track[];
  current: number;
  currentTrack: () => Track | null;
  elapsed: number;
  isPaused: boolean;
  repeat: Repeat | null;
  template: Template | null;
  isShuffled: boolean;
  // backup queue for reverting shuffle
  backupQueue: Track[];
  error?: Error | null;
  player: Player;
  isMiniPlayerVisible: boolean;
  isPlayerMaximized: boolean;
  volume: number;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (elapsed: number) => Promise<void>;
  setQueue: (queue: Track[]) => Promise<void>;
  setCurrent: (index: number) => Promise<void>;
  stop: () => Promise<void>;
  goto: (index: number, using?: Player) => Promise<void>;
  playTracks(data: Track | Track[], from?: number): Promise<void>;
  appendToQueue(tracks: Track[]): Promise<void>;
  setRepeat: (repeat: Repeat | null) => void;
  setVolume: (volume: number) => Promise<void>;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  isRepeatCurrent: () => boolean;
  togglePlay: () => Promise<void>;
  shuffle: () => Promise<void>;
  unShuffle: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  setPlayerMaximized: (maximized: boolean) => void;
  setMiniPlayerVisibility: (visible: boolean) => void;
};

const backendPlayer = new BackendPlayer();
const webPlayer = new WebPlayer();
const interval = new Interval(1000, onElapsed);

const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set, get) => ({
      queue: [],
      current: 0,
      elapsed: 0,
      isPaused: true,
      repeat: null,
      template: null,
      isShuffled: false,
      backupQueue: [],
      player: backendPlayer,
      isMiniPlayerVisible: false,
      isPlayerMaximized: false,
      volume: 1,
      setQueue: async (queue: Track[]) => {
        await backendPlayer.setQueue(queue);
        await webPlayer.setQueue(queue);
        set({ queue });
      },
      setCurrent: async (index: number) => {
        await backendPlayer.setCurrent(index);
        await webPlayer.setCurrent(index);
        set({ current: index });
      },
      setRepeat: (repeat: Repeat | null) => {
        set({ repeat });
      },
      setVolume: async (volume: number) => {
        await backendPlayer.setVolume(volume);
        await webPlayer.setVolume(volume);
        set({ volume });
      },
      currentTrack: () => {
        const { queue, current } = get();
        return queue.at(current) ?? null;
      },
      shuffle: async () => {
        const state = get();
        if (state.isShuffled) {
          return;
        }
        const shuffled = state.queue.toSorted(() => Math.random() - 0.5);
        const index = shuffled.findIndex(item => item === state.currentTrack());
        const backupQueue = state.queue;
        await state.setCurrent(index);
        await state.setQueue(shuffled);
        set({
          queue: shuffled,
          current: index,
          backupQueue,
          isShuffled: true,
        });
      },
      unShuffle: async () => {
        const state = get();
        const currentTrack = state.currentTrack();
        if (!state.isShuffled) {
          return;
        }
        const original = state.backupQueue;
        const index = original.findIndex(track => track === currentTrack);
        await state.setCurrent(index);
        await state.setQueue(original);
        set({
          queue: original,
          current: index,
          backupQueue: [],
          isShuffled: false,
        });
      },
      toggleShuffle: async () => {
        const state = get();
        if (state.isShuffled) {
          await state.unShuffle();
        } else {
          await state.shuffle();
        }
      },
      togglePlay: async () => {
        const { isPaused, play, pause } = get();
        console.log('togglePlay:', isPaused);
        return isPaused ? play() : pause();
      },
      hasNext: () => {
        const { queue, current, repeat } = get();
        if (repeat?.[0] === 'c') return true; // 单曲循环永远有“下一首”
        if (current + 1 < queue.length) return true; // 中间位置
        return !!repeat; // 在队尾时，只有 repeat 才允许跳到队头
      },
      hasPrev: () => {
        const { current, repeat } = get();
        if (repeat?.[0] === 'c') return true; // 单曲循环永远有“上一首”
        if (current > 0) return true; // 中间位置
        return !!repeat; // 在队首时，只有 repeat 才允许跳到队尾
      },
      isRepeatCurrent: () => {
        const { repeat } = get();
        return repeat?.[0] === 'c';
      },
      stop: async () => {
        await backendPlayer.stop();
        await webPlayer.stop();
      },
      pause: async () => {
        const state = get();
        if (state.isPaused || state.error) {
          console.log('已暂停，请勿重复点击', state.isPaused, state.error);
          return;
        }
        interval.stop();
        await state.player.pause();
        set({ isPaused: true });
      },
      play: async () => {
        const state = get();
        if (!state.isPaused || state.error) {
          console.log('播放中，请勿重复点击', state.isPaused, state.error);
          return;
        }
        await state.player.play();
        interval.start();
        set({ isPaused: false });
      },
      reset: async () => {
        const state = get();
        await state.setQueue([]);
        await state.setCurrent(0);
        await state.stop();
        interval.stop();
        set({
          queue: [],
          current: 0,
          elapsed: 0,
          isPaused: true,
          repeat: null,
          template: null,
          isShuffled: false,
          backupQueue: [],
          player: backendPlayer,
        });
      },
      next: async () => {
        const state = get();

        // 1. 计算下一索引
        const index = (() => {
          if (state.repeat?.[0] === 'c') return state.current; // 单曲循环
          if (state.current + 1 < state.queue.length) return state.current + 1;
          return state.repeat ? 0 : -1; // 列表循环 or 结束
        })();

        // 2. 到头则重置，否则跳转
        if (index === -1) {
          await state.reset(); // 你已有的 reset 方法
        } else {
          await state.goto(index);
        }
      },
      prev: async () => {
        const state = get();

        // 1. 计算上一索引
        const index = (() => {
          if (state.repeat?.[0] === 'c') return state.current; // 单曲循环
          if (state.current > 0) return state.current - 1;
          return state.repeat ? state.queue.length - 1 : -1; // 列表循环 or 结束
        })();

        // 2. 到头则重置，否则跳转
        if (index === -1) {
          await get().reset();
        } else {
          await get().goto(index);
        }
      },
      seek: async (elapsed: number) => {
        console.log('seek 到:', elapsed);
        const state = get();
        if (state.elapsed === elapsed) {
          return;
        }
        if (!state.isPaused) {
          interval.stop();
        }
        await state.player.seek(elapsed);
        if (!state.isPaused) {
          interval.start();
        }
        set({ elapsed });
      },
      goto: async (index: number, using?: Player) => {
        const state = get();
        if (!state.isPaused) {
          interval.stop();
        }
        const track = state.queue.at(index);
        const player = using ?? backendPlayer;
        if (player !== state.player) {
          state.player.stop();
        }
        try {
          await player.goto(index);
          if (!state.isPaused) {
            interval.start();
          }
          let queue = state.queue;
          try {
            if (player instanceof WebPlayer) {
              const newQueue = Array.from(queue);
              const duration = await player.getDuration();

              newQueue[index].duration = duration;
              queue = newQueue;
            }
            if (!state.isPaused) {
              await player.play();
            }
          } catch (error) {
            interval.stop();
            throw error;
          }
          set({ current: index, queue, elapsed: 0, error: null, player });
        } catch (error) {
          console.error(error, track);
          if (!using) {
            return await state.goto(index, webPlayer);
          }
          const err = error as Error;
          set({ current: index, elapsed: 0, error: err });
          addToast({ timeout: 5000, title: 'Track', description: err.message, color: 'danger' });
        }
      },
      playTracks: async (data: Track | Track[], from = 0) => {
        const state = get();
        console.log('是否暂停', state.isPaused);
        const queue = Array.isArray(data) ? data : [data];
        await backendPlayer.setQueue(queue);
        await webPlayer.setQueue(queue);
        set({ queue, isShuffled: false, backupQueue: [] });
        await state.goto(from);
        await state.play();
      },
      /* ---------- 追加队列（去重） ---------- */
      appendToQueue: async (tracks: Track[]) => {
        const state = get();

        // 1. 去重：过滤掉 queue 里已经存在的 track（按 hash 比对）
        const filtered = tracks.filter(track => !state.queue.some(item => item.hash === track.hash));
        if (!filtered.length) return; // 没有新内容，直接结束

        // 2. 生成新队列
        const newQueue = [...state.queue, ...filtered];

        // 3. 同步到底层播放器
        await backendPlayer.setQueue(newQueue);
        await webPlayer.setQueue(newQueue);

        // 4. 更新状态
        set({ queue: newQueue });
      },
      setPlayerMaximized: (maximized: boolean) => {
        set({ isPlayerMaximized: maximized });
      },
      setMiniPlayerVisibility: (visible: boolean) => {
        set({ isMiniPlayerVisible: visible });
      },
    }),
    {
      name: 'music-player-store',
      partialize: state => ({
        volume: state.volume,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
function onElapsed() {
  const state = useMusicPlayerStore.getState();
  const current = state.queue.at(state.current);
  if (!current) {
    return state.reset();
  }
  if (state.elapsed >= current.duration) {
    return state.next();
  }
  useMusicPlayerStore.setState(state => ({ elapsed: state.elapsed + 1 }));
}
export default useMusicPlayerStore;
export const musicPlayerStore = useMusicPlayerStore;
