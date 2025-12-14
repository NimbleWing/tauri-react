import { invoke } from '@tauri-apps/api/core';
import { CreatePerformerDto } from './PerformerEditorModal';

export * from './Performers';
export type Performer = {
  id?: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};
export const getPerformers = async () => {
  return await invoke<Performer[]>('performer_list');
};

export const addPerformer = async (dto: CreatePerformerDto) => {
  return await invoke('performer_add', { dto });
};
