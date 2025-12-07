import { Track } from '@/store/musicStore';
import { Player } from '.';
import { MediaPlayer } from './MediaPlayer';

export class WebPlayer implements Player {
  player: MediaPlayer;
  queue: string[] = [];
  current = 0;

  constructor() {
    this.player = new MediaPlayer(new Audio());

    // DEBUG - show controls
    // this.player.controls = true
    // document.body.appendChild(this.player)
  }

  async goto(index: number) {
    this.current = index;
    this.player.load(this.queue[index]);
  }

  async stop() {
    this.player.load(null);
    await this.pause();
  }

  async seek(elapsed: number) {
    this.player.seek(elapsed);
  }

  async pause() {
    this.player.pause();
  }

  async play() {
    await this.player.play();
  }

  async setQueue(queue: Track[]) {
    this.queue = queue.map(t => t.path);
  }

  async setCurrent(current: number) {
    this.current = current;
  }

  async setVolume(volume: number) {
    this.player.setVolume(volume);
  }

  async getDuration() {
    return await this.player.getDuration();
  }
}
