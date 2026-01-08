import { invoke } from '@tauri-apps/api/core';

export * from './Studios';
export * from './StudioEditorModal';

export type Studio = {
  id?: number;
  name: string;
  imagePath?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getStudios = async () => {
  return await invoke<Studio[]>('studio_list');
};

export const addStudio = async (name: string, image?: string) => {
  return await invoke('studio_add', { dto: { name, image } });
};
