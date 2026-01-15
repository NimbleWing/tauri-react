// src/meta/RenderMetaField.tsx
import { Input, Slider, Switch } from '@heroui/react';
// import { TagsSelect, PerformersSelect, StudioSelect, CountrySelect } from '~/components';
import type { MetaField } from './fields';
import { TagsSelect } from '../TagsSelect';
import { StudiosSelect } from '../StudiosSelect';
import { PerformersDropdown } from '../PerformersDropdown';

/* 下拉组件映射表 */
const SELECT_MAP = {
  tags: TagsSelect,
  performers: PerformersDropdown,
  studio: StudiosSelect,
  // country: CountrySelect,
} as const;

type Props = {
  field: MetaField;
  value: string;
  onChange: (v: string) => void;
  forceClose?: boolean;
};

export function RenderMetaField({ field, value, onChange, forceClose = false }: Props) {
  const { component, label, required } = field;

  /* ===== 通用 label ===== */
  const labelNode = (
    <span className="text-sm font-medium text-default-700">
      {label}
      {required && <span className="text-danger ml-1">*</span>}
    </span>
  );

  /* ===== select 分支 ===== */
  if (component === 'select' && field.select) {
    const Select = SELECT_MAP[field.select.dataKey as keyof typeof SELECT_MAP];
    return (
      <div className="flex flex-col gap-2 overflow-visible">
        {labelNode}
        <Select
          value={value ? value.split(',') : []}
          onChange={(val: string[]) => onChange(val.join(','))}
          max={field.select.max}
          single={field.select.single}
          forceClose={forceClose}
        />
      </div>
    );
  }

  /* ===== switch 分支 ===== */
  if (component === 'switch' && field.switch) {
    const checked = value === 'true';
    return (
      <div className="flex items-center gap-3">
        <Switch
          isSelected={checked}
          onValueChange={v => onChange(v ? 'true' : 'false')}
          defaultSelected={field.switch.defaultOn}>
          {labelNode}
        </Switch>
      </div>
    );
  }

  /* ===== slider 分支 ===== */
  if (component === 'slider' && field.slider) {
    return (
      <div className="flex flex-col gap-2">
        {labelNode}
        <Slider
          // size="sm"
          label="-"
          step={field.slider.step ?? 1}
          minValue={field.slider.min}
          maxValue={field.slider.max}
          value={Number(value)}
          onChange={v => onChange(String(v))}
        />
      </div>
    );
  }

  /* ===== 默认 input ===== */
  return (
    <div className="flex flex-col gap-2">
      {labelNode}
      <Input
        isRequired={required}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={value}
        onValueChange={onChange}
      />
    </div>
  );
}
