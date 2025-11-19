import type { ContextProp as VirtuosoContextProps } from 'react-virtuoso';

export const DEFAULT_OVERSCAN = 10;
export type HeaderProps<T = unknown> = VirtuosoContextProps<T>;
export type FooterProps<T = unknown> = VirtuosoContextProps<T>;

export type ContainerProps = React.HTMLAttributes<HTMLDivElement>;
