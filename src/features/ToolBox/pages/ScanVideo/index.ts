import { invoke } from '@tauri-apps/api/core';

export * from './ScanVideo';

export const ScanVideoCMD = async (path: string): Promise<void> => {
  return await invoke('video_scan', { dto: { dirPath: path } });
};
