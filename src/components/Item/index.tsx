import { ReactNode } from 'react';

type ItemProps = {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  type?: 'row' | 'col';
  hidden?: boolean;
  className?: string;
};
export const Item = ({ leftContent, rightContent, type = 'row', hidden = false, className }: ItemProps) => {
  if (hidden) {
    return null;
  }
  if (type === 'col') {
    return (
      <div className={`flex flex-col py-2 ${className}`}>
        <div className="font-semibold">{leftContent}</div>
        <div className="mt-2 w-full">{rightContent}</div>
      </div>
    );
  } else {
    return (
      <div className={`flex flex-row items-center py-2 ${className}`}>
        {!!leftContent && <div className={rightContent ? 'font-semibold' : 'w-full'}>{leftContent}</div>}
        {!!rightContent && <div className="ml-auto">{rightContent}</div>}
      </div>
    );
  }
};
