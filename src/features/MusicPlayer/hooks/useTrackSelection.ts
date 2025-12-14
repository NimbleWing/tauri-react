import { useSelection } from '@/hooks/useSelection';
import { Track } from '@/store/musicStore';

export const useTrackSelection = () => useSelection<Track>((a, b) => a === b);
