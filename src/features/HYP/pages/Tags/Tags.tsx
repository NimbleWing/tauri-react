import {
  Button,
  useDisclosure,
  Spinner,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { PlusIcon, SearchIcon, HashIcon, ListIcon, GridIcon, TrashIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { addTag, deleteTag, getTags, TagEditorModal } from '.';
import { TagCard } from './TagListView';
import { TagGridView } from './TagGridView';
import { addToast } from '@heroui/react';

export const Tags = () => {
  const editor = useDisclosure();
  const deleteModal = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [tagToDelete, setTagToDelete] = useState<{ id: number; name: string } | null>(null);
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const filteredTags = data.filter(
    tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.sortName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  const confirmDelete = (id: number, name: string) => {
    setTagToDelete({ id, name });
    deleteModal.onOpen();
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id);
      await refetch();
      deleteModal.onClose();
      setTagToDelete(null);
      addToast({ title: 'Deleted', color: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ title: msg, color: 'danger' });
    }
  };

  if (isLoading) return <Spinner className="m-auto mt-10" />;
  if (error) return <div className="p-6 text-danger">{String(error)}</div>;

  return (
    <>
      <div className="pt-[calc(theme(spacing.10)+theme(spacing.2))] overflow-auto w-full flex flex-col h-full">
        <div
          className="px-6 py-3 flex items-center gap-3 rounded-small
          sticky top-0 inset-x-0 bg-default-50/25 backdrop-blur-lg z-50 backdrop-saturate-125">
          <Input
            radius="sm"
            placeholder="Search tags..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<SearchIcon className="text-default-400" />}
            className="w-64"
            classNames={{
              inputWrapper: 'bg-default-100/50',
            }}
          />
          <div className="flex items-center gap-1 p-1 rounded-small bg-default-100/50">
            <Button
              isIconOnly
              size="sm"
              radius="sm"
              variant={view === 'list' ? 'flat' : 'light'}
              onPress={() => setView('list')}>
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="sm"
              variant={view === 'grid' ? 'flat' : 'light'}
              onPress={() => setView('grid')}>
              <GridIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1" />
          <Button radius="sm" variant="flat" onPress={editor.onOpen} startContent={<PlusIcon className="text-lg" />}>
            Create New
          </Button>
        </div>

        {view === 'list' ? (
          filteredTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-default-400">
              <div className="p-4 rounded-full bg-default-100 mb-4">
                <HashIcon className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium">No tags found</p>
              <p className="text-sm opacity-60">Create a new tag to get started</p>
            </div>
          ) : (
            <div className="flex flex-col px-3 shrink-0 w-full relative divide-y divide-default/30">
              {filteredTags.map(tag => (
                <TagCard key={tag.id!} tag={tag} onDelete={confirmDelete} />
              ))}
            </div>
          )
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TagGridView tags={filteredTags} onDelete={confirmDelete} />
          </div>
        )}
      </div>

      <TagEditorModal type="new" isOpen={editor.isOpen} onOpenChange={editor.onOpenChange} onAction={handleAdd} />

      <Modal
        isOpen={deleteModal.isOpen}
        placement="center"
        backdrop="blur"
        radius="sm"
        onOpenChange={deleteModal.onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <TrashIcon className="w-5 h-5 text-danger" />
              <span>Delete Tag</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-500">Are you sure you want to delete "{tagToDelete?.name}"?</p>
            <p className="text-sm text-default-400">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button radius="sm" variant="light" onPress={deleteModal.onClose}>
              Cancel
            </Button>
            <Button radius="sm" color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
