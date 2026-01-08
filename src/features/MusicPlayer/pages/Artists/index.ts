import { invoke } from '@tauri-apps/api/core';

export * from './Artists';
export * from './ArtistLink';

export async function getArtists() {
  return await invoke<string[]>('mp_artist_list');
}
