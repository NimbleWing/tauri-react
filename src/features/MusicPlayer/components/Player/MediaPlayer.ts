import { localFileToUrl } from '@/utils/path';
import { normalizeMediaError } from '@/utils/music';

export class MediaPlayer {
  core: HTMLAudioElement; // | HTMLVideoElement
  error: Error | null = null;

  constructor(core: HTMLAudioElement) {
    this.core = core;

    this.core.addEventListener('error', () => {
      this.error = normalizeMediaError(this.core.error);
    });
  }

  load(src: string | null) {
    this.core.src = src ? localFileToUrl(src) : '';
    this.core.load();
  }

  seek(elapsed: number) {
    this.core.currentTime = elapsed;
  }

  async getDuration() {
    return new Promise<number>((resolve, reject) => {
      const resolveData = () => resolve(Math.round(this.core.duration));
      if (!isNaN(this.core.duration)) return resolveData();

      this.core.addEventListener('loadedmetadata', resolveData, { once: true });
      this.core.addEventListener('error', () => reject(normalizeMediaError(this.core.error)), { once: true });
    });
  }

  async play() {
    console.log(this.core);
    this.core.play();
  }

  pause() {
    this.core.pause();
  }

  setVolume(volume: number) {
    this.core.volume = volume;
  }
}
