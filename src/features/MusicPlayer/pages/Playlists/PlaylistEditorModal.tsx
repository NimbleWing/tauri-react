import { Modal, ModalContent, ModalHeader, ModalBody, Input, ModalFooter, Button, addToast } from '@heroui/react';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

export type EditorType = 'new' | 'update' | 'remove';
type PlaylistEditorModalProps = {
  type: EditorType;
  isOpen?: boolean;
  onOpenChange: (value: boolean) => void;
  onAction: (name: string) => Promise<void>;
  existing?: string | null;
};
export function isEditorOfType(type: EditorType, expected: EditorType) {
  return type[0] === expected[0];
}
const PlaylistEditorModal = ({ isOpen, onOpenChange, existing, type, onAction }: PlaylistEditorModalProps) => {
  const isOfType = (expected: EditorType) => isEditorOfType(type, expected);

  const [name, setName] = useState(existing ?? '');
  const title = isOfType('new') ? 'New Playlist' : isOfType('update') ? 'Edit Playlist' : 'Remove Playlist';

  return (
    <Modal isOpen={isOpen} placement="bottom-center" backdrop="blur" radius="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>

        <ModalBody>
          {isOfType('remove') ? (
            <div className="text-default-500">Are you sure you want to remove this playlist?</div>
          ) : (
            <Input
              autoFocus
              radius="sm"
              label="Name"
              variant="flat"
              value={name}
              onValueChange={setName}
              onClear={() => setName('')}
              placeholder="Name of the playlist"
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            radius="sm"
            variant="flat"
            color={isOfType('remove') ? 'danger' : 'success'}
            isDisabled={!name.trim() || (isOfType('update') && name === existing)}
            onPress={async () => {
              try {
                await onAction(name);
              } catch (err) {
                addToast({ title, description: (err as Error).message, color: 'danger' });
              }
            }}>
            <CheckIcon className="text-lg" /> {isOfType('remove') ? 'Remove' : isOfType('new') ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default PlaylistEditorModal;
