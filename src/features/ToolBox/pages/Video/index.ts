import { invoke, convertFileSrc } from '@tauri-apps/api/core';

export * from './Video';

// export async function AttatchMetadataAndCoverToVideo()
export type VideoMetadata = {
  title: string;
  subtitle?: string;
  performers: string;
  studio?: string;
  code?: string;
  rating: string;
  country: string;
  tags: string;
};
export const AttachMetadataAndCoverToVideo = async (
  videoPath: string,
  saveDir: string,
  metadata: VideoMetadata,
  coverPath?: string,
): Promise<void> => {
  console.log(metadata);
  return await invoke('video_embed', { dto: { videoPath, saveDir, metadata, coverPath } });
};

/** 把 Tauri 返回的绝对路径转成 <img> 可用的 URL */
export function pathToUrl(path: string) {
  return `${convertFileSrc(path)}?t=${Date.now()}`;
}
