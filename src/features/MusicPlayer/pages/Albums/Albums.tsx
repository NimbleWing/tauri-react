import { useNavigate } from 'react-router';
import SearchBar from '../Tracks/SearchBar';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import MiniSearch from 'minisearch';
import { useAlbumSelection } from './useAlbumSelection';
import { VirtualList } from '@/components/List/VirtualList';
import { AlbumListItem } from './AlbumListItem';
import { chunk } from 'es-toolkit';
import { getAlbums, type Album } from '.';
import type {
  ContainerProps as ListContainerProps,
  HeaderProps as ListHeaderProps,
  FooterProps as ListFooterProps,
} from '@/components/List';

export function createSearchIndex() {
  return new MiniSearch({
    idField: 'name',
    fields: ['name'],
    storeFields: ['name'],
    searchOptions: { prefix: true, fuzzy: true },
  });
}
const searchIndex = createSearchIndex();
export const Albums = () => {
  const navigate = useNavigate();
  const chunkSize = 4; // TODO: probably make this change with screen size

  const query = useQuery({ queryKey: ['albums'], queryFn: getAlbums });
  const map = new Map(query.data?.map(it => [it.name, it]) ?? []);
  const [filtered, setFiltered] = useState(chunk(query.data ?? [], chunkSize));

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounceValue(searchQuery, 500);

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) return setFiltered(chunk(query.data ?? [], chunkSize));

    const data = searchIndex
      .search(debouncedSearchQuery)
      .map(it => map.get(it.id))
      .filter(Boolean) as Album[];

    setFiltered(chunk(data, chunkSize));
  }, [query.data, debouncedSearchQuery]);

  useEffect(() => {
    searchIndex.removeAll();
    searchIndex.addAll(query.data ?? []);
  }, [query.data]);

  const selection = useAlbumSelection();
  return (
    <div className="flex flex-col size-full relative">
      <div
        className="px-6 h-16 flex items-center gap-3 rounded-small absolute top-[calc(theme(spacing.10)+theme(spacing.2))] left-0 right-3
        bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
        <SearchBar value={searchQuery} onChange={setSearchQuery} className="w-120 ml-auto" />
      </div>
      <VirtualList data={filtered} components={{ Container: ListContainer, Header: ListHeader, Footer: ListFooter }}>
        {(items: Album[]) => (
          <>
            <AlbumListItem
              // first item's name as key because each album is unique
              key={items[0].name}
              data={items}
              columns={chunkSize}
              isSelected={items.map(item => selection.isSelected(item))}
              onOpen={data => navigate(`/music/tracks?album=${data.name}`)}
            />
          </>
        )}
      </VirtualList>
    </div>
  );
};

function ListContainer(props: ListContainerProps) {
  return <div {...props} className="flex flex-col gap-0.5 px-3 pb-3 shrink-0 w-full" />;
}

function ListHeader(props: ListHeaderProps) {
  return <div {...props} className="h-[calc(theme(spacing.10)+theme(spacing.16)+theme(spacing.4))]"></div>;
}

function ListFooter(props: ListFooterProps) {
  return <div {...props} className="h-3"></div>;
}
