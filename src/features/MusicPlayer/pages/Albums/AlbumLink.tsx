import { Disc3Icon } from 'lucide-react';
import TrackPropertyText, { TrackPropertyTextProps } from '../Tracks/PropertyText';

export const AlbumLink = ({ children, ...props }: TrackPropertyTextProps) => {
  return (
    <TrackPropertyText {...props} link={`/tracks?album=${children}`}>
      <Disc3Icon /> {children}
    </TrackPropertyText>
  );
};
