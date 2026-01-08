import { Card, CardFooter } from '@heroui/react';
import { UserRoundIcon } from 'lucide-react';
import { Link } from 'react-router';
import { TrackCover } from '../Tracks';

type ArtistCardProps = { data: string };

const ArtistCard = ({ data }: ArtistCardProps) => {
  return (
    <Card
      as={Link}
      isFooterBlurred
      radius="none"
      shadow="none"
      to={`/music/tracks?artist=${data}`}
      className="aspect-square bg-transparent group">
      <TrackCover className="size-full rounded-none" placeholder={UserRoundIcon} />

      <CardFooter className="absolute bg-background/60 bottom-0 z-10 py-2 px-3 max-h-10 group-hover:max-h-full transition-[max-height]">
        <div className="text-small line-clamp-1 group-hover:line-clamp-none">{data}</div>
      </CardFooter>
    </Card>
  );
};
export default ArtistCard;
