import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

export type EditorType = 'new' | 'update' | 'remove';
type TagEditorModalProps = {
  type: EditorType;
  isOpen?: boolean;
  onOpenChange: (value: boolean) => void;
  onAction: (name: string, sortName: string) => Promise<void>;
  existing?: string | null;
};
export function isEditorOfType(type: EditorType, expected: EditorType) {
  return type[0] === expected[0];
}
export const TagEditorModal = ({ isOpen, onOpenChange, existing, type, onAction }: TagEditorModalProps) => {
  const isOfType = (expected: EditorType) => isEditorOfType(type, expected);
  const [name, setName] = useState(existing ?? '');
  const [sortName, setSortName] = useState(existing ?? '');
  const title = isOfType('new') ? 'New Tag' : isOfType('update') ? 'Edit Tag' : 'Remove Tag';
  return (
    <Modal isOpen={isOpen} placement="bottom-center" backdrop="blur" radius="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>

        <ModalBody>
          {isOfType('remove') ? (
            <div className="text-default-500">Are you sure you want to remove this tag?</div>
          ) : (
            <>
              {' '}
              <Input
                autoFocus
                radius="sm"
                label="Name"
                variant="flat"
                value={name}
                onValueChange={setName}
                onClear={() => setName('')}
                placeholder="Name of the Tag"
              />
              <Input
                radius="sm"
                label="Sortname"
                variant="flat"
                value={sortName}
                onValueChange={setSortName}
                onClear={() => setSortName('1')}
                placeholder="Sort of the Tag"
              />
            </>
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
                await onAction(name, sortName);
              } catch (err) {
                console.log(err);
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
