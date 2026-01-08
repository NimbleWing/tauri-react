import { invoke } from '@tauri-apps/api/core';
import { Player } from '.';
import { type Track } from '../../pages/Tracks';

export class BackendPlayer implements Player {
  async goto(index: number) {
    await invoke('mp_player_goto', { index });
  }

  async stop() {
    await invoke('mp_player_stop');
    await this.pause();
  }

  async seek(elapsed: number) {
    await invoke('mp_player_seek', { elapsed });
  }

  async pause() {
    await invoke('mp_player_pause');
  }

  async play() {
    await invoke('mp_player_play');
  }

  async setQueue(queue: Track[]) {
    await invoke('mp_player_set_queue', { queue: queue.map(t => t.path) });
  }

  async setCurrent(current: number) {
    await invoke('mp_player_set_current', { index: current });
  }

  async setVolume(volume: number) {
    await invoke('mp_player_set_volume', { volume });
  }
}
