// src/pages/VideoTool.tsx
import { useEffect, useReducer, useRef } from 'react';
import { Button } from '@heroui/react';
import { MousePointerClick } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { addToast } from '@heroui/react';
import { Item, PathGroup } from './PathGroup';
import { MetaForm } from './MetaForm';
import { CoverPicker } from './CoverPicker';
import { AttachMetadataAndCoverToVideo } from '.';
import { metaFields } from './meta/fields';
import { loadState, saveState } from './persistent';

/* ---------------- 类型 & 初始值 ---------------- */
type PickKey = 'saveDir' | 'video' | 'cover';
interface State {
  paths: Record<PickKey, string>;
  meta: Record<string, string>;
}

const pathItems: Item[] = [
  { key: 'saveDir', label: 'Output folder', desc: 'Where to save the final video', kind: 'folder' },
  { key: 'video', label: 'Video', desc: 'Source video file', kind: 'video', exts: ['mp4', 'mkv', 'mov'] },
];

function reducer(state: State, action: { type: 'SET_PATH' | 'SET_META'; key?: string; value?: string }): State {
  if (action.type === 'SET_PATH' && action.key)
    return { ...state, paths: { ...state.paths, [action.key]: action.value! } };
  if (action.type === 'SET_META' && action.key)
    return { ...state, meta: { ...state.meta, [action.key]: action.value! } };
  return state;
}

/* ---------------- 主组件 ---------------- */
export const VideoTool = () => {
  /* 1. 初次挂载：读缓存 → 初始化 */
  const [state, dispatch] = useReducer(reducer, loadState());
  /* 2. 任何字段变动后 1s 自动存（防抖）*/
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => saveState(state), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);
  // const canRun = state.paths.saveDir && state.paths.video && state.meta.title.trim() !== '';
  const requiredKeys = metaFields.filter(f => f.required).map(f => f.key);

  const canRun = Boolean(
    state.paths.saveDir && state.paths.video && requiredKeys.every(k => state.meta[k]?.trim() !== ''),
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      AttachMetadataAndCoverToVideo(
        state.paths.video,
        state.paths.saveDir,
        {
          title: state.meta.title.trim(),
          subtitle: state.meta.subtitle.trim(),
          performers: state.meta.performers.trim(),
          studio: state.meta.studio.trim(),
          code: state.meta.code.trim(),
          rating: state.meta.rating.trim(),
          country: state.meta.country.trim(),
          tags: state.meta.tags.trim(),
        },
        state.paths.cover,
      ),
    onError: (err: string) => {
      console.log(err);
      addToast({ timeout: 5000, color: 'danger', title: err });
    },
    onSuccess: () => {
      // 1. 清空封面与视频路径
      dispatch({ type: 'SET_PATH', key: 'cover', value: '' });
      dispatch({ type: 'SET_PATH', key: 'video', value: '' });
      // 清空标题与副标题
      dispatch({ type: 'SET_META', key: 'title', value: '' });
      dispatch({ type: 'SET_META', key: 'subtitle', value: '' });
      // 清空演员
      dispatch({ type: 'SET_META', key: 'performers', value: '' });
      // 清空厂商
      dispatch({ type: 'SET_META', key: 'studio', value: '' });
      // 清空番号
      dispatch({ type: 'SET_META', key: 'code', value: '' });
      // 重置评分
      dispatch({ type: 'SET_META', key: 'rating', value: '50' });
      // 清空标签
      dispatch({ type: 'SET_META', key: 'tags', value: '' });
      // 2. 立即落盘（可选）
      saveState({
        ...state,
        paths: { ...state.paths, cover: '', video: '' },
        meta: {
          ...state.meta,
          title: '',
          subtitle: '',
          performers: '',
          studio: '',
          code: '',
          rating: '50',
          tags: '',
        },
      });

      addToast({ timeout: 5000, title: '处理完成', color: 'success' });
    },
  });

  return (
    <div className="w-full overflow-auto p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))]">
      <div className="flex flex-col gap-6">
        {/* 路径 */}
        <PathGroup
          items={pathItems}
          values={state.paths}
          onChange={(k, v) => dispatch({ type: 'SET_PATH', key: k as PickKey, value: v })}
        />

        {/* 封面 + 预览 */}
        <CoverPicker value={state.paths.cover} onChange={v => dispatch({ type: 'SET_PATH', key: 'cover', value: v })} />

        {/* 元数据 */}
        <MetaForm state={state.meta} onChange={(k, v) => dispatch({ type: 'SET_META', key: k, value: v })} />

        {/* 执行 */}
        <Button
          variant="flat"
          radius="sm"
          color={canRun ? 'primary' : 'default'}
          isDisabled={!canRun}
          isLoading={isPending}
          onPress={() => mutate()}>
          <MousePointerClick className="text-lg" />
          Run
        </Button>
      </div>
    </div>
  );
};
