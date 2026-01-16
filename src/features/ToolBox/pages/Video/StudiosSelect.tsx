import { useQuery } from '@tanstack/react-query';
import { Spinner, cn } from '@heroui/react';
import { Check, TagIcon, X } from 'lucide-react';
import { getStudios, Studio } from '@/features/HYP';

type Props = {
  value: string[];
  onChange: (val: string[]) => void;
  max?: number;
  single?: boolean;
};

export function StudiosSelect({ value, onChange, max = 0, single = false }: Props) {
  const { data = [], isLoading } = useQuery({ queryKey: ['studios'], queryFn: getStudios });
  if (isLoading) return <Spinner size="sm" />;

  const toggle = (t: Studio) => {
    if (single) {
      onChange(value[0] === t.name ? [] : [t.name]);
      return;
    }
    const set = new Set(value);
    if (set.has(t.name)) set.delete(t.name);
    else if (max === 0 || set.size < max) set.add(t.name);
    onChange(Array.from(set));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {data.map(studio => {
        const selected = value.includes(studio.name);
        if (studio.id == null) return null;
        return (
          <button
            key={studio.id}
            onClick={() => toggle(studio)}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
              'border border-transparent',
              selected
                ? 'bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100',
            )}>
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border transition-all',
                selected
                  ? 'border-emerald-400 bg-emerald-400/20'
                  : 'border-slate-600 bg-slate-900 group-hover:border-emerald-500',
              )}>
              {!selected && <TagIcon className="h-3 w-3 text-slate-500" />}
              {selected && <Check className={cn('h-3 w-3 text-emerald-400', single && 'group-hover:hidden')} />}
              {selected && single && <X className="hidden h-3 w-3 text-emerald-400 group-hover:block" />}
            </div>

            <span>{studio.name}</span>

            {selected && (
              <div className="absolute -inset-px rounded-full bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-70" />
            )}
          </button>
        );
      })}
    </div>
  );
}
