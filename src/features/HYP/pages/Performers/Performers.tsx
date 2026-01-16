import { addToast, Button, Spinner, useDisclosure } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { addPerformer, getPerformers } from '.';
import { PerformerCard } from './PerformerCard';
import { CreatePerformerDto, PerformerEditorModal } from './PerformerEditorModal';
// import { useState } from 'react';

export const Performers = () => {
  const editor = useDisclosure();
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['performers'],
    queryFn: getPerformers,
  });
  console.log(data);
  const handleAdd = async (dto: CreatePerformerDto) => {
    try {
      await addPerformer(dto);
      await refetch();
      editor.onClose();
      addToast({ title: 'Created', color: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ title: msg, color: 'danger' });
    }
  };
  if (isLoading) return <Spinner className="m-auto" />;
  if (error) return <div className="p-6 text-danger">{String(error.message)}</div>;

  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-auto pt-[calc(theme(spacing.10)+theme(spacing.2))]">
      {/* 顶部操作栏 */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-default-50/25 px-6 py-3 backdrop-blur-lg">
        <Button radius="sm" variant="flat" onPress={editor.onOpen}>
          <PlusIcon className="text-lg" /> Create New
        </Button>
      </header>
      {/* 卡片列表*/}
      <main className="min-h-screen  via-gray-800 to-black p-8">
        {sortedData.length === 0 && <div className="col-span-full text-center text-default-500">No performers yet</div>}
        {sortedData.map(performer => (
          <PerformerCard key={performer.id} performer={performer} onEdit={() => {}} onDelete={() => {}} />
        ))}
      </main>
      {/* 新建/编辑弹窗 */}
      <PerformerEditorModal type="new" isOpen={editor.isOpen} onOpenChange={editor.onOpenChange} onAction={handleAdd} />
    </div>
  );
};
