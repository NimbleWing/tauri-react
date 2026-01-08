import { invoke } from '@tauri-apps/api/core';
import { Track } from '../Tracks';

export * from './Playlists';
export * from './Playlist';
export type EditorType = 'new' | 'update' | 'remove';
export const getPlaylists = async () => {
  return await invoke<string[]>('mp_playlist_list');
};

export const addPlaylist = async (name: string) => {
  try {
    return await invoke('mp_playlist_create', { name });
  } catch (error) {
    console.error('Error adding playlist:', error);
  }
};

export const renamePlaylist = async (name: string, newName: string) => {
  try {
    return await invoke('mp_playlist_rename', { name, newName });
  } catch (error) {
    console.error('Error renaming playlist:', error);
  }
};

export const removePlaylist = async (name: string) => {
  return await invoke('mp_playlist_delete', { name });
};

export const getPlaylistTracks = async (name: string) => {
  return await invoke<Track[]>('mp_playlist_tracks', { name });
};
export const addPlaylistTracks = async (name: string, tracks: Track[]) => {
  return await invoke('mp_playlist_tracks_add', { name, hashes: tracks?.map(t => t.hash) });
};
export const removePlaylistTracks = async (name: string, tracks?: Track[]) => {
  return await invoke('mp_playlist_tracks_remove', { name, hashes: tracks?.map(t => t.hash) });
};
export const reOrderPlaylistTracks = async (name: string, track: Track, src: number, dst: number) => {
  return await invoke('mp_playlist_tracks_reorder', { name, hash: track.hash, src, dst });
};
