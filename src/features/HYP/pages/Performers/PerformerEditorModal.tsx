import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

export type EditorType = 'new' | 'update' | 'remove';
type PerformerEditorModalProps = {
  type: EditorType;
  isOpen?: boolean;
  onOpenChange: (value: boolean) => void;
  onAction: (name: string) => Promise<void>;
  existing?: string | null;
};
export function isEditorOfType(type: EditorType, expected: EditorType) {
  return type[0] === expected[0];
}
export const PerformerEditorModel = ({ isOpen, onOpenChange, existing, type, onAction }: PerformerEditorModalProps) => {
  const isOfType = (expected: EditorType) => isEditorOfType(type, expected);
  const [name, setName] = useState(existing ?? '');
  const title = isOfType('new') ? 'New Performer' : isOfType('update') ? 'Edit Performer' : 'Remove Performer';
  return (
    <Modal isOpen={isOpen} placement="bottom-center" backdrop="blur" radius="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>

        <ModalBody>
          {isOfType('remove') ? (
            <div className="text-default-500">Are you sure you want to remove this studio?</div>
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
                placeholder="Name of the Performer"
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
