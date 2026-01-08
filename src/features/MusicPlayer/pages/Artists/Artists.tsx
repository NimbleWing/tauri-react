import { useQuery } from '@tanstack/react-query';
import ArtistCard from './ArtistCard';
import { getArtists } from '.';

export const Artists = () => {
  const query = useQuery({ queryKey: ['artists'], queryFn: getArtists });

  return (
    <div className="pt-[calc(theme(spacing.10))] overflow-auto w-full flex flex-col h-full gap-2">
      <div className="grid grid-cols-8 p-3 shrink-0 w-full gap-0.5">
        {query.isSuccess && query.data.map(item => <ArtistCard key={item} data={item} />)}
      </div>
    </div>
  );
};
