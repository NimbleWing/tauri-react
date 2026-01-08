import { metaFields } from './meta/fields';
import { RenderMetaField } from './meta/RenderMetaField';
/* === Props 定义 === */
interface MetaFormProps {
  // 与你页面里 state.meta 同形状
  state: Record<string, string>;
  // 统一更新句柄
  onChange: (key: string, value: string) => void;
}
export function MetaForm({ state, onChange }: MetaFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-large font-semibold">Metadata</div>
      {metaFields.map(field => (
        <RenderMetaField
          key={field.key}
          field={field}
          value={state[field.key] ?? ''}
          onChange={v => onChange(field.key, v)}
        />
      ))}
    </div>
  );
}
