import { forwardRef, useImperativeHandle, useRef } from 'react';
export type ScrollAreaHandles = {
  scrollToBottom: () => void;
};
type IProps = {
  style?: any;
  className?: any;
  children: any;
};
export const ScrollArea = forwardRef<ScrollAreaHandles, IProps>(({ style, className, children }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
    },
  }));
  return (
    <div ref={scrollRef} style={style} className={`${className} overflow-y-scroll overflow-x-hidden  scroll-smooth`}>
      {children}
    </div>
  );
});
ScrollArea.displayName = 'ScrollArea';
