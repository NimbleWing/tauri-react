import { Button } from '@heroui/react';
import type { Tag } from '.';
import { TrashIcon } from 'lucide-react';

type Props = {
  tags: Tag[];
  onDelete?: (id: number, name: string) => void;
};

export function TagGridView({ tags, onDelete }: Props) {
  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <div className="p-4 rounded-full bg-default-100 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium">No tags found</p>
        <p className="text-sm opacity-60">Create a new tag to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {tags.map(tag => {
        const { id, name, sortName } = tag;
        if (id == null) return null;

        const colorIndex = id % 5;

        return (
          <div
            key={id}
            className="group relative bg-default-100/50 rounded-large p-4 border border-divider hover:border-default-200 transition-all duration-300">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-default-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-default-500">#{colorIndex + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-xs text-default-500">{sortName}</p>
              </div>
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="light"
                color="danger"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onPressStart={() => onDelete?.(id, name)}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
