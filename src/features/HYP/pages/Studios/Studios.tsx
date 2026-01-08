import { addToast, Button, Spinner, useDisclosure } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { addStudio, getStudios } from '.';
import { StudioCard } from './StudioCard';
import { StudioEditorModel } from './StudioEditorModal';

export const Studios = () => {
  const editor = useDisclosure();
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studios'],
    queryFn: getStudios,
  });
  console.log(data);
  const handleAdd = async (name: string, image?: string) => {
    try {
      await addStudio(name, image);
      await refetch();
      editor.onClose();
      addToast({ title: 'Created', color: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ title: msg, color: 'danger' });
    }
  };
  if (isLoading) return <Spinner className="m-auto" />;
  if (error) return <div className="p-6 text-danger">{String(error)}</div>;
  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-auto pt-[calc(theme(spacing.10)+theme(spacing.2))]">
      {/* 顶部操作栏 */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-default-50/25 px-6 py-3 backdrop-blur-lg">
        <Button radius="sm" variant="flat" onPress={editor.onOpen}>
          <PlusIcon className="text-lg" /> Create New
        </Button>
      </header>
      {/* 卡片列表*/}
      <main className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 && <div className="col-span-full text-center text-default-500">No studios yet</div>}
        {data.map(studio => (
          <StudioCard key={studio.id} studio={studio} onEdit={() => {}} onDelete={() => {}} />
        ))}
      </main>
      {/* 新建/编辑弹窗 */}
      <StudioEditorModel type="new" isOpen={editor.isOpen} onOpenChange={editor.onOpenChange} onAction={handleAdd} />
    </div>
  );
};
