// src/components/TagCard.tsx
import { Button } from '@heroui/react';
import type { Tag } from '.';
import { PencilIcon, TrashIcon } from 'lucide-react';

type Props = {
  tag: Tag;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export function TagCard({ tag, onEdit, onDelete }: Props) {
  /* 样式数据保持原样 - 可以后续换成真实指标 */
  const { id, name, sortName } = tag;
  if (id == null) return null; //
  // const mem = 76.5;

  /* 空值守卫：没 id 就不渲染（或返回禁用样式） */
  // if (!tag.id) return null;
  if (tag.id === null || tag.id === undefined) return null;
  return (
    <div onClick={() => onEdit?.(id)} className="group relative cursor-pointer">
      {/* 背景光晕 */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-50 group-hover:blur-2xl" />

      {/* 主体卡片 */}
      <div className="relative flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1 pr-4">
        {/* 左侧图标 + 百分比 */}
        <div className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-teal-500/20 blur-sm transition-all duration-300 group-hover:bg-teal-500/30 group-hover:blur-md" />
            <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="relative h-6 w-6 text-teal-500">
              <path
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{sortName}</span>
              <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-emerald-500 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Performance</span>
          </div>
        </div>

        <div className="ml-4 flex flex-col items-start">
          <span className="text-base font-bold text-white drop-shadow-md">{name}</span>
          <span className="text-[10px] text-slate-400">Online</span>
        </div>

        {/* ===== 新增霓虹按钮组 ===== */}
        <div className="ml-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* 编辑 */}
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="flat"
            className="border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:shadow-lg hover:shadow-teal-500/40"
            onPress={() => {
              onEdit?.(id);
            }}>
            <PencilIcon className="h-4 w-4" />
          </Button>

          {/* 删除 */}
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="flat"
            className="border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 hover:shadow-lg hover:shadow-danger/40"
            onPress={() => {
              onDelete?.(id);
            }}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* 顶部/底部高光线 */}
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}
