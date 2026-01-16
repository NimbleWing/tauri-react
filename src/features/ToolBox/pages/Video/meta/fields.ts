export interface MetaField {
  key: string;
  label: string;
  required?: boolean;
  component: 'input' | 'select' | 'switch' | 'slider';
  /* ===== 组件专属参数 ===== */
  select?: { dataKey: string; max?: number; single?: boolean };
  switch?: { defaultOn?: boolean };
  slider?: { min: number; max: number; step?: number };
}
export const metaFields: MetaField[] = [
  { key: 'title', label: 'Title', required: true, component: 'input' },
  { key: 'subtitle', label: 'Subtitle', component: 'input' },
  {
    key: 'performers',
    label: 'Performers',
    component: 'select',
    select: { dataKey: 'performers', single: false },
    required: true,
  },
  { key: 'studio', label: 'Studio', component: 'select', select: { dataKey: 'studio', single: false } },
  { key: 'code', label: 'Code', component: 'input' },
  { key: 'rating', label: 'Rating', component: 'slider', slider: { min: 0, max: 100, step: 1 } },
  { key: 'country', label: 'Country', component: 'input', required: true },
  { key: 'tags', label: 'Tags', component: 'select', select: { dataKey: 'tags', single: false }, required: true },
];
