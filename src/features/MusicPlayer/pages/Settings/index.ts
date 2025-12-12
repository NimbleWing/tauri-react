import { invoke } from '@tauri-apps/api/core';

export * from './Settings';
export async function getDirs() {
  return await invoke<string[]>('mp_db_get_dirs');
}
export async function setDirs(dirs: string[]) {
  return await invoke('mp_db_set_dirs', { dirs });
}
export async function scanDirs() {
  return await invoke<string>('mp_db_scan_dirs');
}

export async function getMetaData() {
  return await invoke('video_info', { videoPath: 'D:\\Desktop\\output.mp4' });
}
