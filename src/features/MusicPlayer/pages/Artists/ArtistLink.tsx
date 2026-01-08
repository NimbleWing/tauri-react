import { UserRoundIcon } from 'lucide-react';
import TrackPropertyText, { TrackPropertyTextProps } from '../Tracks/PropertyText';

export const ArtistLink = ({ children, ...props }: TrackPropertyTextProps) => {
  return (
    <TrackPropertyText {...props} link={`/tracks?artist=${children}`}>
      <UserRoundIcon /> {children}
    </TrackPropertyText>
  );
};
