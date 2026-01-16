import { useEffect, useReducer, useState } from 'react';
import { Item, PathGroup } from '../Video/PathGroup';
import { MousePointerClick } from 'lucide-react';
import { addToast, Button } from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { ScanVideoCMD } from '.';
import { listen } from '@tauri-apps/api/event';

interface ScanProgress {
  current: number;
  total: number;
  currentPath: string;
  success: number;
  failed: number;
}

const CircleProgress = ({ percent }: { percent: number }) => {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const stroke = circ - (percent / 100) * circ;
  return (
    <svg className="w-20 h-20">
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        className="text-default-200"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        strokeDasharray={circ}
        strokeDashoffset={stroke}
        strokeLinecap="round"
        className="text-primary transition-all duration-300"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-sm font-bold">
        {percent}%
      </text>
    </svg>
  );
};
type PickKey = 'saveDir' | 'video' | 'cover';
const pathItems: Item[] = [
  { key: 'saveDir', label: 'Scan Directory', desc: 'The directory where your video files are stored.', kind: 'folder' },
];
interface State {
  paths: Record<PickKey, string>;
}
function reducer(state: State, action: { type: 'SET_PATH'; key?: string; value?: string }): State {
  if (action.type === 'SET_PATH' && action.key) {
    return { ...state, paths: { ...state.paths, [action.key]: action.value! } };
  }
  return state;
}
export const ScanVideo = () => {
  const [state, dispatch] = useReducer(reducer, { paths: { saveDir: '', video: '', cover: '' } });
  const canRun = Boolean(state.paths.saveDir);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  useEffect(() => {
    const unlisten = listen<ScanProgress>('scan_progress', evt => setProgress(evt.payload));
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);
  const { mutate, isPending } = useMutation({
    mutationFn: () => ScanVideoCMD(state.paths.saveDir),
    onSuccess: () => {
      addToast({ timeout: 5000, title: '扫描完成', color: 'success' });
    },
    onError: (err: string) => {
      addToast({ timeout: 5000, color: 'danger', title: err });
    },
  });
  const percent = progress ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div className="w-full overflow-auto p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))]">
      <div className="flex flex-col gap-6">
        <PathGroup
          items={pathItems}
          values={state.paths}
          onChange={(k, v) => dispatch({ type: 'SET_PATH', key: k as PickKey, value: v })}
        />
        {progress && (
          <div className="flex items-center gap-4 rounded-xl border border-divider bg-content1 p-4 shadow-sm">
            <CircleProgress percent={percent} />
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-sm text-default-500">
                <span>Scanning…</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="truncate text-xs text-default-400">{progress.currentPath}</div>
              {progress.currentPath}
              <div className="mt-2 flex gap-4 text-xs">
                <span className="text-success">Success: {progress.success}</span>
                <span className="text-danger">Failed: {progress.failed}</span>
              </div>
            </div>
          </div>
        )}
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
