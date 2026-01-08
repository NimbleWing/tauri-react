// src/components/VideoPicker.tsx
import { useRef, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Button, Slider } from '@heroui/react';
import { SquareMousePointer, X, Play, Pause } from 'lucide-react';
import { pathToUrl } from '.';

type Props = {
  value: string; // 绝对路径
  onChange: (v: string) => void;
};

export function VideoPicker({ value, onChange }: Props) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const pick = async () => {
    const res = await open({
      directory: false,
      multiple: false,
      filters: [{ name: 'Video', extensions: ['mp4', 'mkv', 'mov'] }],
    });
    if (res) onChange(res);
  };
  const clear = () => {
    onChange('');
    setPlaying(false);
  };

  const togglePlay = () => {
    const el = vidRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play();
    setPlaying(p => !p);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="text-large font-semibold">Video file</div>
      <div className="text-small text-default-500">Select source video (optional preview)</div>

      {value ? (
        <>
          <div className="relative mt-2 inline-block max-w-[480px]">
            <video
              ref={vidRef}
              className="w-full rounded-md"
              src={pathToUrl(value)}
              onEnded={() => setPlaying(false)}
            />
            {/* 播放/暂停 */}
            <Button
              isIconOnly
              size="sm"
              radius="full"
              color="primary"
              variant="flat"
              className="absolute bottom-2 left-2"
              onPress={togglePlay}>
              {playing ? <Pause /> : <Play />}
            </Button>
            {/* 清空 */}
            <Button
              isIconOnly
              size="sm"
              radius="full"
              color="danger"
              variant="flat"
              className="absolute right-2 top-2"
              onPress={clear}>
              <X />
            </Button>
          </div>

          {/* 音量条 (可选) */}
          <Slider
            label="Volume"
            size="sm"
            step={0.05}
            maxValue={1}
            defaultValue={0.5}
            className="max-w-[240px]"
            onChange={v => {
              if (vidRef.current) vidRef.current.volume = v as number;
            }}
          />
        </>
      ) : (
        <Button variant="flat" radius="sm" onPress={pick}>
          <SquareMousePointer className="text-lg" />
          Select video
        </Button>
      )}
    </section>
  );
}
