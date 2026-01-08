import { Input } from '@heroui/react';
import { SearchIcon } from 'lucide-react';

type SearchBarProps = { value: string; onChange: (value: string) => void; className?: string };
const SearchBar = ({ value, onChange, className }: SearchBarProps) => {
  return (
    <Input
      radius="sm"
      variant="flat"
      placeholder="Search"
      value={value}
      onValueChange={onChange}
      onClear={() => onChange('')}
      startContent={<SearchIcon className="text-lg text-default-500 flex-shrink-0 mr-1" />}
      classNames={{
        // TODO: ? make this solid depending on background
        base: className,
        input: 'bg-transparent placeholder:text-default-300',
        innerWrapper: 'bg-transparent',
        inputWrapper: ['dark:bg-default/30', 'dark:hover:bg-default/40', 'dark:group-data-[focus=true]:bg-default/40'],
      }}
    />
  );
};

export default SearchBar;
