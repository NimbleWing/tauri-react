import { Button, addToast } from '@heroui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { open } from '@tauri-apps/plugin-dialog';
import { FileScanIcon, PlusIcon, XIcon } from 'lucide-react';
import { getDirs, scanDirs, setDirs } from '.';

export const MusicSettings = () => {
  const queryDirs = useQuery({ queryKey: ['dirs'], queryFn: getDirs });
  const mutationScan = useMutation({
    mutationFn: scanDirs,
    onError: err => addToast({ timeout: 5000, color: 'danger', title: err.message }),
    onSuccess: result => {
      addToast({
        timeout: 5000,
        title: 'Folders Scanned',
        description: result.trim(),
        color: result.startsWith('[ERR]') ? 'danger' : 'success',
      });
    },
  });
  return (
    <div className="p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))] overflow-auto w-full">
      <div className="flex flex-col items-start gap-3">
        <div className="text-large mt-2">Folders to Scan</div>
        <div className="text-small mb-2 text-default-500">Select the folders that have your audio files.</div>
        {queryDirs.data?.map(dir => (
          <div key={dir} className="flex items-center w-100 pl-2">
            <div className="text-default-500 font-mono">{dir}</div>

            <Button
              isIconOnly
              size="sm"
              radius="full"
              color="danger"
              variant="light"
              className="ml-auto shrink-0"
              onPress={async () => {
                await setDirs(queryDirs.data.filter(d => d !== dir));
                await queryDirs.refetch();
              }}>
              <XIcon className="text-medium !text-foreground" />
            </Button>
          </div>
        ))}

        <Button
          variant="flat"
          radius="sm"
          onPress={async () => {
            const selected = await open({ directory: true });
            if (selected) await setDirs([...(queryDirs.data ?? []), selected]);
            await queryDirs.refetch();
          }}>
          <PlusIcon className="text-lg" /> Add Folder
        </Button>

        <Button
          variant="flat"
          radius="sm"
          isLoading={mutationScan.isPending}
          isDisabled={!queryDirs.data?.length}
          onPress={() => mutationScan.mutate()}>
          <FileScanIcon className="text-lg" /> Scan
        </Button>
      </div>
    </div>
  );
};
