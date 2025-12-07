import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

export type EditorType = 'new' | 'update' | 'remove';
type TagEditorModalProps = {
  type: EditorType;
  isOpen?: boolean;
  onOpenChange: (value: boolean) => void;
  onAction: (name: string, image?: string) => Promise<void>;
  existing?: string | null;
};
export function isEditorOfType(type: EditorType, expected: EditorType) {
  return type[0] === expected[0];
}
export const StudioEditorModel = ({ isOpen, onOpenChange, existing, type, onAction }: TagEditorModalProps) => {
  const isOfType = (expected: EditorType) => isEditorOfType(type, expected);
  const [imageB64, setImageB64] = useState<string | undefined>(undefined);
  /** 选择图片 -> 转 base64 */
  const handlePickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImageB64(reader.result as string);
    };
    input.click();
  };
  const [name, setName] = useState(existing ?? '');
  const title = isOfType('new') ? 'New Studio' : isOfType('update') ? 'Edit Studio' : 'Remove Studio';
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
                placeholder="Name of the Studio"
              />
              <div className="mt-2">
                <Button size="sm" variant="flat" onPress={handlePickImage}>
                  {imageB64 ? 'Change cover' : 'Upload cover'}
                </Button>
                {imageB64 && <img src={imageB64} alt="preview" className="mt-2 h-32 w-full object-cover rounded" />}
              </div>
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
                await onAction(name, imageB64);
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
