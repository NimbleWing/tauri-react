import { VideoProbeDetailVo } from '@/lib/bindings/VideoProbeDetailVo';
import { invoke } from '@tauri-apps/api/core';

export const ProbeVideo = async (videoPath: string) => {
  return await invoke<VideoProbeDetailVo>('video_probe', { videoPath });
};
