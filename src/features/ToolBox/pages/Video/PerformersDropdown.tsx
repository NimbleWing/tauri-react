import { useQuery } from '@tanstack/react-query';
import { useDebounceValue } from 'usehooks-ts';
import { pinyin, match } from 'pinyin-pro';
import { Popover, PopoverContent, PopoverTrigger, Input, Checkbox, Button, cn, Spinner } from '@heroui/react';
import { Check, X, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { getPerformers } from '@/features/HYP';
import type { PerformerDetailVo } from '@/lib/bindings/PerformerDetailVo';
import { getAssetUrl } from '@/utils/music';

type Props = {
  value: string[];
  onChange: (val: string[]) => void;
  max?: number;
  single?: boolean;
  forceClose?: boolean;
};

export function PerformersDropdown({ value, onChange, max = 0, single = false, forceClose = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounceValue(searchQuery, 500);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const { data: performers = [], isLoading } = useQuery({ queryKey: ['performers'], queryFn: getPerformers });

  const isSearchActive = debouncedSearchQuery.length > 0;
  const selected = value;

  const toggle = (performer: PerformerDetailVo) => {
    if (single) {
      onChange(selected[0] === performer.name ? [] : [performer.name]);
      return;
    }
    const set = new Set(selected);
    if (set.has(performer.name)) {
      set.delete(performer.name);
    } else if (max === 0 || set.size < max) {
      set.add(performer.name);
    }
    onChange(Array.from(set));
  };

  const toggleGroup = (country: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(country)) {
      newCollapsed.delete(country);
    } else {
      newCollapsed.add(country);
    }
    setCollapsedGroups(newCollapsed);
  };

  const clearAll = () => {
    onChange([]);
  };

  const matchPerformer = (performer: PerformerDetailVo, query: string) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();

    if (performer.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    const matchResult = match(performer.name, query);
    return matchResult !== null && matchResult.length > 0;
  };

  const groupedPerformers = useMemo(() => {
    const groups: Record<string, PerformerDetailVo[]> = {};
    performers.forEach(performer => {
      const country = performer.country || 'Unknown';
      if (!groups[country]) {
        groups[country] = [];
      }
      groups[country].push(performer);
    });

    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    return sortedGroups.map(([country, countryPerformers]) => {
      const sorted = [...countryPerformers].sort((a, b) => {
        const aPinyin = pinyin(a.name, { toneType: 'none', type: 'all' })
          .flat()
          .map(item => item.first || '')
          .join('');
        const bPinyin = pinyin(b.name, { toneType: 'none', type: 'all' })
          .flat()
          .map(item => item.first || '')
          .join('');
        return aPinyin.localeCompare(bPinyin);
      });
      return [country, sorted] as [string, PerformerDetailVo[]];
    });
  }, [performers]);

  const filteredPerformers = useMemo(() => {
    if (!debouncedSearchQuery) return null;

    return performers
      .filter(performer => matchPerformer(performer, debouncedSearchQuery))
      .sort((a, b) => {
        const aPinyin = pinyin(a.name, { toneType: 'none', type: 'all' })
          .flat()
          .map(item => item.first || '')
          .join('');
        const bPinyin = pinyin(b.name, { toneType: 'none', type: 'all' })
          .flat()
          .map(item => item.first || '')
          .join('');
        return aPinyin.localeCompare(bPinyin);
      });
  }, [performers, debouncedSearchQuery]);

  const visibleSelected = selected.slice(0, 3);
  const moreCount = Math.max(0, selected.length - 3);

  useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
    }
  }, [forceClose]);

  if (isLoading) return <Spinner size="sm" />;

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start" offset={10}>
      <PopoverTrigger>
        <Button variant="bordered" className="justify-start text-left h-auto py-2 px-3">
          <div className="flex flex-wrap items-center gap-2">
            {selected.length === 0 ? (
              <span className="text-default-400">Select performers</span>
            ) : (
              <>
                {visibleSelected.map(name => (
                  <span
                    key={name}
                    className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
                    {name}
                  </span>
                ))}
                {moreCount > 0 && (
                  <span className="bg-slate-700/50 text-slate-400 text-xs px-2 py-1 rounded-full">
                    +{moreCount} more
                  </span>
                )}
              </>
            )}
            <span className="ml-auto text-xs text-default-400 bg-slate-800/50 px-2 py-1 rounded-full">
              {selected.length} selected
            </span>
            <ChevronDown className="w-4 h-4 text-default-400 ml-1" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col h-[600px]">
          <div className="p-3 border-b border-default-200 bg-content1 shrink-0">
            <Input
              placeholder="Search performers..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              isClearable
              onClear={() => setSearchQuery('')}
              size="sm"
              variant="bordered"
              classNames={{
                input: 'text-sm',
                inputWrapper: 'bg-slate-800/50 border-slate-700',
              }}
            />
          </div>

          <div className="overflow-y-auto flex-1 min-h-0" style={{ overscrollBehavior: 'contain' }}>
            {isSearchActive ? (
              <div className="p-2">
                {filteredPerformers && filteredPerformers.length > 0 ? (
                  filteredPerformers.map(performer => {
                    if (performer.id == null) return null;
                    const isSelected = selected.includes(performer.name);
                    return (
                      <div
                        key={performer.id}
                        onClick={() => toggle(performer)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200',
                          'hover:bg-slate-700/50',
                          isSelected && 'bg-slate-700/50',
                        )}>
                        {single ? (
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-default-300 bg-transparent',
                            )}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        ) : (
                          <Checkbox isSelected={isSelected} onValueChange={() => {}} size="sm" />
                        )}

                        {performer.imagePath ? (
                          <img
                            src={getAssetUrl(performer.imagePath, performer.name)}
                            alt={performer.name}
                            className="w-8 h-8 rounded-full object-cover bg-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{performer.name}</span>
                            {performer.rating > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 font-mono">
                                {performer.rating}
                              </span>
                            )}
                          </div>
                          {performer.country && <span className="text-xs text-default-400">{performer.country}</span>}
                        </div>

                        {isSelected ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-default-400 text-sm">No performers found</div>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {groupedPerformers.map(([country, countryPerformers]) => {
                  const isCollapsed = collapsedGroups.has(country);
                  return (
                    <div key={country} className="border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleGroup(country)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-700/50 hover:bg-slate-700/70 transition-colors duration-200">
                        <span className="text-sm font-medium text-white">
                          {country}
                          <span className="text-default-400 ml-2">({countryPerformers.length})</span>
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-default-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-default-400" />
                        )}
                      </button>
                      <div
                        className={cn(
                          'transition-all duration-300 ease-in-out',
                          isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'opacity-100',
                        )}>
                        <div className="p-2 space-y-1">
                          {countryPerformers.map(performer => {
                            if (performer.id == null) return null;
                            const isSelected = selected.includes(performer.name);
                            return (
                              <div
                                key={performer.id}
                                onClick={() => toggle(performer)}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200',
                                  'hover:bg-slate-700/50',
                                  isSelected && 'bg-slate-700/50',
                                )}>
                                {single ? (
                                  <div
                                    className={cn(
                                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                                      isSelected
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-default-300 bg-transparent',
                                    )}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                  </div>
                                ) : (
                                  <Checkbox isSelected={isSelected} onValueChange={() => {}} size="sm" />
                                )}

                                {performer.imagePath ? (
                                  <img
                                    src={getAssetUrl(performer.imagePath, performer.name)}
                                    alt={performer.name}
                                    className="w-8 h-8 rounded-full object-cover bg-slate-700"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white truncate">{performer.name}</span>
                                    {performer.rating > 0 && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 font-mono">
                                        {performer.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isSelected ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isSearchActive && !single && selected.length > 0 && (
            <div className="p-3 border-t border-default-200 flex justify-between items-center bg-content1 shrink-0">
              <Button
                variant="flat"
                color="danger"
                size="sm"
                startContent={<X className="w-3 h-3" />}
                onClick={clearAll}>
                Clear All
              </Button>
              <span className="text-xs text-default-400">
                {selected.length} selected
                {max > 0 ? ` / max ${max}` : null}
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
