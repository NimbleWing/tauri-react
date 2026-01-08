import { invoke } from '@tauri-apps/api/core';

export * from './Tracks';
export * from './Cover';
/**
 * 音频轨道（歌曲）元数据类型
 * 所有字段在扫描文件时一次性填充，后续只读
 */
export type Track = {
  /** 文件内容的哈希（MD5/SHA-1），用于去重、缓存 */
  hash: string;

  /** 文件在磁盘中的绝对路径 */
  path: string;

  /** 文件名（含扩展名），例如 `01 - Hello World.flac` */
  name: string;

  /** 扩展名，小写，带点，例如 `.mp3`、`.flac`、`.m4a` */
  extension: string;

  /** 音频时长（秒，取整）；无法解析时填充 0 */
  duration: number;

  /** 嵌入封面二进制数据的 Data URI（base64），若无封面则为 null */
  cover?: string | null;

  /** 音轨标题；优先级：ID3 标题 > 文件名（不含扩展名） */
  title?: string | null;

  /** 表演者（歌手/乐队）；可多值，用 `; ` 分隔 */
  artist?: string | null;

  /** 所属专辑名称 */
  album?: string | null;

  /** 专辑艺术家（常用于合辑）；空则回退到 artist */
  albumArtist?: string | null;

  /** 发行日期（原始字符串，可能为 YYYY、YYYY-MM、YYYY-MM-DD） */
  date?: string | null;

  /** 流派（可能多值，用 `; ` 分隔） */
  genre?: string | null;

  /** 在专辑或播放列表中的位置序号 */
  position?: number | null;

  /** 用户评分或系统排名 */
  rank?: number | null;

  /** 匹配规则或分类规则（用于智能播放列表等） */
  rules?: string | null;

  /** 音轨号（专辑中的第几首歌） */
  number?: number | null;
};
type GetTracksFilters = {
  artist?: string | null;
  album?: string | null;
};
export async function getTracks(filters: GetTracksFilters = {}) {
  return await invoke<Track[]>('mp_track_list', { filters });
}
export function parseFilters(params: URLSearchParams) {
  return { album: params.get('album'), artist: params.get('artist') };
}
