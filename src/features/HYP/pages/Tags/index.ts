import { invoke } from '@tauri-apps/api/core';

export * from './Tags';
export * from './TagList';
export * from './TagEditorModal';
export type Tag = {
  id?: number;
  name: string;
  sortName: string;
  createdAt?: string;
  updatedAt?: string;
};
export const addTag = async (name: string, sortName = '9999') => {
  return await invoke('tag_add', { dto: { name, sortName } });
};

export const getTags = async () => {
  return await invoke<Tag[]>('tag_list');
};

export const deleteTag = async (tagId: number) => {
  return await invoke('tag_delete', { tagId });
};
