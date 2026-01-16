import { convertFileSrc } from '@tauri-apps/api/core';

export const localFileToUrl = (path: string, updateTime?: string) => {
  if (path.startsWith('http')) {
    return path;
  }
  const url = convertFileSrc(path);
  return updateTime ? `${url}?t=${updateTime}` : url;
};
