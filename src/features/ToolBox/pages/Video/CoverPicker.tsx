import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Button, Image } from '@heroui/react';
import { SquareMousePointer, X } from 'lucide-react';
import { pathToUrl } from '.';

type Props = {
  value: string; // 绝对路径
  onChange: (v: string) => void;
};

export function CoverPicker({ value, onChange }: Props) {
  const [big, setBig] = useState(false);

  const pick = async () => {
    const res = await open({
      directory: false,
      multiple: false,
      filters: [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png'] }],
    });
    if (res) onChange(res);
  };

  const clear = () => onChange('');
  return (
    <section className="flex flex-col gap-2">
      <div className="text-large font-semibold">Cover image</div>
      <div className="text-small text-default-500">Optional thumbnail / poster</div>

      {value ? (
        <>
          <div className="relative mt-2 inline-block">
            <Image
              radius="md"
              width={240}
              src={pathToUrl(value)}
              alt="cover"
              className="cursor-pointer"
              onClick={() => setBig(true)}
            />
            <Button
              isIconOnly
              size="sm"
              radius="full"
              color="danger"
              variant="flat"
              className="absolute right-2 top-2"
              onPress={clear}>
              <X />
            </Button>
          </div>

          {big && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setBig(false)}>
              <Image radius="none" className="max-w-[90vw] max-h-[90vh]" src={pathToUrl(value)} alt="cover-big" />
            </div>
          )}
        </>
      ) : (
        <Button variant="flat" radius="sm" onPress={pick}>
          <SquareMousePointer className="text-lg" />
          Select cover
        </Button>
      )}
    </section>
  );
}
