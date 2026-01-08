// PerformerEditorModal.tsx
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@heroui/react';
import { CheckIcon, XIcon, UploadCloudIcon } from 'lucide-react';
import { useState, useCallback, ChangeEvent } from 'react';
import { TagsIdSelect } from '../Tags/TagsIdSelect';

/* ---------- 类型对齐 Rust DTO ---------- */
export type CreatePerformerDto = {
  name: string;
  rating: number | null; // i64 → number
  country: string | null;
  image: string | null; // base64
  tags: number[] | null;
};

export type EditorType = 'new' | 'update' | 'remove';

type Props = {
  type: EditorType;
  isOpen?: boolean;
  onOpenChange: (v: boolean) => void;
  /* 如果你只想传 name，可把下面换成 (name: string) => Promise<void> */
  onAction: (dto: CreatePerformerDto) => Promise<void>;
  /* 编辑时回显用 */
  existing?: CreatePerformerDto | null;
};

/* 一些假数据，实际替换成接口 */
const COUNTRIES = ['中国', '美国', '日本'];

export const PerformerEditorModal = ({ type, isOpen, onOpenChange, existing, onAction }: Props) => {
  /* -------------- 本地表单状态 -------------- */
  const [name, setName] = useState(existing?.name ?? '');
  const [rating, setRating] = useState<string>(existing?.rating?.toString() ?? '');
  const [country, setCountry] = useState<string>(existing?.country ?? '');
  const [image, setImage] = useState<string>(existing?.image ?? '');
  const [tags, setTags] = useState<number[]>(existing?.tags ?? []);

  /* -------------- 工具函数 -------------- */
  const isOfType = (t: EditorType) => type[0] === t[0];

  /* 图片选择 → base64 */
  const onPickImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage((reader.result as string).split(',')[1] /* 去掉 data:image/...;base64, */);
    reader.readAsDataURL(file);
  }, []);

  /* 提交 */
  const handleSubmit = async () => {
    try {
      const dto: CreatePerformerDto = {
        name: name.trim(),
        rating: rating.trim() === '' ? null : Number(rating),
        country: country.trim() === '' ? null : country,
        image: image.trim() === '' ? null : image,
        tags: tags.length === 0 ? null : Array.from(tags),
      };
      await onAction(dto);
      onOpenChange(false);
    } catch (err: any) {
      addToast({ title: 'Error', description: err.message, color: 'danger' });
    }
  };

  /* -------------- 渲染 -------------- */
  const title = type === 'new' ? 'New Performer' : type === 'update' ? 'Edit Performer' : 'Remove Performer';

  return (
    <Modal isOpen={isOpen} placement="bottom-center" backdrop="blur" radius="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>

        <ModalBody className="gap-4">
          {type === 'remove' ? (
            <div className="text-default-500">Are you sure you want to remove this performer?</div>
          ) : (
            <>
              {/* ---- 名称 ---- */}
              <Input
                autoFocus
                radius="sm"
                label="Name"
                variant="flat"
                value={name}
                onValueChange={setName}
                placeholder="Performer name"
              />

              {/* ---- 评分 0-100 ---- */}
              <Input
                radius="sm"
                label="Rating (0-100)"
                variant="flat"
                value={rating}
                onValueChange={setRating}
                placeholder="leave empty if no rating"
                type="number"
                min={0}
                max={100}
              />

              {/* ---- 国家 ---- */}
              <Select
                radius="sm"
                label="Country"
                variant="flat"
                selectedKeys={country ? [country] : []}
                onSelectionChange={keys => setCountry(keys.anchorKey as string)}
                className="w-full">
                {COUNTRIES.map(c => (
                  <SelectItem key={c}>{c}</SelectItem>
                ))}
              </Select>

              {/* ---- 头像 ---- */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="performer-avatar"
                  className="cursor-pointer rounded-md border border-default-300 px-3 py-2 text-sm flex items-center gap-2 hover:bg-default-100">
                  <UploadCloudIcon size={16} />
                  Upload image
                </label>
                <input id="performer-avatar" type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                {image && (
                  <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => setImage('')}>
                    <XIcon size={14} />
                  </Button>
                )}
              </div>
              {image && (
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt="preview"
                  className="max-h-32 rounded-md border border-default-200"
                />
              )}

              {/* ---- 标签 ---- */}
              <TagsIdSelect value={tags} onChange={setTags} />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            radius="sm"
            variant="flat"
            color={type === 'remove' ? 'danger' : 'success'}
            isDisabled={
              type !== 'remove' && !name.trim()
              // 你也可以再加其它校验
            }
            onPress={handleSubmit}>
            <CheckIcon className="text-lg" />
            {type === 'remove' ? 'Remove' : type === 'new' ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
