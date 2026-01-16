import { metaFields } from './meta/fields';
import { RenderMetaField } from './meta/RenderMetaField';
interface MetaFormProps {
  // 与你页面里 state.meta 同形状
  state: Record<string, string>;
  onChange: (key: string, value: string) => void;
  forceClose?: boolean;
}
export function MetaForm({ state, onChange, forceClose = false }: MetaFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-large font-semibold">Metadata</div>
      {metaFields.map(field => (
        <RenderMetaField
          key={field.key}
          field={field}
          value={state[field.key] ?? ''}
          onChange={v => onChange(field.key, v)}
          forceClose={forceClose}
        />
      ))}
    </div>
  );
}
