import { useSelection } from '@/hooks/useSelection';
import { Album } from '.';

export const useAlbumSelection = () => useSelection<Album>((a, b) => a === b);
