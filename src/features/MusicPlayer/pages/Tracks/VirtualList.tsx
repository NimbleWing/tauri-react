import { Virtuoso } from 'react-virtuoso';
import { ContainerProps, FooterProps, HeaderProps } from './SortableVirtualList';
import { cn } from '@heroui/react';
import type { ItemProps as VirtuosoItemProps } from 'react-virtuoso';
import { useEffect, useState } from 'react';
export type ListChildren<T> = (item: T, index: number) => React.ReactNode;
const DEFAULT_OVERSCAN = 10;
type VirtualListProps<T> = {
  data: T[];
  className?: string;
  overscan?: number;
  children: ListChildren<T>;
  components: {
    Container?: (props: ContainerProps) => React.ReactNode;
    Header?: (props: HeaderProps) => React.ReactNode;
    Footer?: (props: FooterProps) => React.ReactNode;
  };
};

export function VirtualList<T>({
  data,
  children,
  className,
  overscan = DEFAULT_OVERSCAN,
  components: { Container, Header, Footer },
}: VirtualListProps<T>) {
  return (
    <Virtuoso
      data={data}
      overscan={overscan}
      components={{ Item: VirtualItem, List: Container, Header, Footer }}
      className={cn('size-full shrink-0', className)}
      itemContent={(index, item) => children(item, index)}
    />
  );
}

type VirtualItemProps<T> = VirtuosoItemProps<T>;

function VirtualItem<T>({ item: _, ...props }: VirtualItemProps<T>) {
  // needed to preserve height
  const [size, setSize] = useState(0);
  const knownSize = props['data-known-size'];

  useEffect(() => {
    if (knownSize) setSize(knownSize);
  }, [knownSize]);

  return (
    <div
      {...props}
      style={{ ...props.style, '--item-height': `${size}px` } as React.CSSProperties}
      className="empty:min-h-[var(--item-height)] empty:box-border"
    />
  );
}
