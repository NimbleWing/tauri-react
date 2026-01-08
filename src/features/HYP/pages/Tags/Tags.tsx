import { Button, useDisclosure, Spinner } from '@heroui/react';
import { PlusIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { addTag, deleteTag, getTags, TagEditorModal } from '.';
import { TagCard } from './TagCard';
import { addToast } from '@heroui/react';

export const Tags = () => {
  const editor = useDisclosure();
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });
  console.log(data, error);
  const handleAdd = async (name: string, sortName: string) => {
    try {
      await addTag(name, sortName);
      await refetch();
      editor.onClose();
      addToast({ title: 'Created', color: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ title: msg, color: 'danger' });
    }
  };
  const handleDelete = async (tagId: number) => {
    await deleteTag(tagId);
    await refetch();
  };
  /* ======= 渲染 ======= */
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

      {/* 卡片列表 */}
      <main className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 && <div className="col-span-full text-center text-default-500">No tags yet</div>}
        {data.map(tag => (
          <TagCard key={tag.id} tag={tag} onEdit={() => {}} onDelete={handleDelete} />
        ))}
      </main>

      {/* 新建/编辑弹窗 */}
      <TagEditorModal type="new" isOpen={editor.isOpen} onOpenChange={editor.onOpenChange} onAction={handleAdd} />
    </div>
  );
};
