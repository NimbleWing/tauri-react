import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { Moon, Sun, SunMoon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@heroui/use-theme';
type ThemeSwitcherProps = {
  onChange?: (theme: string) => Promise<void>;
};
export const ThemeSwitcher = ({ onChange }: ThemeSwitcherProps) => {
  const { t } = useTranslation();
  const { setTheme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="flat"
            isIconOnly
            type="button"
            className="py-2 transition duration-300 ease-in-out cursor-pointer">
            <SunMoon className="text-lg w-[24px] h-[24px]" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={async key => {
            await onChange?.(key.toString());
            if (key === 'system') {
              setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } else {
              setTheme(key.toString());
            }
          }}>
          <DropdownItem key="light" startContent={<Sun className="text-lg w-[24px] h-[24px]" />}>
            {t('Main.preference.light-mode')}
          </DropdownItem>
          <DropdownItem key="dark" startContent={<Moon className="text-lg w-[24px] h-[24px]" />}>
            {t('Main.preference.dark-mode')}
          </DropdownItem>
          <DropdownItem key="system" startContent={<SunMoon className="text-lg w-[24px] h-[24px]" />}>
            {t('Main.preference.follow-system')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
