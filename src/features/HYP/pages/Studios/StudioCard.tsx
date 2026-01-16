import { Button } from '@heroui/react';
import type { Studio } from '.';
import { localFileToUrl } from '@/utils/path';
import { Card, CardHeader, CardFooter, Image } from '@heroui/react';

type Props = {
  studio: Studio;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export function StudioCard({ studio }: Props) {
  const { id, name } = studio;
  if (id == null) return null; //
  if (studio.id === null || studio.id === undefined) return null;
  return (
    <Card isFooterBlurred className="w-full h-[200px] col-span-12 sm:col-span-5">
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">New</p>
        <h4 className="text-black font-medium text-2xl">{name}</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card example background"
        className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
        src={localFileToUrl(studio.imagePath || '', studio.updatedAt!)}
      />
      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
        <div>
          <p className="text-black text-tiny">Available soon.</p>
          <p className="text-black text-tiny">Get notified.</p>
        </div>
        <Button className="text-tiny" color="primary" radius="full" size="sm">
          Notify Me
        </Button>
      </CardFooter>
    </Card>
  );
}
