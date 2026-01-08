import { UseSelection } from '@/hooks/useSelection';
import { Checkbox, Chip } from '@heroui/react';

type SelectAllControlsProps<T> = { data: T[]; selection: UseSelection<T> };
const SelectAllControls = <T,>({ data, selection }: SelectAllControlsProps<T>) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        color="success"
        radius="full"
        isSelected={selection.values.length === data.length}
        onValueChange={() => {
          if (selection.values.length === data.length) return selection.clear();
          selection.set(data);
        }}
      />

      <Chip variant="flat" onClose={selection.clear} classNames={{ base: 'shrink-0 font-mono', closeButton: 'mx-0.5' }}>
        {selection.values.length}
      </Chip>
    </div>
  );
};
export default SelectAllControls;
