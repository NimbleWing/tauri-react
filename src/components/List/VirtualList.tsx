import React from 'react';
import { ContainerProps, DEFAULT_OVERSCAN, FooterProps, HeaderProps } from '.';
import { Virtuoso } from 'react-virtuoso';
import { VirtualItem } from './VirtualItem';
import { cn } from '@heroui/react';

export type ListChildren<T> = (item: T, index: number) => React.ReactNode;
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

export const VirtualList = <T,>({
  data,
  children,
  className,
  overscan = DEFAULT_OVERSCAN,
  components: { Container, Header, Footer },
}: VirtualListProps<T>) => {
  return (
    <Virtuoso
      data={data}
      overscan={overscan}
      components={{ Item: VirtualItem, List: Container, Header, Footer }}
      className={cn('size-full shrink-0', className)}
      itemContent={(index, item) => children(item, index)}
    />
  );
};
