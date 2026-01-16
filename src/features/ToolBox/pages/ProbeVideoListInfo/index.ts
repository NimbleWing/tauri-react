import { invoke } from '@tauri-apps/api/core';

export const ProbeVideoList = async (videoDir: string) => {
  return await invoke('video_list_probe', { videoDir });
};
