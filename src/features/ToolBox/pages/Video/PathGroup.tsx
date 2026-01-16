import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '@heroui/react';
import { SquareMousePointer } from 'lucide-react';

type Kind = 'folder' | 'video';

export interface Item {
  key: string;
  label: string;
  desc: string;
  kind: Kind;
  exts?: string[];
}

export function PathGroup({
  items,
  values,
  onChange,
}: {
  items: Item[];
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const pick = async (item: Item) => {
    const res = await open({
      directory: item.kind === 'folder',
      multiple: false,
      filters: item.exts?.length ? [{ name: item.label, extensions: item.exts }] : undefined,
    });
    if (res) onChange(item.key, res);
  };

  return (
    <div className="flex flex-col gap-6">
      {items.map(it => (
        <section key={it.key} className="flex flex-col gap-2">
          <div className="text-large font-semibold">{it.label}</div>
          <div className="text-small text-default-500">{it.desc}</div>
          {values[it.key] && (
            <div className="mt-1 rounded-md bg-default-100 px-3 py-2 font-mono text-small text-default-700 break-all">
              {values[it.key]}
            </div>
          )}
          <Button variant="flat" radius="sm" onPress={() => pick(it)}>
            <SquareMousePointer className="text-lg" />
            {values[it.key] ? 'Change' : 'Select'} {it.label}
          </Button>
        </section>
      ))}
    </div>
  );
}
