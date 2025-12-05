import { invoke } from '@tauri-apps/api/core';

export * from './Performers';
export type Performer = {
  id?: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};
export const getPerformers = async () => {
  return await invoke<Performer[]>('hyp_performer_list');
};

export const addPerformer = async (name: string) => {
  return await invoke('hyp_performer_add', { name });
};
