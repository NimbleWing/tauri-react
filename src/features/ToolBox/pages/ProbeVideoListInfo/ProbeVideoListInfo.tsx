import { useEffect, useReducer, useState } from 'react';
import { PathGroup, Item } from '../Video/PathGroup';
import { Button, cn } from '@heroui/react';
import { MousePointerClick, Info, Film } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ProbeVideoList } from '.';
import { VideoProbeDetailVo } from '@/lib/bindings/VideoProbeDetailVo';
import { VideoProbeCard } from '../ProbeVideoInfo/VideoProbeCard';
import { listen } from '@tauri-apps/api/event';

type PickKey = 'videoDir';
interface State {
  paths: Record<PickKey, string>;
}

const pathItems: Item[] = [
  {
    key: 'videoDir',
    label: 'Video Folder',
    desc: 'Select a video folder to analyze its technical metadata',
    kind: 'folder',
  },
];

function reducer(state: State, action: { type: 'SET_PATH' | 'SET_META'; key?: string; value?: string }): State {
  if (action.type === 'SET_PATH' && action.key)
    return { ...state, paths: { ...state.paths, [action.key]: action.value! } };
  return state;
}

export const ProbeVideoListInfo = () => {
  const [state, dispatch] = useReducer(reducer, { paths: { videoDir: '' } });
  const [videoListProbeInfo, setVideoListProbeInfo] = useState<VideoProbeDetailVo[]>([]);
  const canRun = Boolean(state.paths.videoDir);
  useEffect(() => {
    const unlisten = listen<VideoProbeDetailVo>('probe_video_list', evt => {
      setVideoListProbeInfo(pre => [...pre, evt.payload]);
    });
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);
  const { mutate, isPending } = useMutation({
    mutationFn: () => ProbeVideoList(state.paths.videoDir),
    onError: err => {
      console.error(err);
    },
  });

  return (
    <div className="w-full mx-auto p-6">
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Video Analysis Tool</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Technical Metadata Probe</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Analyze your video files to extract detailed technical information including codec, resolution, duration,
            and more.
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <PathGroup
            items={pathItems}
            values={state.paths}
            onChange={(k, v) => dispatch({ type: 'SET_PATH', key: k as PickKey, value: v })}
          />
        </div>

        <div className="flex justify-center">
          <Button
            variant="flat"
            radius="full"
            size="lg"
            color={canRun ? 'primary' : 'default'}
            isDisabled={!canRun}
            isLoading={isPending}
            onPress={() => mutate()}
            className="min-w-48 px-8 py-3 font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <MousePointerClick className="text-xl mr-2" />
            {isPending ? 'Analyzing...' : 'Analyze Video'}
          </Button>
        </div>

        {videoListProbeInfo.length > 0 && (
          <div className="space-y-4 @container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-gradient-to-r from-cyan-500 to-purple-500" />
                <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                <div className="w-8 h-px bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-sm text-gray-400">({videoListProbeInfo.length} files)</span>
              </div>
              <Button size="sm" radius="full" variant="flat" color="default" onPress={() => setVideoListProbeInfo([])}>
                Clear
              </Button>
            </div>

            <div
              className={cn(
                'grid gap-4',
                videoListProbeInfo.length === 1
                  ? 'grid-cols-1 max-w-2xl mx-auto'
                  : 'grid-cols-1 @lg:grid-cols-2  @6xl:grid-cols-6 ',
              )}>
              {videoListProbeInfo.map((vo, idx) => (
                <VideoProbeCard key={idx} video={vo} />
              ))}
            </div>
          </div>
        )}

        {videoListProbeInfo.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
              <Film className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg">
              Select a video file and click &quot;Analyze Video&quot; to view technical metadata
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
