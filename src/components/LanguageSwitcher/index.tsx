import { useBaseStore } from '@/store';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { Globe } from 'lucide-react';
import { useState } from 'react';

type LanguageSwitcherProps = {
  value?: string;
  onChange?: (value: string) => void;
};
export const LanguageSwitcher = ({ value, onChange }: LanguageSwitcherProps) => {
  const { locales, locale, updateLocale } = useBaseStore();
  const currentLocale = value || locale;
  function onSelectChange(nextLocale: string) {
    updateLocale(nextLocale);
    onChange?.(nextLocale);
  }
  const [selectedKeys, setSelectedKeys] = useState(new Set([currentLocale]));

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="flat" startContent={<Globe className="text-lg" />}>
          {locales.find(i => i.value === currentLocale)?.label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Single selection example"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        onSelectionChange={keys => setSelectedKeys(keys as Set<string>)}>
        {locales.map(locale => (
          <DropdownItem
            key={locale.value}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              onSelectChange(locale.value);
            }}>
            <div className="flex">{locale.label}</div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
