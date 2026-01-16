import { invoke } from '@tauri-apps/api/core';
export interface IdName {
  id: number;
  name: string;
}

export interface SceneItem {
  id: number;
  title: string;
  size: number;
  path: string;
  tags: IdName[];
  performers: IdName[];
  studio?: IdName;
}
export const getScenes = async () => {
  return await invoke<SceneItem[]>('hyp_scene_list');
};
