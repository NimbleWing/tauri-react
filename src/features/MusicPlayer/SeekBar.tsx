import { Slider } from '@heroui/react';
import { useLayoutEffect, useRef, useState } from 'react';

type SeekBarProps = {
  elapsed: number;
  duration?: number;
  className?: string;
  isDisabled?: boolean;
  onSeek: (elapsed: number) => void;
};

export const SeekBar = ({ elapsed, duration, isDisabled, onSeek }: SeekBarProps) => {
  const { progress, setProgress, setIsSeeking } = useSeeker(elapsed);
  return (
    <Slider
      size="sm"
      color="foreground"
      aria-label="Progress"
      isDisabled={isDisabled}
      value={progress}
      maxValue={duration ?? -1}
      onChange={value => {
        setIsSeeking(true);
        setProgress(typeof value === 'number' ? value : value[0]);
      }}
      onChangeEnd={value => {
        setIsSeeking(false);
        const pos = typeof value === 'number' ? value : value[0];

        onSeek(pos);
        setProgress(pos);
      }}
    />
  );
};
export function useSeeker(elapsed: number) {
  const [progress, setProgress] = useState(elapsed);
  const [isSeeking, setIsSeeking] = useState(false);
  const prevElapsed = useRef(elapsed);

  useLayoutEffect(() => {
    if (!isSeeking && elapsed !== prevElapsed.current) {
      setProgress(elapsed);
    }

    prevElapsed.current = elapsed;
  }, [elapsed, isSeeking]);

  return { progress, setProgress, setIsSeeking };
}
