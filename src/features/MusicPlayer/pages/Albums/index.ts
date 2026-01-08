import { invoke } from '@tauri-apps/api/core';

export * from './Albums';
export * from './AlbumLink';

export type Album = { name: string; cover?: string | null };

export async function getAlbums() {
  return await invoke<Album[]>('mp_album_list');
}
