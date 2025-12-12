// src/components/TagCard.tsx
import { Button } from '@heroui/react';
import type { Studio } from '.';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { getAssetUrl } from '@/utils/music';
import { Card, CardHeader, CardBody, CardFooter, Image } from '@heroui/react';

type Props = {
  studio: Studio;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export function StudioCard({ studio, onEdit, onDelete }: Props) {
  /* 样式数据保持原样 - 可以后续换成真实指标 */
  const { id, name } = studio;
  if (id == null) return null; //
  // const mem = 76.5;
  console.log(studio.imagePath);
  /* 空值守卫：没 id 就不渲染（或返回禁用样式） */
  // if (!tag.id) return null;
  if (studio.id === null || studio.id === undefined) return null;
  return (
    // <Card className="py-4">
    //   <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
    //     <p className="text-tiny uppercase font-bold">Daily Mix</p>
    //     <small className="text-default-500">12 Tracks</small>
    //     <h4 className="font-bold text-large">{name}</h4>
    //   </CardHeader>
    //   <CardBody className="overflow-visible py-2">
    //     <Image
    //       alt="Card background"
    //       className="object-cover rounded-xl"
    //       src={getAssetUrl(studio.imagePath || '', studio.updatedAt!)}
    //       width={200}
    //       height={200}
    //     />
    //   </CardBody>
    // </Card>
    <Card isFooterBlurred className="w-full h-[200px] col-span-12 sm:col-span-5">
      <CardHeader className="absolute z-10 top-1 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">New</p>
        <h4 className="text-black font-medium text-2xl">{name}</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt="Card example background"
        className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
        src={getAssetUrl(studio.imagePath || '', studio.updatedAt!)}
      />
      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
        <div>
          <p className="text-black text-tiny">Available soon.</p>
          <p className="text-black text-tiny">Get notified.</p>
        </div>
        <Button className="text-tiny" color="primary" radius="full" size="sm">
          Notify Me
        </Button>
      </CardFooter>
    </Card>
  );
  // return (
  //   <div onClick={() => onEdit?.(id)} className="group relative cursor-pointer">
  //     {/* 背景光晕 */}
  //     <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-50 group-hover:blur-2xl" />
  //     {studio.imagePath && (
  //       <img
  //         src={getAssetUrl(studio.imagePath, studio.updatedAt!)}
  //         alt={studio.name}
  //         className="aspect-square w-full rounded-xl object-cover"
  //       />
  //     )}
  //     {/* 主体卡片 */}
  //     <div className="relative flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1 pr-4">
  //       {/* 左侧图标 + 百分比 */}
  //       <div className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2">
  //         <div className="relative">
  //           <div className="absolute -inset-1 rounded-lg bg-teal-500/20 blur-sm transition-all duration-300 group-hover:bg-teal-500/30 group-hover:blur-md" />
  //           <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="relative h-6 w-6 text-teal-500">
  //             <path
  //               d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
  //               strokeWidth={2}
  //               strokeLinejoin="round"
  //               strokeLinecap="round"
  //             />
  //           </svg>
  //         </div>
  //         <div className="flex flex-col">
  //           <div className="flex items-center gap-1">
  //             <span className="text-lg font-bold text-white">1</span>
  //             <svg
  //               stroke="currentColor"
  //               viewBox="0 0 24 24"
  //               fill="none"
  //               className="h-4 w-4 text-emerald-500 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
  //               <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
  //             </svg>
  //           </div>
  //           <span className="text-[10px] font-medium text-slate-400">Performance</span>
  //         </div>
  //       </div>

  //       <div className="ml-4 flex flex-col items-start">
  //         <span className="text-base font-bold text-white drop-shadow-md">{name}</span>
  //         <span className="text-[10px] text-slate-400">Online</span>
  //       </div>
  //       {/* 原来状态点保留 */}
  //       <div className="ml-auto flex items-center gap-1.5">
  //         <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
  //         <span className="text-xs font-semibold text-slate-300">RUNNING</span>
  //       </div>
  //       {/* ===== 新增霓虹按钮组 ===== */}
  //       <div className="ml-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
  //         {/* 编辑 */}
  //         <Button
  //           isIconOnly
  //           size="sm"
  //           radius="full"
  //           variant="flat"
  //           className="border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:shadow-lg hover:shadow-teal-500/40"
  //           onPress={() => {
  //             onEdit?.(id);
  //           }}>
  //           <PencilIcon className="h-4 w-4" />
  //         </Button>

  //         {/* 删除 */}
  //         <Button
  //           isIconOnly
  //           size="sm"
  //           radius="full"
  //           variant="flat"
  //           className="border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 hover:shadow-lg hover:shadow-danger/40"
  //           onPress={() => {
  //             onDelete?.(id);
  //           }}>
  //           <TrashIcon className="h-4 w-4" />
  //         </Button>
  //       </div>

  //       {/* 顶部/底部高光线 */}
  //       <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  //       <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  //     </div>
  //   </div>
  // );
}
