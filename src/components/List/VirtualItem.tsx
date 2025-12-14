import { useEffect, useState } from 'react';
import type { ItemProps as VirtuosoItemProps } from 'react-virtuoso';

type VirtualItemProps<T> = VirtuosoItemProps<T>;

export const VirtualItem = <T,>({ item: _, ...props }: VirtualItemProps<T>) => {
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
};
