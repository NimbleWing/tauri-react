import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { CheckIcon, HashIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getTags } from '.';
import { useQuery } from '@tanstack/react-query';

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
  const [sortName, setSortName] = useState('9999');
  const [isChecking, setIsChecking] = useState(false);
  const [existsError, setExistsError] = useState<string | null>(null);
  const title = isOfType('new') ? 'New Tag' : isOfType('update') ? 'Edit Tag' : 'Remove Tag';

  const { data: existingTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    enabled: isOfType('new'),
  });

  useEffect(() => {
    if (isOpen) {
      setName(existing ?? '');
      setSortName('9999');
      setExistsError(null);
    }
  }, [isOpen, existing]);

  useEffect(() => {
    if (!isOfType('new') || !name.trim()) {
      setExistsError(null);
      return;
    }

    const checkExists = async () => {
      setIsChecking(true);
      const trimmedName = name.trim();
      const lowerName = trimmedName.toLowerCase();

      const exactMatch = existingTags.find(tag => tag.name.trim().toLowerCase() === lowerName);
      if (exactMatch) {
        setExistsError(`Tag "${exactMatch.name}" already exists`);
        setIsChecking(false);
        return;
      }

      const similarMatch = existingTags.find(tag => {
        const tagLower = tag.name.trim().toLowerCase();
        return tagLower.includes(lowerName) || lowerName.includes(tagLower);
      });
      if (similarMatch) {
        setExistsError(`Similar tag "${similarMatch.name}" already exists`);
      } else {
        setExistsError(null);
      }
      setIsChecking(false);
    };

    const timer = setTimeout(checkExists, 300);
    return () => clearTimeout(timer);
  }, [name, existingTags, isOfType]);

  const isValid = useMemo(() => {
    if (isOfType('new')) {
      return name.trim() && !existsError && !isChecking;
    }
    return name.trim() && (isOfType('update') ? name !== existing : true);
  }, [name, existsError, isChecking, existing, isOfType]);

  return (
    <Modal isOpen={isOpen} placement="center" backdrop="blur" radius="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <HashIcon className="w-5 h-5 text-secondary-500" />
            <span>{title}</span>
          </div>
        </ModalHeader>

        <ModalBody>
          {isOfType('remove') ? (
            <div className="py-4 text-default-500">Are you sure you want to remove this tag?</div>
          ) : (
            <>
              <Input
                autoFocus
                radius="sm"
                label="Name"
                variant="flat"
                value={name}
                onValueChange={setName}
                placeholder="Enter tag name"
                isInvalid={!!existsError}
                errorMessage={existsError}
                classNames={{
                  inputWrapper: 'bg-default-100',
                }}
              />
              <Input
                radius="sm"
                label="Sort Name"
                variant="flat"
                value={sortName}
                onValueChange={setSortName}
                placeholder="Enter sort name"
                classNames={{
                  inputWrapper: 'bg-default-100',
                }}
              />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button radius="sm" variant="light" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            radius="sm"
            variant="flat"
            color={isOfType('remove') ? 'danger' : 'primary'}
            isDisabled={isOfType('new') ? !isValid : !name.trim() || (isOfType('update') && name === existing)}
            onPress={async () => {
              try {
                await onAction(name, sortName);
              } catch (err) {
                console.log(err);
                addToast({ title, description: (err as Error).message, color: 'danger' });
              }
            }}
            startContent={<CheckIcon className="w-4 h-4" />}>
            {isOfType('remove') ? 'Remove' : isOfType('new') ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
