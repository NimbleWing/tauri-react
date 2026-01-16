const STORAGE_KEY = 'videoTool_state_v2'; // 版本升级

interface PersistedState {
  paths: {
    outputBaseDir: string;
    video: string;
    cover: string;
  };
  meta: Record<string, string>;
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      paths: { ...getDefaultState().paths, ...parsed.paths },
      meta: { ...getDefaultState().meta, ...parsed.meta },
    };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 私密模式/满存等异常可降级
  }
}

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
