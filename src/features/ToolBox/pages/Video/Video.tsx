import { useEffect, useReducer, useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@heroui/react';
import { MousePointerClick, Folder as FolderIcon, X, AlertCircle, Loader2, FolderPlus, Check } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addToast } from '@heroui/react';
import { Item, PathGroup } from './PathGroup';
import { MetaForm } from './MetaForm';
import { CoverPicker } from './CoverPicker';
import { AttachMetadataAndCoverToVideo } from '.';
import { metaFields } from './meta/fields';
import { loadState, saveState } from './persistent';
import { getPerformers } from '@/features/HYP';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '@heroui/react';

type PickKey = 'outputBaseDir' | 'video' | 'cover';
interface State {
  paths: Record<PickKey, string>;
  meta: Record<string, string>;
}

const pathItems: Item[] = [
  { key: 'outputBaseDir', label: 'Output base folder', desc: 'Performer folders will be created here', kind: 'folder' },
  { key: 'video', label: 'Video', desc: 'Source video file', kind: 'video', exts: ['mp4', 'mkv', 'mov'] },
];

function reducer(state: State, action: { type: 'SET_PATH' | 'SET_META'; key?: string; value?: string }): State {
  if (action.type === 'SET_PATH' && action.key)
    return { ...state, paths: { ...state.paths, [action.key]: action.value! } };
  if (action.type === 'SET_META' && action.key)
    return { ...state, meta: { ...state.meta, [action.key]: action.value! } };
  return state;
}

export const VideoTool = () => {
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

  const [folderStatus, setFolderStatus] = useState<{
    exists: boolean | null;
    performerName: string;
    fullPath: string;
  }>({ exists: null, performerName: '', fullPath: '' });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const requiredKeys = metaFields.filter(f => f.required).map(f => f.key);

  const getFirstPerformer = (): string | null => {
    const performers = state.meta.performers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return performers.length > 0 ? performers[0] : null;
  };

  const getActualSaveDir = (): string | null => {
    const baseDir = state.paths.outputBaseDir;
    const firstPerformer = getFirstPerformer();
    if (!baseDir) return null;
    if (!firstPerformer) return baseDir;
    return `${baseDir}/【${firstPerformer}】`;
  };

  const canRun = Boolean(
    state.paths.outputBaseDir &&
      state.paths.video &&
      requiredKeys.every(k => state.meta[k]?.trim() !== '') &&
      folderStatus.exists === true,
  );

  useQuery({
    queryKey: ['performers'],
    queryFn: getPerformers,
  });

  /* 当 performers 变化时检查第一个演员的文件夹 */
  useEffect(() => {
    const checkFolder = async () => {
      const firstPerformer = getFirstPerformer();
      const baseDir = state.paths.outputBaseDir;

      if (!firstPerformer || !baseDir) {
        setFolderStatus({ exists: null, performerName: '', fullPath: '' });
        setShowCreateDialog(false);
        return;
      }

      const folderName = `【${firstPerformer}】`;
      const fullPath = `${baseDir}\\${folderName}`;

      try {
        const exists = await invoke<boolean>('check_folder_exists', {
          baseDir: baseDir,
          folderName: folderName,
        });

        setFolderStatus({ exists, performerName: firstPerformer, fullPath });

        if (!exists) {
          setShowCreateDialog(true);
        } else {
          setShowCreateDialog(false);
        }
      } catch (e) {
        console.error('Failed to check folder:', e);
        setFolderStatus({ exists: null, performerName: firstPerformer, fullPath });
      }
    };

    checkFolder();
  }, [state.meta.performers, state.paths.outputBaseDir]);

  const handleCreateFolder = async () => {
    if (!folderStatus.fullPath) return;

    try {
      await invoke('create_folder', {
        path: folderStatus.fullPath,
      });

      setShowCreateDialog(false);
      setFolderStatus({ ...folderStatus, exists: true });

      addToast({
        timeout: 3000,
        color: 'success',
        title: `Folder created: 【${folderStatus.performerName}】`,
      });
    } catch (e) {
      addToast({
        timeout: 5000,
        color: 'danger',
        title: `Failed to create folder: ${e}`,
      });

      const currentPerformers = state.meta.performers || '';
      const performerArray = currentPerformers
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (performerArray.length > 0) {
        const newPerformers = performerArray.slice(1).join(',');
        dispatch({ type: 'SET_META', key: 'performers', value: newPerformers });
      }

      setShowCreateDialog(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);

    const currentPerformers = state.meta.performers || '';
    const performerArray = currentPerformers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (performerArray.length > 0) {
      const newPerformers = performerArray.slice(1).join(',');
      dispatch({ type: 'SET_META', key: 'performers', value: newPerformers });
    }

    addToast({
      timeout: 3000,
      color: 'warning',
      title: `Cancelled: Removed ${folderStatus.performerName}`,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      AttachMetadataAndCoverToVideo(
        state.paths.video,
        getActualSaveDir()!,
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
    <>
      <div className="w-full overflow-auto p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))]">
        <div className="flex flex-col gap-6">
          <PathGroup
            items={pathItems}
            values={state.paths}
            onChange={(k, v) => dispatch({ type: 'SET_PATH', key: k as PickKey, value: v })}
          />

          {folderStatus.performerName ? (
            <div
              className={cn(
                'rounded-md px-4 py-3 text-sm flex items-center gap-3 mt-2 min-h-[72px]',
                folderStatus.exists === null
                  ? 'bg-default-100 text-default-600'
                  : folderStatus.exists
                    ? 'bg-success-100 text-success-700'
                    : 'bg-warning-100 text-warning-700',
              )}>
              {folderStatus.exists === null && <Loader2 className="w-4 h-4 animate-spin" />}
              {folderStatus.exists === true && <Check className="w-4 h-4" />}
              {folderStatus.exists === false && <AlertCircle className="w-4 h-4" />}
              <div className="flex-1">
                <div className="font-semibold">Save directory:</div>
                <div className="font-mono text-xs break-all mt-1">{folderStatus.fullPath}</div>
              </div>
              {!folderStatus.exists && <div className="text-xs text-warning-600">Folder does not exist</div>}
            </div>
          ) : (
            <div className="rounded-md px-4 py-3 text-sm flex items-center gap-3 mt-2 min-h-[72px] bg-default-100 text-default-600">
              <div className="flex-1">
                <div className="font-semibold">Select a performer</div>
                <div className="text-xs mt-1">Choose a performer to view folder status</div>
              </div>
            </div>
          )}

          <CoverPicker
            value={state.paths.cover}
            onChange={v => dispatch({ type: 'SET_PATH', key: 'cover', value: v })}
          />

          <MetaForm
            state={state.meta}
            onChange={(k, v) => dispatch({ type: 'SET_META', key: k, value: v })}
            forceClose={showCreateDialog}
          />

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

      {showCreateDialog && folderStatus && (
        <Modal isOpen={true} onClose={() => setShowCreateDialog(false)} backdrop="blur" radius="sm" hideCloseButton>
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5 text-warning" />
                <span>Create Performer Folder?</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <p className="text-default-600">Performer folder does not exist:</p>
                <div className="bg-default-100 rounded-md px-3 py-2 font-mono text-sm border border-warning-200">
                  {folderStatus.fullPath}
                </div>
                <p className="text-sm text-default-500">Do you want to create it automatically?</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleCancelCreate}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button color="primary" onPress={handleCreateFolder}>
                <FolderPlus className="w-4 h-4 mr-1" />
                Create Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
