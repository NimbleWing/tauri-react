import { Button } from '@heroui/react';
import type { Tag } from '.';
import { TrashIcon, HashIcon } from 'lucide-react';

type Props = {
  tag: Tag;
  onDelete?: (id: number, name: string) => void;
};

export function TagCard({ tag, onDelete }: Props) {
  const { id, name, sortName } = tag;
  if (id == null) return null;

  return (
    <div className="flex items-center gap-3 p-3 group">
      <div className="flex items-center justify-center w-10 h-10 rounded-small bg-secondary-50 dark:bg-secondary-900/20">
        <HashIcon className="w-5 h-5 text-secondary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium truncate">{name}</p>
        <p className="text-tiny text-default-500">{sortName}</p>
      </div>
      <Button
        isIconOnly
        size="sm"
        radius="full"
        variant="light"
        color="danger"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onPressStart={() => onDelete?.(id, name)}>
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
