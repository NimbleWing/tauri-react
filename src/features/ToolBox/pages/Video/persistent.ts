// src/utils/persistent.ts
const STORAGE_KEY = 'videoTool_state_v2'; // 版本升级

interface PersistedState {
  paths: {
    outputBaseDir: string;
    video: string;
    cover: string;
  };
  meta: Record<string, string>;
}

/** 读取 + 迁移缺省值 */
export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as PersistedState;
    // 后续加字段时在这里 merge 缺省值
    return {
      paths: { ...getDefaultState().paths, ...parsed.paths },
      meta: { ...getDefaultState().meta, ...parsed.meta },
    };
  } catch {
    return getDefaultState();
  }
}

/** 存盘（防抖外层调用） */
export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 私密模式/满存等异常可降级
  }
}

/** 初始缺省值（与你在组件里写的一致） */
function getDefaultState(): PersistedState {
  return {
    paths: { outputBaseDir: '', video: '', cover: '' },
    meta: {
      title: '标题',
      subtitle: '副标题',
      performers: '',
      studio: '',
      code: '',
      rating: '50',
      country: '中国',
      tags: '',
    },
  };
}
