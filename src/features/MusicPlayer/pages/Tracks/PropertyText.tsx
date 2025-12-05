import { cn } from '@heroui/react';
import { Link } from 'react-router';

export type TrackPropertyTextProps = {
  link?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};
const TrackPropertyText = ({ link, children, className, onClick }: TrackPropertyTextProps) => {
  const Component = link ? Link : 'div';

  return (
    <Component
      to={link ?? ''}
      onClick={onClick}
      className={cn(
        'text-default-500 flex items-center gap-2 text-small',
        link && 'hover:text-secondary-700 transition-colors cursor-pointer',
        className,
      )}>
      {children}
    </Component>
  );
};
export default TrackPropertyText;
